# Changelog

รายการเปลี่ยนแปลงของโปรเจกต์ BATA Store — ส่ง Payslip เรียงจากล่าสุดไปเก่าสุด (รายละเอียดเชิงลึก/บริบทการตัดสินใจ ดูใน [LOG.md](LOG.md))

## 2026-08-22

- **แก้ Gmail SMTP App Password หมดอายุใน Pipedream workflow `bata-line-notify-14-00`/`bata-line-notify-17-00`** — ทำให้ step ส่งอีเมลสำรอง (`skip_email_if_line_ok_js`) error ทุกวันตั้งแต่ 16 ส.ค. สร้าง App Password ใหม่จาก Google Account แล้วอัปเดตใน Pipedream
- **ปรับ logic ให้ส่งอีเมลควบคู่กับ LINE เสมอ** (เดิมส่งเฉพาะตอน LINE ล้มเหลวเป็น fallback) — ตัดเงื่อนไข `if (lineSentOk === true) { $.flow.exit(...) }` ออก เพื่อให้ผู้บริหารได้รับอีเมลแจ้งเตือนทุกวันคู่กับกลุ่ม LINE
- **แก้ปัญหา Supabase Storage เกินโควตา (error 402 `exceed_storage_size_quota`)** — โปรเจกต์ทั้งหมดถูกจำกัดสิทธิ์ (ฟอร์ม/Dashboard ใช้งานไม่ได้) แก้โดยอัปเกรด org เป็น **Pro plan**
- **สำรองข้อมูล Supabase ทั้งหมด** (ตาราง `payin_records`, `stores`, `xstore_cash_daily`, `zone_line_groups`, `notification_log`, `v_duplicate_pending_groups` + รูปสลิป 10,219+ ไฟล์) ไว้ที่เครื่อง local เตรียมย้ายขึ้น Google Drive — ดูสคริปต์ `6_backup_supabase.py`/`7_cleanup_old_records.py` (นอก repo นี้ อยู่ที่โฟลเดอร์ `PaySlip - Payment`)
- **อัปเดตรหัส/สถานะสาขาตามไฟล์ `Store Open-Close 2026.xlsx`**:
  - สาขาที่ปิดจริง 9 แห่ง (51201, 54024, 54947, 53018, 51512, 51906, 53035, 74014, 53948) — เพิ่มชื่อ **"(C) - DD/MM/YY"** เป็น label ใต้ชื่อสาขาใน dashboard เท่านั้น **ไม่ตัดสิทธิ์ส่งยอด/ไม่ซ่อนจาก tracking**
  - สาขาที่เปลี่ยนรหัส 5 คู่ (52008→52021, 51410→51406, 51545→51501, 53038→53001, 54004→54096) — รหัสใหม่ใช้งานได้ในฟอร์ม, รหัสเก่าเอาออกจากฟอร์ม (`index.html`) แต่ยังอยู่ใน dashboard เพื่อดูประวัติเก่า
  - **53958 (บิ๊กซี ขอนแก่น) ยืนยันแล้วว่ายังไม่ปิด** — เคยตั้งปิดผิดพลาดตามไฟล์ Excel แล้ว revert คืน
- **แก้ bug เดิมของ dashboard: `allStoresList` ถูกสร้างก่อน `storeNameMap` โหลดข้อมูลจาก Supabase เสร็จ** ทำให้ชื่อสาขาที่อัปเดตในตาราง `stores` ไม่เคยแสดงผลจริง (รวมถึง "(C)" ที่เคยตั้งไว้ก่อนหน้านี้) — ย้ายการ build `allStoresList` เข้าไปใน `loadData()` หลังโหลดชื่อเสร็จ
- **แสดง "(C) - วันที่" เป็นบรรทัดเล็กใต้ชื่อสาขาแทนการต่อรวมในบรรทัดเดียว** กันปัญหาชื่อยาวถูกตัด (`...`) ในตาราง dashboard
- **ซิงค์ `ZONE_BRANCHES`/`STORE_NAMES` ระหว่าง `index.html` และ `dashboard/index.html` ให้ตรงกัน** (ปัญหาที่ CLAUDE.md หัวข้อ 5.9/6.5 เคยตั้งข้อสังเกตไว้ว่าสองไฟล์ไม่ตรงกัน) — ปัจจุบันสองไฟล์มีรหัสสาขาตรงกันหมดยกเว้นจุดที่ตั้งใจให้ต่าง (รหัสเก่าที่ถูกแทนที่ เก็บไว้แค่ฝั่ง dashboard)

## 2026-08-21

- ค้นพบ project `Payslip-Bata` ใน Supabase ("1batathai's Org") ถูกจำกัดสิทธิ์เนื่องจากเกินโควตา Storage ของ Free plan — เริ่มกระบวนการสำรองข้อมูลก่อนพิจารณาลบข้อมูลเก่า
