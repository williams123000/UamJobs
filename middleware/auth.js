const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log('No se encontró token en cookies');
        return res.status(401).send('Acceso denegado: Token no proporcionado');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error en verificación de token:', error.message);
        res.status(400).send('Acceso denegado: Token inválido');
    }
};