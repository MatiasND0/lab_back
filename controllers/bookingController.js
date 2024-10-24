const connection = require('../models/db')

module.exports.avaliableProy = (req, res) => {
    const { fecha, turno } = req.body; // Asegúrate de recibir la fecha y el turno del cliente

    const sql = `
        SELECT p.*
        FROM proyectores p
        LEFT JOIN reservas r ON p.cod_rec = r.cod_rec 
        AND r.fecha = ? AND r.turno = ?
        WHERE r.cod_rec IS NULL
        AND p.cod_rec NOT LIKE '%HDMI%'
    `;

    try {
        connection.query(sql, [fecha, turno], (err, results) => {
            if (err) {
                console.error('Error ejecutando la consulta: ', err);
                res.status(500).send('Error ejecutando la consulta');
                return;
            }
            res.json(results); // Devuelve los proyectores disponibles
        });
    } catch (error) {
        console.error('Error al procesar la solicitud: ', error);
        res.status(500).send('Error al procesar la solicitud');
    }
};

module.exports.bookProy = (req, res) => {
    const { fecha, turno, cod_rec, username, materia, hdmiRequired } = req.body;

    // Validar que se recibieron los datos necesarios
    if (!fecha || !turno || !cod_rec || !username || !materia) {
        return res.status(400).json({ error: 'Faltan datos necesarios para realizar la reserva' });
    }

    // Consulta SQL para insertar una nueva reserva
    const sql = `INSERT INTO reservas (cod_rec, fecha, turno, username, materia) VALUES (?, ?, ?, ?, ?)`;

    // Ejecutar la consulta
    connection.query(sql, [cod_rec, fecha, turno, username, materia], (err, results) => {
        if (err) {
            console.error('Error al realizar la reserva:', err);
            return res.status(500).json({ error: 'Error al realizar la reserva' });
        }

        // Si se requiere HDMI, agregar una entrada adicional
        if (hdmiRequired) {
            // Generar el código del proyector HDMI
            const codRecSql = `SELECT cod_rec FROM proyectores WHERE CAST(nro_inv AS UNSIGNED) BETWEEN 1 AND 100;`;

            // Declarar hdmiCodRec aquí
            let hdmiCodRec = "";

            connection.query(codRecSql, (err, codRecResults) => {
                if (err) {
                    console.error('Error al obtener cod_rec:', err);
                    return res.status(500).json({ error: 'Error al obtener los códigos de proyector' });
                }

                // Extraer solo los cod_rec
                const cod_recs = codRecResults.map(row => row.cod_rec);

                // Consulta para verificar reservas existentes
                const placeholders = cod_recs.map(() => '?').join(', ');
                const availabilitySql = `SELECT cod_rec FROM reservas WHERE fecha = ? AND turno = ? AND cod_rec IN (${placeholders})`;

                // Ejecutar consulta de disponibilidad
                connection.query(availabilitySql, [fecha, turno, ...cod_recs], (err, availabilityResults) => {
                    if (err) {
                        console.error('Error al verificar disponibilidad:', err);
                        return res.status(500).json({ error: 'Error al verificar la disponibilidad' });
                    }

                    // Filtrar los cod_rec no disponibles
                    const unavailableCodRec = availabilityResults.map(row => row.cod_rec);
                    const availableCodRec = cod_recs.filter(cod_rec => !unavailableCodRec.includes(cod_rec));

                    // Asegúrate de que hay al menos un cod_rec disponible
                    if (availableCodRec.length > 0) {
                        hdmiCodRec = availableCodRec[0]; // Obtiene el primer proyector disponible
                        
                        const hdmiSql = `INSERT INTO reservas (cod_rec, fecha, turno, username, materia) VALUES (?, ?, ?, ?, ?)`;

                        connection.query(hdmiSql, [hdmiCodRec, fecha, turno, username, materia], (errHdmi) => {
                            if (errHdmi) {
                                console.error('Error al reservar HDMI:', errHdmi);
                                return res.status(500).json({ error: 'Error al realizar la reserva de HDMI' });
                            }
                            res.status(201).json({ message: 'Reserva realizada exitosamente, incluyendo HDMI', id: results.insertId });
                        });
                    } else {
                        res.status(400).json({ error: 'No hay proyectores HDMI disponibles' });
                    }
                });
            });
        } else {
            res.status(201).json({ message: 'Reserva realizada exitosamente', id: results.insertId });
        }
    });
};

module.exports.bookedProy = (req, res) => {
    const { username, role } = req.body;

    // Validar que se recibieron los datos necesarios
    if (!username) {
        return res.status(400).json({ error: 'Error: Se requiere un username.' });
    }

    // Declarar sql 
    let sql = `SELECT * FROM reservas WHERE username = ? AND fecha >= CURDATE();`;

    // Si el rol es 1, modificamos la consulta
    if (role === 1) {
        sql = `SELECT r.*, u.phoneNumber
                FROM reservas r
                JOIN users u ON r.username = u.username
                WHERE r.fecha >= CURDATE();
                `;
    }

    // Ejecutar la consulta
    connection.query(sql, role === 1 ? [] : [username], (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            return res.status(500).json({ error: 'Error al realizar la consulta' });
        }
        res.status(200).json(results);
    });
};

module.exports.deleteBooking = (req, res) => {
    const reservaId = req.params.id;

    const sql = 'DELETE FROM reservas WHERE id = ?';
    connection.query(sql, [reservaId], (error, results) => {
        if (error) {
            console.error('Error al eliminar la reserva:', error);
            return res.status(500).json({ error: 'Error al eliminar la reserva' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.status(200).json({ message: 'Reserva eliminada exitosamente' });
    });
};