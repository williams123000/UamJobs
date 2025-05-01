const Student = require('../models/Student');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const validCareers = [
    'Ingeniería',
    'Medicina',
    'Derecho',
    'Administración',
    'Arquitectura',
    'Psicología',
    'Contabilidad'
];

exports.createOrUpdateStudent = async (req, res) => {
    try {
        // Validar promedio
        const average = parseFloat(req.body.average);
        if (isNaN(average) || average < 0 || average > 10) {
            return res.render('student-profile', {
                user: res.locals.user,
                student: null,
                error: 'El promedio debe estar entre 0 y 10.'
            });
        }

        // Validar carrera
        if (!validCareers.includes(req.body.career)) {
            return res.render('student-profile', {
                user: res.locals.user,
                student: null,
                error: 'Carrera no válida.'
            });
        }

        // Validar trimestres y créditos
        const quarters = parseInt(req.body.quarters);
        const credits = parseInt(req.body.credits);
        if (isNaN(quarters) || quarters < 0) {
            return res.render('student-profile', {
                user: res.locals.user,
                student: null,
                error: 'Los trimestres deben ser un número positivo.'
            });
        }
        if (isNaN(credits) || credits < 0) {
            return res.render('student-profile', {
                user: res.locals.user,
                student: null,
                error: 'Los créditos deben ser un número positivo.'
            });
        }

        // Buscar estudiante existente
        let student = await Student.findOne({ userId: req.user.id });

        // Preparar datos para actualizar/crear
        const updateData = {
            userId: req.user.id,
            average,
            career: req.body.career,
            quarters,
            credits
        };

        // Manejar subida de CV
        if (req.files && req.files['cv']) {
            try {
                const result = await cloudinary.uploader.upload(req.files['cv'][0].path, {
                    folder: 'job-platform/cvs',
                    resource_type: 'auto',
                    attachment: true
                });
                updateData.cvPath = result.secure_url;
                // Eliminar archivo temporal
                fs.unlinkSync(req.files['cv'][0].path);
            } catch (uploadError) {
                console.error('Error al subir CV a Cloudinary:', uploadError.message);
                return res.render('student-profile', {
                    user: res.locals.user,
                    student,
                    error: 'Error al subir el CV: ' + uploadError.message
                });
            }
        }

        // Manejar subida de foto de perfil
        if (req.files && req.files['profilePhoto']) {
            try {
                const result = await cloudinary.uploader.upload(req.files['profilePhoto'][0].path, {
                    folder: 'job-platform/profile-photos',
                    resource_type: 'image'
                });
                updateData.profilePhotoPath = result.secure_url;
                // Eliminar archivo temporal
                fs.unlinkSync(req.files['profilePhoto'][0].path);
            } catch (uploadError) {
                console.error('Error al subir foto de perfil a Cloudinary:', uploadError.message);
                return res.render('student-profile', {
                    user: res.locals.user,
                    student,
                    error: 'Error al subir la foto de perfil: ' + uploadError.message
                });
            }
        }

        // Actualizar o crear estudiante
        if (student) {
            Object.assign(student, updateData);
            await student.save();
        } else {
            student = new Student(updateData);
            await student.save();
        }

        res.redirect('/student-profile');
    } catch (error) {
        console.error('Error al guardar estudiante:', error.message);
        res.render('student-profile', {
            user: res.locals.user,
            student: null,
            error: 'Error al guardar la información: ' + error.message
        });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id });
        if (!student) return res.status(404).send('Estudiante no encontrado');
        res.json(student);
    } catch (error) {
        res.status(400).send(error.message);
    }
};