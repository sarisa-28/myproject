# เว็บไซต์ลงทะเบียนสอบ + MongoDB

โปรเจกต์ตัวอย่างสำหรับสร้างหน้าเว็บลงทะเบียน พร้อมระบบฐานข้อมูล MongoDB และการอัปโหลดรูปภาพ

## โครงสร้าง
```
registration-site-mongo/
├─ models/
│  └─ Registration.js
├─ public/
│  ├─ index.html
│  ├─ main.js
│  └─ style.css
├─ uploads/            # เก็บไฟล์รูปที่อัปโหลด (สร้างให้อัตโนมัติ)
├─ .env.example
├─ package.json
└─ server.js
```

## วิธีใช้งาน
1) ติดตั้ง Node.js (เวอร์ชัน 18+ แนะนำ)
2) เปิดเทอร์มินัลไปที่โฟลเดอร์โปรเจกต์นี้ แล้วรัน
   ```bash
   npm install
   cp .env.example .env  # Windows ใช้ copy แทน
   ```
3) แก้ไฟล์ `.env` ให้ค่า `MONGO_URI` เป็นของ MongoDB ของคุณ
4) รันเซิร์ฟเวอร์
   ```bash
   npm run dev  # โหมดพัฒนา (auto-reload)
   # หรือ
   npm start
   ```
5) เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## หมายเหตุ
- ระบบตรวจสอบความถูกต้องของรหัสประชาชนไทย (13 หลัก) ทั้งฝั่งหน้าเว็บและฝั่งเซิร์ฟเวอร์
- รองรับไฟล์รูป .jpg/.png/.webp ขนาดไม่เกิน 5MB เก็บไว้ในโฟลเดอร์ `/uploads` และบันทึก path ลงฐานข้อมูล
- ฟิลด์รหัสประชาชน `citizenId` ตั้งค่า unique ป้องกันลงทะเบียนซ้ำ
- แก้ไขรายวิชาได้ที่ตัวแปร `SUBJECTS` ใน `server.js`
