# คู่มือติดตั้ง — Store Payin Slip (BATA Thailand)

ระบบนี้มี 2 ไฟล์หลัก ทำงานร่วมกัน:

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าฟอร์มที่สาขาเปิดบนมือถือเพื่อกรอกข้อมูล + อัปโหลดรูปสลิป |
| `code.gs` | สคริปต์ฝั่งหลังบ้าน (รันบน Google Apps Script) รับข้อมูลจากฟอร์ม แล้วเขียนลง Google Sheets และเก็บรูปใน Google Drive |

ไม่ต้องมีเซิร์ฟเวอร์ของตัวเอง ไม่ต้องพึ่ง IT หรือ Azure ทุกอย่างรันบน Google account ของคุณเอง (ใช้ฟรี)

---

## ส่วนที่ 1 — เตรียม Google Sheets + Apps Script (ทำครั้งเดียว)

### 1.1 สร้าง Google Sheet ใหม่
1. เปิด https://sheets.google.com
2. สร้างไฟล์ใหม่ ตั้งชื่อ เช่น **"BATA Store Payin Records"**

### 1.2 สร้าง Google Drive Folder สำหรับเก็บรูปสลิป
1. เปิด https://drive.google.com
2. สร้างโฟลเดอร์ใหม่ ตั้งชื่อ เช่น **"BATA Payin Slips"**
3. เปิดโฟลเดอร์นั้น ดู URL บน address bar จะมีรูปแบบ:
   `https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz`
4. คัดลอกส่วนท้าย (เช่น `1AbCdEfGhIjKlMnOpQrStUvWxYz`) — นี่คือ **Folder ID** ที่ต้องใช้ในขั้นตอนต่อไป

### 1.3 เปิด Apps Script ในชีต
1. กลับไปที่ Google Sheet ที่สร้างไว้ในขั้นตอน 1.1
2. เมนูบนสุด คลิก **Extensions (ส่วนขยาย) → Apps Script**
3. จะเปิดแท็บใหม่ เป็นหน้าแก้ไขโค้ด (พื้นหลังเป็นไฟล์ `Code.gs` เปล่าๆ)
4. ลบโค้ดเดิมทั้งหมดในหน้านั้น แล้ว **paste โค้ดทั้งหมดจากไฟล์ `code.gs`** ที่ผมสร้างให้

### 1.4 ใส่ Folder ID ของคุณ
ในโค้ดที่ paste ไป หาบรรทัดนี้ (อยู่ด้านบนของไฟล์):
```js
var DRIVE_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';
```
แทนที่ข้อความ `PASTE_YOUR_DRIVE_FOLDER_ID_HERE` ด้วย Folder ID ที่คัดลอกไว้จากขั้นตอน 1.2 เช่น:
```js
var DRIVE_FOLDER_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz';
```
แล้วกด **Save** (ไอคอนรูปแผ่นดิสก์ หรือ Ctrl+S)

### 1.5 Deploy เป็น Web App
1. มุมขวาบน คลิกปุ่ม **Deploy → New deployment**
2. คลิกไอคอนเฟือง (⚙️) ข้าง "Select type" → เลือก **Web app**
3. ตั้งค่าดังนี้:
   - **Description**: ใส่อะไรก็ได้ เช่น "Payin slip backend"
   - **Execute as**: `Me (อีเมลของคุณ)`
   - **Who has access**: เลือก **`Anyone`** (สำคัญมาก — ต้องเลือกแบบนี้ ไม่อย่างนั้นสาขาจะส่งข้อมูลเข้ามาไม่ได้)
4. คลิก **Deploy**
5. ระบบจะขอให้ "Authorize access" — คลิก **Authorize access** แล้วเลือกบัญชี Google ของคุณ
   - จะมีหน้าเตือน "Google hasn't verified this app" เพราะเป็นสคริปต์ที่คุณเขียนเอง ให้คลิก **Advanced → Go to [ชื่อโปรเจกต์] (unsafe)** แล้ว **Allow** (ปลอดภัย เพราะเป็นสคริปต์ของคุณเอง ไม่ใช่ของบุคคลที่สาม)
6. หลัง Deploy สำเร็จ จะได้ **Web app URL** หน้าตาประมาณนี้:
   ```
   https://script.google.com/macros/s/AKfycb......................./exec
   ```
   **คัดลอก URL นี้เก็บไว้** — ต้องใช้ในขั้นตอนต่อไป

> ทดสอบได้ทันที: เปิด URL นี้ในเบราว์เซอร์ตรงๆ ถ้าเห็นข้อความ "BATA Store Payin Slip backend is running." แสดงว่า deploy สำเร็จ

---

## ส่วนที่ 2 — เชื่อมฟอร์มกับ Backend

1. เปิดไฟล์ `index.html` ด้วยโปรแกรมแก้ไขข้อความ (Notepad, VS Code, หรือคล้ายกัน)
2. หาบรรทัดนี้ (อยู่ในส่วน `<script>` ด้านล่างของไฟล์):
   ```js
   const SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. แทนที่ด้วย Web app URL ที่ได้จากขั้นตอน 1.5 เช่น:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycb......................./exec";
   ```
4. บันทึกไฟล์

---

## ส่วนที่ 3 — เผยแพร่ฟอร์มให้สาขาใช้งาน

ไฟล์ `index.html` เป็นเว็บเพจล้วนๆ ต้อง host ไว้ที่ใดที่หนึ่งเพื่อให้สาขาเปิดผ่านมือถือได้ วิธีที่ง่ายและไม่มีค่าใช้จ่าย:

### ตัวเลือก A: GitHub Pages (แนะนำ ใช้ฟรี มี HTTPS)
1. สร้าง repository ใหม่บน GitHub (ถ้ายังไม่มี account สมัครได้ฟรีที่ github.com)
2. อัปโหลดไฟล์ `index.html` เข้า repo
3. ไปที่ Settings → Pages → เลือก branch `main` → Save
4. จะได้ลิงก์ เช่น `https://yourname.github.io/bata-payin/`
5. แปลงลิงก์เป็น QR Code (ใช้เว็บ เช่น qr-code-generator.com) แล้วติดไว้ที่สาขา หรือส่งลิงก์ผ่าน LINE ให้พนักงาน

### ตัวเลือก B: Google Sites (ง่ายกว่า ไม่ต้องรู้เรื่อง GitHub)
1. เปิด https://sites.google.com
2. สร้างเว็บไซต์ใหม่ แทรก HTML แบบ Embed code แล้ววางโค้ดจาก `index.html`
3. Publish แล้วได้ลิงก์มาใช้งาน

---

## หลังจากใช้งานจริง

- ทุกครั้งที่สาขาส่งฟอร์ม ข้อมูลจะถูกเพิ่มเป็นแถวใหม่ในชีต **"Payin Records"** ภายใน Google Sheet ของคุณโดยอัตโนมัติ พร้อมลิงก์ไปยังรูปสลิปที่เก็บใน Google Drive
- คุณสามารถเปิด Google Sheet ดูข้อมูลย้อนหลังได้ตลอดเวลา หรือ export เป็น Excel (.xlsx) ได้ทันทีผ่าน File → Download

---

## ขั้นต่อไป (ถ้าต้องการให้รูป sync เข้า OneDrive อัตโนมัติด้วย)

เมื่อระบบนี้ทำงานเรียบร้อยแล้ว ขั้นต่อไปคือตั้งค่าให้ไฟล์ใน Google Drive folder ("BATA Payin Slips") sync ไปที่ OneDrive ของออฟฟิศโดยอัตโนมัติ ผ่านบริการอย่าง MultCloud — ผมจะแนะนำขั้นตอนละเอียดในส่วนถัดไปเมื่อคุณพร้อม
