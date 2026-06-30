# TODO

## ทำเสร็จแล้ว
- [x] แก้ปัญหา publish error (409 Conflict → เปลี่ยนเป็น upsert)
- [x] แก้ปัญหาไฟล์ไม่ import เข้า Foxpro (รูปแบบชื่อไฟล์ supply.DD)
- [x] เชื่อมต่อ Supabase project จริง
- [x] เขียนเอกสาร README / PROJECT_CONTEXT / DATABASE / DEPLOYMENT / CHANGELOG

## ค้างอยู่ / แนะนำให้ทำต่อ
- [ ] ย้าย RLS policy จาก public insert/select เป็นแบบจำกัดสิทธิ์มากขึ้น (เช่นผูกกับ store_id) เพื่อความปลอดภัยระยะยาว
- [ ] เพิ่มระบบแจ้งเตือนอัตโนมัติเมื่อ Supabase project ใกล้ถูก pause
- [ ] เขียนเทสสำหรับ flow publish → download → import ให้ครอบคลุม
- [ ] พิจารณาย้าย anon key ออกจาก client-side ไปเป็น proxy/Edge Function เพื่อลดความเสี่ยง
- [ ] ทำ dashboard สรุปสถานะ download รายสาขาให้ HQ ดูง่ายขึ้น
- [ ] ตรวจสอบ edge case รูปแบบไฟล์ Xstore (.mnt) ให้ครบทุก grid (C/F/D) ตามที่พบระหว่างการดีบัก
