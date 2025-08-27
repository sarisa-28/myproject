const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  citizenId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  educationLevel: { type: String, required: true },
  school: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  photoPath: { type: String, required: true },
  examCenter: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'registrations' });

module.exports = mongoose.model('Registration', RegistrationSchema);
