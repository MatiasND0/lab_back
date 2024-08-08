const connection = require('../models/db')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'unlam';

module.exports.login = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = 'SELECT * FROM users WHERE username = ?';

    try {
        connection.query(sql, [username], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error en el servidor', error: err });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al comparar las contraseñas', error: err });
                }
                if (!isMatch) {
                    return res.status(401).json({ message: 'Contraseña incorrecta' });
                }

                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '1m' }
                );

                return res.status(200).json({ message: 'Autenticación exitosa', token });
            });
        });
    } catch (e) {
        return res.status(500).json({ message: 'Error en el servidor', error: e });
    }
} 

module.exports.checkAuth = (req, res) => {
    res.status(200).json({ message: `Usuario autenticado: ${req.session.user.username}` });
};