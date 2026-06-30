# Project Context

## เป้าหมายโปรเจกต์

สร้างระบบกระจาย Invoice จาก HQ (Bata Thailand) ไปยังสาขาแฟรนไชส์ทั่วประเทศ แทนวิธีเดิมที่ใช้การส่งไฟล์ด้วยตนเอง โดยให้แต่ละสาขาเข้ามาดาวน์โหลด invoice ของตัวเองผ่านเว็บพอร์ทัล และนำไฟล์เข้าระบบ POS ของสาขา (Foxpro หรือ Xstore แล้วแต่สาขา)

## บริบทสำคัญ / การตัดสินใจ

### 1. เลือก Supabase เป็นฐานข้อมูล
เหตุผล: ฟรีสำหรับโปรเจกต์ขนาดเล็ก, มี realtime database ให้ทุกสาขาเห็นสถานะตรงกัน, มี REST API เรียกตรงจาก HTML ได้โดยไม่ต้องมี backend แยก, และมี Dashboard ให้ HQ ดู log ได้

### 2. Hosting แบบ Static บน GitHub Pages
แอปเป็น static HTML/JS ล้วน ไม่มี server ฝั่ง backend — ข้อจำกัดสำคัญคือ GitHub Pages ไม่รองรับ `.env` files ดังนั้นค่า `SUPABASE_URL` และ `SUPABASE_ANON_KEY` ต้อง hardcode ไว้ใน config ของแอปโดยตรง (ไม่ใช่ความลับระดับสูง เพราะ anon key ออกแบบมาให้ใช้ฝั่ง client ได้ แต่ต้องพึ่ง RLS policy ในการควบคุมสิทธิ์)

### 3. ปัญหาการ insert ซ้ำ → เปลี่ยนเป็น upsert
ช่วงแรกใช้ `insert` ตรงๆ ทำให้เจอ error 409 Conflict เวลา publish invoice เดิมซ้ำ (เช่นกด publish ซ้ำ หรือแก้ไขไฟล์เดิม) แก้โดยเปลี่ยนเป็น `supabase.from('invoices').upsert(data, { onConflict: 'id' })` ซึ่ง update record เดิมแทนที่จะสร้างใหม่ ป้องกันข้อมูลเบิ้ล

### 4. ปัญหาไฟล์ Foxpro import ไม่สำเร็จ
ใช้เวลาดีบักนานก่อนพบว่า Foxpro ต้องการชื่อไฟล์รูปแบบ `supply.XX` (นามสกุลเป็นตัวเลข ไม่ใช่ `.txt` หรือไม่มีนามสกุล) และเลข `XX` คือ**วันที่ (DD)** ของวันที่บน invoice นั้น เช่น invoice ลงวันที่ 16/06/2026 ต้องตั้งชื่อไฟล์เป็น `supply.16` ความเข้าใจนี้นำไปแก้ `run_foxpro.bat` ให้ดึงวันที่จากไฟล์มาตั้งชื่ออัตโนมัติ

### 5. แยกประเภทสาขาตาม POS
สาขาแบ่งเป็น 2 กลุ่มตามระบบ POS ที่ใช้ (Foxpro: 30002–30010, Xstore: 30011–30016) แต่ละกลุ่มมีขั้นตอน import ไฟล์ต่างกัน พอร์ทัลจึงต้องแสดงคำแนะนำต่างกันตาม Store ID ที่เลือก

## ปัญหาที่เคยพบและแก้แล้ว

| ปัญหา | สาเหตุ | สถานะ |
|---|---|---|
| Failed to publish. Check Supabase connection. | จริงๆ คือ 409 Conflict จากข้อมูลซ้ำ ไม่ใช่ connection ล้มเหลว | แก้แล้ว (เปลี่ยนเป็น upsert) |
| Foxpro import ไม่เข้า | ชื่อไฟล์ผิดรูปแบบ ต้องเป็น `supply.DD` | แก้แล้ว |
| Supabase project paused | Free tier pause อัตโนมัติเมื่อไม่ใช้งานนาน | ต้องเข้าไป Restore project ด้วยตนเองเมื่อเจอ |
| RLS บล็อกการ publish | Row Level Security ไม่ได้เปิด policy ให้ insert/select | แก้โดยตั้ง policy public read/insert บนตาราง invoices/downloads |

## ผู้ใช้งานระบบ

- **HQ**: อัปโหลดและ publish invoice, ดู dashboard การ download ของแต่ละสาขา
- **สาขา**: ดาวน์โหลด invoice เฉพาะของสาขาตัวเอง, นำเข้าระบบ POS

## สถานะล่าสุด (2026-06-30)

ระบบทำงานได้ปกติ ปัญหาหลัก (publish error, Foxpro import) ได้รับการแก้ไขแล้ว เอกสารโปรเจกต์ถูกจัดทำขึ้นครบชุด (README, DATABASE, DEPLOYMENT, CHANGELOG, TODO) เพื่อให้คนที่เข้ามาดูแลต่อเข้าใจบริบทได้ทันที งานที่เหลือเป็นเรื่องการเสริมความปลอดภัยและ UX ดู [TODO.md](./TODO.md) สำหรับรายการที่ยังค้าง
