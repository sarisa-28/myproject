require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Registration = require('./models/Registration');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

console.log("MONGO_URI from .env =", process.env.MONGO_URI);

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + Date.now() + ext;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์รูป .jpg .png .webp'));
    }
    cb(null, true);
  }
});

//mongo db
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('กรุณาตั้งค่า MONGO_URI ในไฟล์ .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
connectDB().catch(err => {
  console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', err.message);
  process.exit(1);
});

//วิชา
const SUBJECTS = [
  'คณิตศาสตร์',
  'ฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
];

app.get('/api/subjects', (req, res) => {
  res.json(SUBJECTS);
});

function isValidThaiCitizenId(id) {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id.charAt(12), 10);
}

// POST /api/register
app.post('/api/register',
  upload.single('photo'),
  [
    body('citizenId').custom((value) => {
      if (!isValidThaiCitizenId(value)) {
        throw new Error('รหัสประชาชนไม่ถูกต้อง (13 หลัก)');
      }
      return true;
    }),
    body('title').notEmpty(),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('birthDate').isISO8601().toDate(),
    body('educationLevel').notEmpty(),
    body('school').notEmpty(),
    body('address').notEmpty(),
    body('phone').matches(/^0\d{8,9}$/), 
    body('email').isEmail(),
    body('examCenter').notEmpty(),
    body('subjects').custom((value) => {
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.file) {
        return res.status(400).json({ errors: [{ msg: 'กรุณาอัปโหลดภาพถ่าย', path: 'photo' }] });
      }

      let subjects = [];
      if (Array.isArray(req.body.subjects)) {
        subjects = req.body.subjects;
      } else if (typeof req.body.subjects === 'string') {
        try {
          const parsed = JSON.parse(req.body.subjects);
          if (Array.isArray(parsed)) subjects = parsed;
        } catch {
          subjects = req.body.subjects.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      if (subjects.length === 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ errors: [{ msg: 'กรุณาเลือกรายวิชาอย่างน้อย 1 วิชา', path: 'subjects' }] });
      }

      const doc = new Registration({
        citizenId: req.body.citizenId,
        title: req.body.title,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDate: req.body.birthDate,
        educationLevel: req.body.educationLevel,
        school: req.body.school,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        examCenter: req.body.examCenter,
        subjects,
        photoPath: `http://localhost:3000/uploads/${path.basename(req.file.path)}`

      });

      await doc.save();

      res.json({ message: 'ลงทะเบียนสำเร็จ', id: doc._id });
    } catch (err) {
      console.error(err);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์', detail: err.message });
    }
  }
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
