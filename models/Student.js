const mongoose = require('mongoose');

const validCareers = [
    'Ingeniería',
    'Medicina',
    'Derecho',
    'Administración',
    'Arquitectura',
    'Psicología',
    'Contabilidad'
];

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cvPath: { type: String },
    profilePhotoPath: { type: String },
    average: {
        type: Number,
        required: true,
        min: [0, 'El promedio debe ser al menos 0'],
        max: [10, 'El promedio no puede ser mayor a 10']
    },
    career: {
        type: String,
        required: true,
        enum: {
            values: validCareers,
            message: 'Carrera no válida'
        }
    },
    quarters: { type: Number, required: true },
    credits: { type: Number, required: true }
});

module.exports = mongoose.model('Student', studentSchema);