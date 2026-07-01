# BATA — ระบบแจ้งเตือนยอดเงินนำส่ง (LINE OA)
**อัปเดตล่าสุด:** 1 กรกฎาคม 2569

> ไฟล์นี้คือจุดเดียวที่ต้องเปิดดู ถ้ากลับมาแก้ระบบนี้ทีหลังแล้วจำรายละเอียดไม่ได้

---

## 1. ระบบนี้ทำอะไร
ทุกวัน เวลา **14:00** และ **17:00 น.** ระบบจะเช็คว่าสาขาไหนยังไม่ส่งยอดเงินนำส่งของเมื่อวาน แล้วส่งสรุปเป็นข้อความเดียว (รวมทุกเขต) เข้ากลุ่ม LINE กลุ่มเดียว

- รอบ 14:00 → แจ้งเฉพาะสาขาที่ **ยังไม่ส่งเลย**
- รอบ 17:00 → แจ้งทั้ง **ยังไม่ส่ง** + **ส่งช้ากว่ากำหนด**

---

## 2. LINE Official Account
| รายการ | ค่า |
|---|---|
| ชื่อ OA | **Botbata.Thailand** |
| Provider | BATA-THAILAND |
| Response mode | Bot only (ปิด Chat แล้ว) |
| Allow bot to join group chats | Enabled |

**Basic ID / จัดการที่:** https://manager.line.biz/ → เลือก OA "Botbata.Thailand"
**Developer Console:** https://developers.line.biz/console/ → Provider BATA-THAILAND → Channel "Botbata.Thailand"

> ⚠️ มี OA เก่าชื่อ **batasupport.thailand** อยู่ด้วย (ใช้แชทคุยงานจริงในกลุ่มเขต 520/530/511 เดิม) — อย่าเผลอไปแก้ค่าตัวนั้น เป็นคนละตัวกัน

---

## 3. กลุ่ม LINE ที่ใช้งานจริงตอนนี้

| รายการ | ค่า |
|---|---|
| กลุ่มที่ใช้ส่งแจ้งเตือน | กลุ่มใหม่ (แทนที่ "เขต511กลุ่มเงินเข้าแบงค์" เดิม) |
| **Group ID ปัจจุบัน** | `C608fa71af1e9bbed1612f9282910e0d0` |

**วิธีหา Group ID ใหม่ (ถ้าย้ายกลุ่มอีกในอนาคต):**
1. เชิญบอท Botbata.Thailand เข้ากลุ่มใหม่
2. เข้า Pipedream → workflow "LINE BATA แจ้งเตือนยอดขาย" → node **trigger** → แท็บ **Events**
3. หา event ล่าสุดที่ `type: "join"` → ดูค่า `source.groupId`

---

## 4. Pipedream (ที่รันโค้ดจริง)

**Project:** bata-thailand (https://pipedream.com)

| Workflow | Trigger | Cron | หน้าที่ |
|---|---|---|---|
| LINE BATA แจ้งเตือนยอดขาย (รอบ 14:00) | Schedule | `0 14 * * *` Asia/Bangkok | แจ้งสาขายังไม่ส่ง |
| LINE BATA แจ้งเตือนยอดขาย (รอบ 17:00) | Schedule | `0 17 * * *` Asia/Bangkok | แจ้งยังไม่ส่ง + ส่งช้า |

**Webhook URL (ใช้ตอนหา groupId เท่านั้น ไม่ใช่ trigger หลักของ workflow ที่รันจริง):**
`https://eohetkz2dqvj02h.m.pipedream.net`

**Code step — Props ที่ต้องตั้งในแต่ละ workflow:**
| Prop | ค่า |
|---|---|
| `supabase_url` | `https://hdgwhhimqugfhhwjakkb.supabase.co` |
| `supabase_service_role_key` | (secret, เก็บใน Pipedream) |
| `line_channel_access_token` | (secret, token ของ Botbata.Thailand — ออกใหม่ทุกครั้งที่เปลี่ยน OA) |
| `line_group_id` | `C608fa71af1e9bbed1612f9282910e0d0` |
| `notify_round` | `14:00` หรือ `17:00` (ต่างกันแค่ค่านี้ระหว่าง 2 workflow) |

**Environment Variable (Project Variables):**
`LINE_CHANNEL_ACCESS_TOKEN` — ใช้แทน token เดิมเวลาสร้าง OA ใหม่

**ไฟล์โค้ดล่าสุด:** `bata_payslip_combined.js` (ส่งรวมทุกเขตเป็นข้อความเดียว)

---

## 5. Supabase (เก็บข้อมูล)

**Project URL:** `https://hdgwhhimqugfhhwjakkb.supabase.co`

| Table | ใช้ทำอะไร |
|---|---|
| `payin_records` | ข้อมูลยอดขาย/เวลาที่แต่ละสาขาส่ง (คอลัมน์หลัก: `store_code`, `submitted_at`, `sales_date`) |
| `notification_log` | กันส่งซ้ำ — เช็คจาก `zone_code='ALL'` + `notify_date` + `notify_type` |
| `stores` | ชื่อสาขา (คอลัมน์: `store_code`, `store_name`) |
| `zone_line_groups` | ⚠️ **ไม่ได้ใช้แล้ว** ตั้งแต่เปลี่ยนมาส่งรวมกลุ่มเดียว (เก็บไว้เฉยๆ ไม่ต้องลบก็ได้) |

**ถ้าอยากทดสอบส่งซ้ำในวันเดิม:**
ลบ record ใน `notification_log` ที่ตรงกับ `notify_date` (ของ "เมื่อวาน" ตามวันที่ทดสอบ) และ `notify_type` (`not_submitted_1400` หรือ `not_submitted_1700`) ก่อน แล้วค่อยรัน workflow ใหม่

---

## 6. งานค้าง / จุดที่ควรปรับปรุงต่อ (Technical Debt)

- [ ] เพิ่มชื่อสาขาที่ยังขึ้นเป็นรหัสซ้ำ ในตาราง `stores`: `51201`, `54024`, `54947`, `74014`
- [ ] ยังไม่มีการแบ่งข้อความอัตโนมัติถ้ายาวเกิน ~5,000 ตัวอักษร (ตอนนี้แค่ warning เฉยๆ)
- [ ] ยังไม่มีระบบแจ้งกลับหาแอดมิน (ตัวเอง) เวลาส่งสำเร็จ/ล้มเหลว — ต้องเข้า Pipedream ไปดู log เอง
- [ ] ยืนยันให้แน่ใจว่า workflow ทั้ง 2 ตัวตั้ง **Schedule trigger** ไว้แล้ว (ไม่ใช่ HTTP trigger ทดสอบค้างอยู่)
- [ ] OA เก่า (batasupport.thailand) กับกลุ่มเขต 511/520/530 เดิม — ยังไม่ได้ตัดสินใจว่าจะทำอะไรต่อ (ปล่อยไว้เฉยๆ ก็ได้ ไม่กระทบระบบใหม่)

---

## 7. ถ้าจะย้ายกลุ่มอีกในอนาคต ต้องแก้ตรงไหนบ้าง
1. เชิญบอทเข้ากลุ่มใหม่ → หา groupId ใหม่ (ดูวิธีในข้อ 3)
2. เข้า Pipedream → ทั้ง 2 workflow (14:00 และ 17:00) → แก้ prop `line_group_id` เป็นค่าใหม่
3. Deploy ทั้ง 2 workflow ใหม่
4. ทดสอบรัน manual ดูก่อนว่าข้อความเข้ากลุ่มใหม่จริง
