# CLAUDE.md

คู่มือบริบทโปรเจกต์นี้สำหรับ Claude (หรือคนอื่น) ที่เข้ามาดูแล/แก้โค้ดต่อในอนาคต

## 1. ภาพรวมโปรเจกต์

**BATA Store — ส่ง Payslip** เป็นระบบให้พนักงานสาขาของ BATA Thailand กรอกฟอร์มรายงาน "ยอดเงินนำส่งประจำวัน" (daily cash deposit) ผ่านมือถือ พร้อมแนบรูปสลิปการนำฝากธนาคาร/เคาน์เตอร์เซอร์วิส แล้วให้ฝ่ายบัญชี/HQ ดูสรุปสถานะการส่งของทุกสาขาผ่านหน้า Dashboard

ใช้แก้ปัญหาการติดตามว่าสาขาไหนนำเงินยอดขายเข้าธนาคารแล้วหรือยัง ส่งช้าหรือไม่ ยอดตรงกับระบบ POS (Xstore/Oracle) หรือไม่ และมีการส่งซ้ำ (duplicate) หรือเปล่า — แทนการติดตามด้วยมือ/แชท

**ผู้ใช้งาน 2 กลุ่ม:**
- **พนักงานสาขา**: เปิด `index.html` บนมือถือ เลือกเขต/รหัสสาขา กรอกยอดฝาก เลือกช่องทาง แนบรูปสลิป แล้วกดส่ง
- **ฝ่ายบัญชี/HQ**: เปิด `dashboard/index.html` ดูสถานะการส่งของทุกสาขา (ส่งแล้ว/ยังไม่ส่ง/ส่งช้า/ส่งซ้ำ), เทียบยอดกับ Xstore Cash, export Excel, และมี URL parameter `?zone=XXX` สำหรับให้ DM (District Manager) แต่ละเขตดูได้เฉพาะสาขาในเขตตัวเอง

## 2. สถานะปัจจุบัน

ระบบ **ใช้งานจริงแล้ว** (production) หน้าฟอร์มและ dashboard ทำงานผ่าน Supabase โดยตรง (client-side, ไม่มี backend ของตัวเอง) และมีระบบแจ้งเตือนผ่าน LINE OA ทำงานคู่กันอยู่ (รันบน Pipedream ภายนอก repo นี้ — ดูหัวข้อ 5 และ 6)

**อัปเดต (2026-07-18):** เอกสารเก่าใน `docs/` จำนวน 6 ไฟล์ที่เนื้อหาเป็นของคนละโปรเจกต์ (ระบบแจกจ่าย Invoice/Foxpro/Xstore) ถูกลบออกไปแล้ว เหลือเฉพาะเอกสารที่ตรงกับระบบนี้จริง (ดูหัวข้อ 3 และ 8)

## 3. โครงสร้างไฟล์/โฟลเดอร์หลัก

```
Store_payslip/
├── index.html          # หน้าฟอร์ม "ส่ง Payslip" ที่สาขาใช้งานจริง (production)
│                        # เชื่อม Supabase โดยตรง (ตาราง payin_records, storage bucket payin-slips)
├── dashboard/
│   └── index.html       # หน้า Dashboard สำหรับ HQ/DM ดูสถานะการส่งของทุกสาขา
│                        # เชื่อม Supabase (payin_records, stores) + เรียก Xstore Cash API ภายนอก
├── code.gs              # Google Apps Script — เป็นแนวทาง/เวอร์ชันเก่าที่ดูเหมือน "ไม่ได้ใช้งานจริงแล้ว"
│                        # (ระบบจริงเขียนลง Supabase ตรงๆ ไม่ได้ผ่าน Apps Script/Google Sheets)
│                        # ยังไม่ได้ลบเพราะไม่ 100% ว่าเลิกใช้แล้วจริง — ดูหัวข้อ 6.2
├── SETUP_GUIDE.md       # คู่มือติดตั้งคู่กับ code.gs — อธิบายสถาปัตยกรรมเก่า (Google Sheets/Drive)
│                        # ไม่ตรงกับ index.html ปัจจุบันที่ใช้ Supabase ตรง — ดูหัวข้อ 6.2
├── CNAME                # กำหนด custom domain ของ GitHub Pages: store-payslip.batathai.com
├── docs/
│   ├── SETUP_GUIDE.md   # สำเนาเดียวกับไฟล์ที่ root
│   └── BATA_LINE_แจ้งเตือนยอดขาย_คู่มืออ้างอิง.md
│                        # เอกสารที่ตรงกับระบบจริง — อธิบายระบบแจ้งเตือน LINE OA ที่รันบน
│                        # Pipedream (นอก repo นี้) คอยเช็คสาขาที่ยังไม่ส่งยอด แล้วส่งเข้ากลุ่ม LINE
└── CLAUDE.md            # ไฟล์นี้
```

> ลบไปแล้วเมื่อ 2026-07-18: `docs/PROJECT_CONTEXT.md`, `docs/DATABASE.md`, `docs/DEPLOYMENT.md`, `docs/README.md`, `docs/CHANGELOG.md`, `docs/TODO.md` — ทั้งหมดเป็นเอกสารของระบบแจกจ่าย Invoice ไปสาขาแฟรนไชส์ผ่าน Foxpro/Xstore POS (repo `Supply-franchise`, Supabase project คนละตัว) ซึ่งไม่เกี่ยวกับ repo นี้เลย ดูรายละเอียดในหัวข้อ 8 (Changelog)

## 4. Tech Stack

- **Frontend**: Static HTML/CSS/JavaScript ล้วน (vanilla JS, ไม่มี framework, ไม่มี build step)
- **Hosting**: GitHub Pages พร้อม custom domain `store-payslip.batathai.com` (ดูไฟล์ `CNAME`)
- **Backend/Database**: [Supabase](https://supabase.com) (Postgres + REST API + Storage) เรียกตรงจาก client ผ่าน `@supabase/supabase-js@2` (โหลดจาก CDN `jsdelivr`)
  - Project URL ที่ใช้งานจริง: `https://hdgwhhimqugfhhwjakkb.supabase.co`
  - Anon key hardcode อยู่ใน `<script>` ของทั้ง `index.html` และ `dashboard/index.html` (ไม่ใช่ความลับระดับสูง เพราะออกแบบมาให้ใช้ client-side ได้ แต่ต้องพึ่ง RLS policy คุมสิทธิ์)
- **Storage**: Supabase Storage bucket ชื่อ `payin-slips` สำหรับเก็บรูปสลิป (มีการบีบอัดรูปฝั่ง client ก่อนอัปโหลด — resize ให้กว้างไม่เกิน 1280px และแปลงเป็น JPEG quality 0.75 เพื่อลดขนาดไฟล์)
- **Chart/Export ใน Dashboard**: [Chart.js 4.4.1](https://www.chartjs.org/) (กราฟ trend/district/donut), [SheetJS (xlsx) 0.18.5](https://sheetjs.com/) (export Excel) — โหลดจาก `cdnjs`
- **External API**: Xstore/Oracle Cash API ภายนอก (`https://192.1.36.59:5001`) — Flask/Python API ชื่อ `2_sales_api.py` (ไม่ได้อยู่ใน repo นี้) ที่ dashboard เรียกไปเทียบยอดเงินสดจริงในระบบ POS กับยอดที่สาขากรอก
- **Automation ภายนอก**: [Pipedream](https://pipedream.com) รัน scheduled workflow เรียก Supabase + LINE Messaging API เพื่อแจ้งเตือนสาขาที่ยังไม่ส่งยอด (ดูหัวข้อ 6)
- **ไม่มี**: build tool, package manager (npm/yarn), test suite, CI/CD ใดๆ — deploy คือ push ไฟล์ HTML ขึ้น GitHub Pages ตรงๆ

## 5. เหตุผลการออกแบบสำคัญที่ควรรู้ก่อนแก้โค้ด

1. **ทำไมเป็น static HTML ไม่มี backend เอง** — ใช้ Supabase เป็นทั้งฐานข้อมูลและ API ชั้นเดียว เพื่อไม่ต้องดูแล server, deploy ผ่าน GitHub Pages ได้ฟรี ความปลอดภัยพึ่ง RLS policy ของ Supabase (ยังไม่ได้ตรวจสอบ policy จริงจาก dashboard ของ Supabase — ควรตรวจก่อนแก้ logic ที่เกี่ยวกับสิทธิ์)

2. **`payin_records` เป็นตารางหลัก** เก็บ 1 แถวต่อการส่งฟอร์ม 1 ครั้ง คอลัมน์สำคัญที่พบในโค้ด: `zone_code`, `store_code`, `deposit_date`, `sales_date`, `amount`, `channel`, `channel_detail`, `slip_path`, `slip_url`, `submitted_at`, `duplicate_status`, `duplicate_group_id`, `duplicate_reason` — schema นี้อนุมานจากโค้ด JS เท่านั้น ไม่มีเอกสาร schema อย่างเป็นทางการใน repo

3. **การจัดการ "ส่งซ้ำ" ไม่ได้ป้องกันด้วย unique constraint แบบ block แต่ปล่อยให้บันทึกซ้ำแล้วให้คนตรวจทีหลัง** — ถ้าสาขาส่งยอดวันเดียวกันมากกว่า 1 ครั้ง ระบบจะไม่ error แต่ dashboard จะจัดกลุ่มเป็น "Duplicate" ให้ HQ กดเลือกว่ารายการไหนถูกต้อง (ผ่าน RPC `resolve_duplicate` และ `detect_and_group_duplicates` ซึ่งเป็น Postgres function ที่ตั้งไว้ฝั่ง Supabase — โค้ดฟังก์ชันเหล่านี้ไม่ได้เก็บอยู่ใน repo นี้ ถ้าต้องแก้ logic การจับ duplicate ต้องเข้าไปดู/แก้ที่ Supabase SQL Editor โดยตรง)

4. **Deadline/สถานะการส่งคำนวณจาก sales_date + 1 วัน เวลา 14:00 ไทย (07:00 UTC)** — ดู logic ใน `getStoreStatus()` ของ `dashboard/index.html` สถานะมี 5 แบบ: `sent` (ส่งตรงเวลา), `late` (ส่งช้ากว่า deadline), `missing` (ยังไม่ถึง deadline และยังไม่ส่ง), `delay` (เลย deadline แล้วยังไม่ส่ง), `duplicate` (ส่งมากกว่า 1 ครั้งในวันเดียว)

5. **Dashboard รองรับ 2 โหมดผ่าน URL parameter `?zone=`** — ถ้าไม่มี parameter = โหมด "Accounting" (เห็นทุกเขต, filter ได้อิสระ) ถ้ามี `?zone=530` เช่น = โหมด "DM" (District Manager) ที่ล็อกให้เห็นเฉพาะสาขาในเขตนั้น และซ่อน UI บางส่วน (district chart, zone filter) — เวลาแจก link ให้ DM แต่ละคน ต้องแนบ query string นี้ให้ถูกเขต

6. **รูปสลิปถูกบีบอัดฝั่ง client ก่อนอัปโหลดเสมอ** (`compressImage()`) เพื่อลด storage/bandwidth และแปลงเป็น `.jpg` เสมอไม่ว่าไฟล์ต้นทางเป็นนามสกุลอะไร — ถ้า browser บีบอัดไม่ได้ (พบบ่อยกับไฟล์ HEIC จาก iPhone) จะแจ้ง error ให้ผู้ใช้ถ่ายใหม่แทนที่จะพยายามอัปโหลดไฟล์ดิบ

7. **Xstore Cash API ใช้ HTTPS self-signed certificate** — ผู้ใช้ dashboard ต้องเปิด `https://192.1.36.59:5001/api/health` ในเบราว์เซอร์อย่างน้อย 1 ครั้งเพื่อกด "Advanced → Proceed" ยอมรับ certificate ก่อน ไม่งั้นการเรียก fetch จาก dashboard จะถูกเบราว์เซอร์บล็อกเงียบๆ (ดู comment ในโค้ด `dashboard/index.html`)

8. **จำกัดวันย้อนหลังที่กรอกได้ไม่เกิน 7 วัน** (`MAX_BACKDATE_DAYS`) ในฟอร์ม `index.html` เพื่อกันการกรอกข้อมูลเก่าเกินไป

9. **ข้อมูลเขต/รหัสสาขา/ชื่อสาขา (`ZONE_BRANCHES`, `STORE_NAMES`) hardcode ซ้ำอยู่ทั้งใน `index.html` และ `dashboard/index.html` แยกกันคนละชุด** — สังเกตว่ารายชื่อสาขาในสองไฟล์ "ไม่เหมือนกันทุกตัว" (เช่น `51201` vs `51410` ในเขต 513) ถ้าเพิ่ม/ย้ายสาขาใหม่ ต้องแก้ทั้ง 2 ไฟล์ให้ตรงกัน ไม่งั้น dashboard กับฟอร์มจะเห็นรายชื่อสาขาไม่ตรงกัน

## 6. จุดที่ต้องระวัง / Known Issues

1. **`code.gs` และ `SETUP_GUIDE.md` (ทั้งที่ root และใน `docs/`) อธิบายสถาปัตยกรรมเก่า/ทางเลือก** ที่ใช้ Google Apps Script เขียนลง Google Sheets + Google Drive แทน Supabase — แต่ `index.html` ที่ใช้งานจริงตอนนี้เขียนลง Supabase (`payin_records` + storage bucket `payin-slips`) โดยตรง ไม่ได้เรียก Google Apps Script เลย (`SCRIPT_URL` ที่พูดถึงใน `SETUP_GUIDE.md` ไม่มีอยู่ใน `index.html` ปัจจุบัน) ไม่แน่ใจว่า `code.gs` ยัง deploy ใช้งานอยู่จริงหรือเป็นแค่ของเก่าที่ทิ้งไว้ — **ยังไม่ได้ลบไฟล์เหล่านี้** เพราะไม่มั่นใจ 100% ว่าเลิกใช้แล้วจริง ควรถามเจ้าของระบบให้ชัดก่อนลบทิ้งหรือแก้ไข

2. **Anon key ของ Supabase hardcode อยู่ในโค้ด client-side ทั้งสองไฟล์หลัก** — ตามการออกแบบของ Supabase เรื่องนี้ยอมรับได้ถ้า RLS policy ตั้งไว้รัดกุม แต่ยังไม่มีเอกสารยืนยัน RLS policy ที่ใช้งานจริงกับ `payin_records`/`stores`/`storage.objects` ใน repo นี้ — ควรตรวจสอบใน Supabase Dashboard ก่อนเชื่อว่าปลอดภัย

3. **ไม่มีการทดสอบอัตโนมัติ (no tests) และไม่มี CI/CD** — การเปลี่ยนแปลงใดๆ ต้องทดสอบมือผ่านการเปิดหน้าเว็บจริงและกรอกฟอร์มทดสอบ

4. **โค้ด schema ของฐานข้อมูล/ฟังก์ชัน RPC (`resolve_duplicate`, `detect_and_group_duplicates`) ไม่ได้เก็บเป็นไฟล์ migration ใน repo นี้** — อยู่ในฝั่ง Supabase เท่านั้น ถ้าต้อง reproduce ฐานข้อมูลใหม่หรือ debug logic การจับ duplicate จะต้องเข้าถึง Supabase Dashboard/SQL Editor โดยตรง

5. **Xstore Cash API (`192.1.36.59:5001`) เป็น IP ภายในองค์กร ใช้ self-signed certificate** — ถ้าเปลี่ยนเครื่อง/เปลี่ยน IP ต้องแก้ `XSTORE_API_BASE` ใน `dashboard/index.html` และแจ้งผู้ใช้ให้ไป accept certificate ใหม่อีกครั้ง มิฉะนั้นคอลัมน์ Xstore Cash ในหน้า dashboard จะไม่ขึ้นข้อมูล (เงียบๆ ไม่มี error ชัดเจนให้ผู้ใช้ทั่วไปเห็น)

6. **รายชื่อ/รหัสสาขาใน `ZONE_BRANCHES`/`STORE_NAMES` ต่างกันเล็กน้อยระหว่าง `index.html` และ `dashboard/index.html`** (ดูหัวข้อ 5.9) — เป็นความเสี่ยงที่ข้อมูลจะ drift ห่างกันมากขึ้นเรื่อยๆ ถ้าไม่มี process อัปเดตพร้อมกันทั้ง 2 ไฟล์

7. **ระบบแจ้งเตือน LINE (Pipedream) อยู่นอก repo นี้ทั้งหมด** — โค้ด `bata_payslip_combined.js`, workflow schedule, secrets (LINE token, Supabase service role key) ถูกเก็บไว้ใน Pipedream ไม่ได้ version control ร่วมกับ repo นี้ ถ้าต้องแก้ไขต้องเข้า Pipedream โดยตรง (ดูรายละเอียดใน `docs/BATA_LINE_แจ้งเตือนยอดขาย_คู่มืออ้างอิง.md`)

## 7. วิธีรัน / Build / Deploy

**ไม่มี build step** — เป็น static HTML ล้วน

### รันดูตอน dev (local)
เปิดไฟล์ `index.html` หรือ `dashboard/index.html` ตรงๆ ในเบราว์เซอร์ หรือรัน local server ง่ายๆ เช่น:
```bash
python3 -m http.server 8000
# แล้วเปิด http://localhost:8000/index.html หรือ http://localhost:8000/dashboard/index.html
```
หมายเหตุ: เนื่องจากเชื่อม Supabase จริงตรงๆ การทดสอบ local จะเขียน/อ่านข้อมูลจริงในฐานข้อมูล production ไม่มี environment แยกสำหรับ staging — ควรระวังเวลาทดสอบการส่งฟอร์ม

### Deploy
Deploy ผ่าน **GitHub Pages**:
1. Push การเปลี่ยนแปลงขึ้น branch `main`
2. GitHub Pages (ตั้งค่าใน repo Settings → Pages) จะ build/serve อัตโนมัติภายในไม่กี่นาที
3. Custom domain `store-payslip.batathai.com` ผูกไว้ผ่านไฟล์ `CNAME` แล้ว

### Checklist ก่อน deploy
1. ตรวจสอบว่า Supabase project (`hdgwhhimqugfhhwjakkb.supabase.co`) status เป็น Active
2. ทดสอบส่งฟอร์มจริง 1 รายการจาก `index.html` แล้วเช็คว่าขึ้นในตาราง `payin_records`
3. เปิด `dashboard/index.html` เช็คว่าเห็นรายการที่เพิ่งส่งไป และกราฟ/metric อัปเดตถูกต้อง
4. ถ้าแก้รายชื่อ/รหัสสาขา ต้องแก้ทั้ง `index.html` และ `dashboard/index.html` ให้ตรงกัน (ดูหัวข้อ 6.6)

### Rollback
GitHub Pages ใช้ git history ปกติ — ถ้า deploy แล้วมีปัญหา ให้ revert commit ล่าสุดแล้ว push ใหม่

## 8. Changelog

- **2026-07-18** — ลบไฟล์เอกสารเก่าที่ไม่เกี่ยวกับระบบนี้ 6 ไฟล์ออกจาก `docs/`: `PROJECT_CONTEXT.md`, `DATABASE.md`, `DEPLOYMENT.md`, `README.md`, `CHANGELOG.md`, `TODO.md` — ทั้งหมดบรรยายระบบแจกจ่าย Invoice ไปสาขาแฟรนไชส์ผ่าน Foxpro/Xstore POS (repo `Supply-franchise`, Supabase project `ohoropbhdypmomgsqjwt.supabase.co`) ซึ่งเป็นคนละโปรเจกต์กับ `Store_payslip` นี้โดยสิ้นเชิง สันนิษฐานว่าถูก copy มาผิด repo จึงลบทิ้งตามคำขอของเจ้าของโปรเจกต์ (ยังไม่ลบ `code.gs`/`SETUP_GUIDE.md` เพราะไม่แน่ใจว่าเลิกใช้จริงหรือยัง — ดูหัวข้อ 6.1)
- **สร้างไฟล์นี้ครั้งแรกวันที่ 18 กรกฎาคม 2569 (2026-07-18)** โดย Claude — สร้างจากการอ่านโค้ดทั้งหมดใน repo ณ ขณะนั้น (commit `1de16e9`) เพื่อบันทึกบริบทโปรเจกต์ให้คนที่เข้ามาดูแลต่อเข้าใจภาพรวมได้เร็วขึ้น และตั้งข้อสังเกตสำคัญเรื่องเอกสารใน `docs/` ที่ไม่ตรงกับระบบจริง
