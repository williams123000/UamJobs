const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    companyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    message: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);