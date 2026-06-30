# Bata Franchise — Invoice Portal

ระบบจัดการและกระจาย Invoice จาก HQ ไปยังสาขาแฟรนไชส์ (Foxpro / Xstore) ผ่านเว็บพอร์ทัล โดยใช้ Supabase เป็นฐานข้อมูลกลาง

**Live:** https://batathai.github.io/Supply-franchise/

## ภาพรวมระบบ

- **HQ** อัปโหลดไฟล์ supply แล้ว Publish ขึ้น Supabase
- **สาขา** เข้าพอร์ทัล เลือก Store ID แล้ว Download ไฟล์ invoice เฉพาะของตัวเอง
- ระบบรองรับ 2 ประเภท POS:
  - **Foxpro** (สาขา 30002–30010): ไฟล์ที่ดาวน์โหลดต้องตั้งชื่อ `supply.XX` โดย `XX` คือวันที่ (DD) ของวันที่บนใบ invoice แล้ว copy ไปที่ `C:\pos\` เพื่อ import
  - **Xstore** (สาขา 30011–30016): รัน `run_dataloader.bat` บน Desktop

## โครงสร้างหลัก

| ส่วน | รายละเอียด |
|---|---|
| Frontend | Static HTML/JS, deploy บน GitHub Pages |
| Backend/DB | Supabase (Postgres + REST API) |
| ตาราง | `invoices`, `downloads` |
| POS Integration | `run_foxpro.bat` (auto-detect วันที่จากชื่อไฟล์), `run_dataloader.bat` |

## เริ่มต้นใช้งานเร็ว

1. เปิดพอร์ทัล → คลิก **Store**
2. เลือก Store ID จาก dropdown
3. ติ๊กเลือก invoice ที่ต้องการ → คลิก **⬇ Download**
4. **Foxpro:** copy ไฟล์ `.txt` ไปที่ `C:\pos\` แล้วรัน Foxpro import
5. **Xstore:** รัน `run_dataloader.bat` บน Desktop

## เอกสารที่เกี่ยวข้อง

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — บริบทโปรเจกต์และการตัดสินใจทางเทคนิค
- [DATABASE.md](./DATABASE.md) — โครงสร้างฐานข้อมูล Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) — ขั้นตอน deploy และ config
- [CHANGELOG.md](./CHANGELOG.md) — ประวัติการเปลี่ยนแปลง

## Quick Reference

| Item | Value |
|---|---|
| Foxpro Stores | `30002` – `30010` |
| Xstore Stores | `30011` – `30016` |
| Foxpro file path | `C:\pos\` |
| Xstore import tool | `run_dataloader.bat` |
| Database Dashboard | https://supabase.com/dashboard |
