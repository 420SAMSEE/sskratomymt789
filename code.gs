/**
 * Code.gs (Google Apps Script)
 * - รับ POST/GET จากเว็บแอพ แล้วบันทึกลง Google Sheets
 *
 * วิธีใช้งาน:
 * 1. สร้าง Project ใน script.google.com
 * 2. วางโค้ดนี้ แล้วแก้ SHEET_ID และ SHEET_NAME ให้ตรงกับชีตของคุณ
 * 3. Deploy -> New deployment -> Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (even anonymous)
 * 4. คัดลอก URL Web app แล้วนำไปใส่เป็น WEBAPP_URL ในไฟล์ script.js
 */

const SHEET_ID = '13HPhyBXBmbPwEUKoj012qdRd1W3qD-h4AkqS7cAI_sQ'; // <- แก้ตรงนี้
const SHEET_NAME = 'SalesForm'; // <- แก้ตรงนี้ให้ตรงกับชีตของคุณ

function doGet(e){
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'Ready', params: e.parameter}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

    let body = {};
    if (e.postData && e.postData.type === 'application/json') {
      body = JSON.parse(e.postData.contents);
    } else if (e.parameter && Object.keys(e.parameter).length) {
      body = e.parameter;
    } else {
      try { body = JSON.parse(e.postData.contents); } catch(err){}
    }

    const now = new Date();
    const row = [
      body.date || Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      body.sold || 0,
      body.pending || 0,
      body.cleared || 0,
      body.revenue || 0,
      body.pipeFee || 0,
      body.shareFee || 0,
      body.otherFee || 0,
      body.saveFee || 0,
      body.expense || 0,
      body.balance || 0,
      body.createdAt || new Date().toISOString()
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['date','sold','pending','cleared','revenue','pipeFee','shareFee','otherFee','saveFee','expense','balance','createdAt']);
    }

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({status:'success', row: row}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
