# Deployment

## Hosting

แอปเป็น static site, deploy ผ่าน **GitHub Pages**

- Repo: `batathai/Supply-franchise`
- Live URL: https://batathai.github.io/Supply-franchise/

Push การเปลี่ยนแปลงขึ้น branch ที่ GitHub Pages ตั้งค่าไว้ (โดยทั่วไปคือ `main` หรือ `gh-pages`) ระบบจะ build/serve อัตโนมัติภายในไม่กี่นาที

## ข้อจำกัดสำคัญของ GitHub Pages

GitHub Pages เป็น static hosting ล้วน **ไม่รองรับ `.env` files หรือ environment variables ตอน runtime** ดังนั้นค่าเชื่อมต่อ Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) ต้อง hardcode ไว้ในไฟล์ config ของแอปโดยตรง ไม่สามารถซ่อนผ่าน env ได้ — ความปลอดภัยต้องพึ่งพา RLS policy ฝั่ง Supabase แทน (ดู [DATABASE.md](./DATABASE.md))

## Config การเชื่อมต่อ Supabase

```
Project URL:  https://ohoropbhdypmomgsqjwt.supabase.co
Anon Key:     (เก็บใน config ของแอป — ดูในไฟล์ source โดยตรง)
```

## Checklist ก่อน Deploy

1. ตรวจสอบว่า Supabase project status เป็น **Active** (ไม่ใช่ Paused)
2. ตรวจสอบว่า RLS policy ของตาราง `invoices` และ `downloads` ถูกตั้งค่าครบ
3. ทดสอบ publish invoice หนึ่งรายการผ่านหน้า HQ แล้วเช็คว่าขึ้นใน Supabase Table Editor
4. ทดสอบ download จากฝั่ง Store ว่าได้ไฟล์ครบและ import เข้า POS ได้

## ฝั่งสาขา (Client-side setup)

### Foxpro (สาขา 30002–30010)
- ไฟล์ที่ดาวน์โหลดต้องตั้งชื่อ `supply.XX` (XX = วันที่ DD ของ invoice) แอปจะตั้งชื่อให้อัตโนมัติแล้ว
- ใช้ `run_foxpro.bat` เพื่อ copy ไฟล์ไปที่ `C:\pos\` และสร้าง shortcut บน Desktop อัตโนมัติในการรันครั้งแรก

### Xstore (สาขา 30011–30016)
- รัน `run_dataloader.bat` บน Desktop เพื่อ import เข้าระบบ

## Rollback

GitHub Pages เก็บประวัติผ่าน git history ปกติ — หาก deploy แล้วมีปัญหา ให้ revert commit ล่าสุดแล้ว push ใหม่ จะ deploy เวอร์ชันก่อนหน้ากลับมาภายในไม่กี่นาที
