const Vacancy = require('../models/Vacancy');
const User = require('../models/User');

exports.createVacancy = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (req.user.role !== 'company') {
            return res.status(403).send('Acceso denegado');
        }
        const vacancy = new Vacancy({
            ...req.body,
            company: user.name
        });
        await vacancy.save();
        res.redirect('/company-vacancies');
    } catch (error) {
        console.error('Error al crear vacante:', error.message);
        res.render('company-post-vacancy', {
            user: res.locals.user,
            error: 'Error al crear la vacante: ' + error.message
        });
    }
};

exports.getFilteredVacancies = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        const vacancies = await Vacancy.find({
            minAverage: { $lte: student.average },
            requiredCareer: student.career,
            minQuarters: { $lte: student.quarters }
        });
        res.json(vacancies);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
};