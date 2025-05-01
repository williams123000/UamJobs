const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        const user = new User({ email, password, role, name });
        await user.save();

        res.redirect('/login');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Credenciales inválidas');
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        if (user.role === 'student') {
            res.redirect('/student-home');
        } else {
            res.redirect('/company-home');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};