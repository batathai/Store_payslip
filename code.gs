/**
 * BATA THAILAND - STORE PAYIN SLIP
 * Google Apps Script backend
 *
 * วิธีติดตั้ง:
 * 1. ไปที่ https://script.google.com -> New project
 * 2. ลบโค้ดเดิมทั้งหมด แล้ว paste โค้ดนี้ทับ
 * 3. แก้ตัวแปร DRIVE_FOLDER_ID ด้านล่างให้เป็น Folder ID ของ Google Drive ที่ต้องการเก็บรูป
 * 4. กด Deploy > New deployment > เลือกประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. คัดลอก Web app URL ที่ได้ ไปใส่ในไฟล์ index.html (ตัวแปร SCRIPT_URL)
 */

// ===== ตั้งค่า =====
// ใส่ Folder ID ของ Google Drive ที่จะใช้เก็บรูปสลิป
// (เปิดโฟลเดอร์ที่ต้องการใน Google Drive แล้วดู ID จาก URL เช่น
//  https://drive.google.com/drive/folders/XXXXXXXXXXXXXXXXXXXXX  <- ตัวนี้คือ Folder ID)
var DRIVE_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';

// ชื่อชีตที่จะใช้บันทึกข้อมูล (อยู่ใน Spreadsheet เดียวกับที่ผูก Apps Script นี้)
var SHEET_NAME = 'Payin Records';

function doPost(e) {
  try {
    var data = JSON.parse(e.parameter.payload);

    // 1) บันทึกรูปลง Google Drive
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var fileUrl = '';
    var fileName = '';

    if (data.fileBase64 && data.fileBase64.length > 0) {
      var contentType = data.fileMimeType || 'image/jpeg';
      var bytes = Utilities.base64Decode(data.fileBase64);
      var blob = Utilities.newBlob(bytes, contentType, data.fileName || 'slip.jpg');

      // ตั้งชื่อไฟล์ให้อ่านง่าย: รหัสสาขา_วันที่นำฝาก_เวลาอัปโหลด
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss');
      fileName = data.branchCode + '_' + data.depositDate + '_' + timestamp + '.' + getExtension(blob.getName(), contentType);

      var file = folder.createFile(blob.setName(fileName));
      fileUrl = file.getUrl();
    }

    // 2) เขียนแถวข้อมูลลง Google Sheets
    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),                 // เวลาที่ส่งฟอร์ม (Timestamp)
      data.zoneCode || '',        // รหัสเขต
      data.branchCode || '',      // รหัสสาขา
      data.depositDate || '',     // วันที่นำฝาก
      data.salesDate || '',       // ยอดขายวันที่
      data.amount || '',          // มูลค่าที่ฝาก
      data.channel || '',         // ช่องทางที่ฝาก
      data.accountNumber || '',   // เลขบัญชี/รายละเอียดช่องทาง
      fileUrl,                    // ลิงก์รูปสลิปใน Drive
      data.submitterName || ''    // ผู้ส่ง (ถ้ามี)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', fileUrl: fileUrl }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'เวลาที่ส่งฟอร์ม', 'รหัสเขต', 'รหัสสาขา', 'วันที่นำฝาก', 'ยอดขายวันที่',
      'มูลค่าที่ฝาก', 'ช่องทางที่ฝาก', 'เลขบัญชี/รายละเอียด', 'ลิงก์รูปสลิป', 'ผู้ส่ง'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  return sheet;
}

function getExtension(name, mimeType) {
  if (name && name.indexOf('.') > -1) {
    return name.split('.').pop();
  }
  if (mimeType.indexOf('png') > -1) return 'png';
  if (mimeType.indexOf('pdf') > -1) return 'pdf';
  return 'jpg';
}

// ใช้สำหรับทดสอบว่า deploy สำเร็จ (เปิด Web app URL ตรงๆ ใน browser จะเห็นข้อความนี้)
function doGet(e) {
  return ContentService.createTextOutput('BATA Store Payin Slip backend is running.');
}
