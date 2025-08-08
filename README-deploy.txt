1) เตรียมไฟล์
   - ไฟล์ในโฟลเดอร์นี้: index.html, styles.css, script.js, manifest.json, service-worker.js, code.gs, README-deploy.txt

2) Google Sheets
   - สร้าง Google Sheets ใหม่ (หรือใช้ Sheet ที่มีอยู่)
   - สร้าง sheet ชื่อ "SaleForm" หรือแก้ชื่อใน code.gs ให้ตรง

3) Google Apps Script (Code.gs)
   - ไปที่: https://script.google.com
   - สร้าง New Project -> วางโค้ดจาก code.gs
   - แก้ค่า SHEET_ID (จาก URL ของ Google Sheets) และ SHEET_NAME หากจำเป็น
   - Deploy -> New deployment -> เลือก "Web app"
       * Execute as: Me
       * Who has access: Anyone (even anonymous)
   - กด Deploy -> คัดลอก Web app URL

4) แก้ `WEBAPP_URL` ในไฟล์ `script.js`
   - แทนค่าตรง 'REPLACE_WITH_YOUR_WEBAPP_ID' ด้วยลิงก์ที่ได้จากการ deploy

5) โฮสต์เว็บแอพ
   - คุณสามารถโฮสต์ด้วย GitHub Pages, Netlify, Vercel หรือโฟลเดอร์บนเซิร์ฟเวอร์ของคุณ
   - หากโฮสต์ที่ root path ให้ assets ใน service-worker.js ใช้ path ที่ถูกต้อง

6) ทดสอบ
   - เปิดหน้าเว็บ -> กรอกข้อมูล -> กดบันทึก -> ตรวจสอบ Google Sheets ว่ามีแถวเพิ่มไหม
   - หากไม่ทำงาน ให้เช็ค console และตรวจสอบว่า WebApp URL ถูกต้องและสิทธิ์การเข้าถึงถูกตั้ง

7) ทำให้เป็น PWA (ติดตั้งบนมือถือ)
   - บน Chrome/Android: เปิดเว็บ -> เมนู -> "Add to home screen"
   - บน iOS: Safari -> Add to Home Screen (Service Worker บางฟีเจอร์ iOS อาจจำกัด)

8) ความปลอดภัย
   - ถ้าไม่ต้องการเปิด "Anyone (even anonymous)", ให้ใช้ OAuth และตั้ง web app ให้รับเฉพาะผู้ใช้ที่ผ่านการตรวจสอบ
   - ควรพิจารณาเพิ่มการ validate ข้อมูลฝั่งเซิร์ฟเวอร์ และ rate-limiting หากใช้งานจริง
