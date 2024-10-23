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
                    { id: user.id, username: user.username, role: user.role },
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

module.exports.register = (req, res) => {
    const { username, password, role } = req.body;

    // Validaciones simples
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error al encriptar la contraseña', error: err });
        }

        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        connection.query(sql, [username, hashedPassword, role], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error en el servidor', error: err });
            }
            return res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    });
};

module.exports.checkAuth = (req, res) => {
    res.status(200).json({ message: `Usuario autenticado: ${req.session.user.username}` });
};

module.exports.deleteUser = (req, res) => {
    const userId = req.params.id; // Suponiendo que el ID se pasa como parámetro en la URL

    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario es obligatorio' });
    }

    const sql = 'DELETE FROM users WHERE id = ?';

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    });
};

module.exports.logout = (req, res) => {
    // Aquí puedes eliminar la sesión del usuario o el token
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
};
