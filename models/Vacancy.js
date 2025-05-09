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

const vacancySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    minAverage: {
        type: Number,
        required: true,
        min: [0, 'El promedio mínimo debe ser al menos 0'],
        max: [10, 'El promedio mínimo no puede ser mayor a 10']
    },
    requiredCareer: {
        type: String,
        required: true,
        enum: {
            values: validCareers,
            message: 'Carrera no válida'
        }
    },
    minQuarters: { type: Number, required: true },
    company: { type: String, required: true },
    applicants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ]
});

module.exports = mongoose.model('Vacancy', vacancySchema);