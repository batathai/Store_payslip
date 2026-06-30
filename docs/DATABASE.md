# Database — Supabase

**Project URL:** `https://ohoropbhdypmomgsqjwt.supabase.co`
**Dashboard:** https://supabase.com/dashboard

## ตาราง `invoices`

เก็บข้อมูล Invoice ที่ HQ Publish ขึ้นมา

| Column | Type | หมายเหตุ |
|---|---|---|
| id | uuid (PK) | default `gen_random_uuid()` |
| po | text (unique) | เลขที่ใบสั่งซื้อ |
| date_iso | text | วันที่ invoice |
| qty | integer | จำนวนรวม |
| styles | integer | จำนวน style |
| supply_text | text | เนื้อหาไฟล์ supply ดิบ |
| published_at | timestamptz | default `now()` |

## ตาราง `downloads`

บันทึก log ทุกครั้งที่สาขา download invoice

| Column | Type | หมายเหตุ |
|---|---|---|
| id | uuid (PK) | default `gen_random_uuid()` |
| po | text | อ้างอิงเลข PO |
| store_id | text | รหัสสาขา |
| store_type | text | `foxpro` หรือ `xstore` |
| qty | integer | จำนวนที่ดาวน์โหลด |
| filename | text | ชื่อไฟล์ที่สร้างให้สาขา |
| downloaded_at | timestamptz | default `now()` |

## Row Level Security (RLS)

ทั้งสองตารางเปิด RLS และอนุญาตแบบ public เนื่องจากแอปเป็น static HTML ไม่มี backend คอยตรวจสิทธิ์

```sql
alter table invoices enable row level security;
alter table downloads enable row level security;

create policy "public read invoices" on invoices for select using (true);
create policy "public insert invoices" on invoices for insert with check (true);
create policy "public delete invoices" on invoices for delete using (true);

create policy "public read downloads" on downloads for select using (true);
create policy "public insert downloads" on downloads for insert with check (true);
```

> หากเจอ error 401 Unauthorized ตอน publish ให้ตรวจสอบว่า RLS policy ด้านบนถูกสร้างไว้ครบ หากจำเป็นเร่งด่วนสามารถปิด RLS ชั่วคราวด้วย `ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;` แต่ไม่แนะนำสำหรับ production ระยะยาว

## Insert ข้อมูล: ใช้ upsert ไม่ใช่ insert

เพื่อป้องกัน error 409 Conflict เวลา publish invoice ที่มี PO ซ้ำของเดิม (เช่น publish ซ้ำหรือแก้ไขข้อมูล) ฝั่งแอปต้องเรียกด้วย `upsert` แทน `insert`:

```javascript
// ❌ จะ error 409 ถ้า PO ซ้ำ
supabase.from('invoices').insert(data)

// ✅ อัปเดตทับถ้าซ้ำ ไม่สร้างข้อมูลเบิ้ล
supabase.from('invoices').upsert(data, { onConflict: 'id' })
```

## ปัญหาที่พบบ่อยเกี่ยวกับฐานข้อมูล

| ปัญหา | สาเหตุ | วิธีแก้ |
|---|---|---|
| Supabase project paused | Free tier pause อัตโนมัติเมื่อไม่ได้ใช้งานนาน | เข้า Dashboard → กด "Restore project" |
| 401 Unauthorized ตอน publish | RLS policy ไม่ครบ/ไม่ถูกต้อง | รัน SQL policy ด้านบนใน SQL Editor |
| 409 Conflict ตอน publish | ใช้ insert กับข้อมูลที่ PO ซ้ำของเดิม | เปลี่ยนเป็น upsert |
