# Changelog

รูปแบบอ้างอิงตาม [Keep a Changelog](https://keepachangelog.com/)

## [Unreleased]
### Docs
- เพิ่มชุดเอกสารโปรเจกต์ครบชุด: README, PROJECT_CONTEXT, DATABASE, DEPLOYMENT, TODO (project closing procedure)

## [2026-06-22]
### Fixed
- แก้ปัญหา "Failed to publish. Check Supabase connection." ซึ่งแท้จริงเกิดจาก error 409 Conflict จากการ insert ข้อมูลซ้ำ — เปลี่ยนจาก `insert` เป็น `upsert` (onConflict: 'id') เพื่อให้ publish ซ้ำได้โดยไม่เกิด error และไม่ทำให้ข้อมูลเบิ้ล
- แก้ปัญหาไฟล์ supply ไม่ import เข้า Foxpro: พบว่าต้องตั้งชื่อไฟล์เป็น `supply.XX` โดย `XX` คือวันที่ (DD) ของวันที่บน invoice ปรับ `run_foxpro.bat` ให้ดึงวันที่จากไฟล์มาตั้งชื่ออัตโนมัติ

### Added
- เพิ่ม auto-create Desktop shortcut ใน `run_foxpro.bat` สำหรับให้สาขาเรียกใช้งานง่ายขึ้น
- เพิ่มเอกสาร README สำหรับพอร์ทัล พร้อมตาราง troubleshooting และ quick reference

### Changed
- เชื่อมต่อพอร์ทัลกับ Supabase project จริง (`ohoropbhdypmomgsqjwt.supabase.co`) แทน config เดิม

## [Earlier]
### Added
- สร้างตาราง `invoices` และ `downloads` บน Supabase พร้อม RLS policy แบบ public read/insert สำหรับการเรียกใช้งานจาก static HTML โดยไม่มี backend
- เริ่มต้นแอปแปลงไฟล์ supply.txt → .mnt สำหรับ Foxpro/Xstore
