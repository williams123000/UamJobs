const Message = require('../models/Message');
const Student = require('../models/Student');
const Vacancy = require('../models/Vacancy');
const User = require('../models/User');

exports.createMessage = async (req, res) => {
    try {
        const { vacancyId, message } = req.body;
        if (!message || message.trim().length === 0) {
            return res.render('contact-company', {
                user: res.locals.user,
                vacancy: await Vacancy.findById(vacancyId),
                error: 'El mensaje no puede estar vacío.'
            });
        }
        if (message.length > 500) {
            return res.render('contact-company', {
                user: res.locals.user,
                vacancy: await Vacancy.findById(vacancyId),
                error: 'El mensaje no puede exceder los 500 caracteres.'
            });
        }
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(400).send('Estudiante no encontrado.');
        }
        const vacancy = await Vacancy.findById(vacancyId);
        if (!vacancy) {
            return res.status(400).send('Vacante no encontrada.');
        }
        const companyUser = await User.findOne({ name: vacancy.company, role: 'company' });
        if (!companyUser) {
            return res.status(400).send('Empresa no encontrada.');
        }
        const newMessage = new Message({
            studentId: student._id,
            companyUserId: companyUser._id,
            vacancyId: vacancy._id,
            message: message.trim()
        });
        await newMessage.save();
        res.redirect('/student-vacancies?success=¡Mensaje enviado con éxito!');
    } catch (error) {
        console.error('Error al enviar mensaje:', error.message);
        res.render('contact-company', {
            user: res.locals.user,
            vacancy: await Vacancy.findById(vacancyId),
            error: 'Error al enviar el mensaje: ' + error.message
        });
    }
};

exports.getCompanyMessages = async (req, res) => {
    try {
        const messages = await Message.find({ companyUserId: req.user.id })
            .populate('studentId')
            .populate('vacancyId')
            .sort({ createdAt: -1 }); // Ordenar por fecha descendente
        const formattedMessages = await Promise.all(
            messages.map(async (msg) => {
                const studentUser = await User.findById(msg.studentId.userId);
                return {
                    studentName: studentUser ? studentUser.name : 'Desconocido',
                    studentEmail: studentUser ? studentUser.email : 'No disponible',
                    vacancyTitle: msg.vacancyId ? msg.vacancyId.title : 'Vacante eliminada',
                    message: msg.message,
                    createdAt: msg.createdAt
                };
            })
        );
        res.render('company-messages', {
            user: res.locals.user,
            messages: formattedMessages
        });
    } catch (error) {
        console.error('Error al obtener mensajes:', error.message);
        res.status(500).send('Error interno del servidor');
    }
};