const connection = require('../models/db')

module.exports.inventory = (req, res) => {
    const table = req.body.table;


    const sql = `SELECT * FROM ${table}`;

    try {
        connection.query(sql, [table], (err, results) => {
            if (err) {
                console.error('Error ejecutando la consulta: ', err);
                res.status(500).send('Error ejecutando la consulta');
                return;
            }
            res.json(results);
        })
    } catch (error) {

    }

};


module.exports.addItem = (req, res) => {

    const table = req.body.table;
    var sql = '';

    const { nro_inv, cod_rec, marca, modelo, sn, estado, fecha_ingreso, vga, hdmi, adicionales } = req.body;
    const { id, descripcion, idioma, tipo, ubicacion, instrumento_asociado } = req.body;

    switch (table) {
        case 'proyectores':
            sql = 'INSERT INTO proyectores (nro_inv, cod_rec, marca, modelo, sn, estado, ubicacion, fecha_ingreso, vga, hdmi, adicionales) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
            connection.query(sql, [nro_inv, cod_rec, marca, modelo, sn, estado, ubicacion, fecha_ingreso, vga, hdmi, adicionales], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al agregar el elemento' });
                }
                res.status(201).json({ message: 'Elemento agregado exitosamente', id: results.insertId });
            });
            break;
        case 'libros':
            sql = 'INSERT INTO libros (id, descripcion, idioma, tipo, ubicacion, instrumento_asociado) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(sql, [id, descripcion, idioma, tipo, ubicacion, instrumento_asociado], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al agregar el elemento' });
                }
                res.status(201).json({ message: 'Elemento agregado exitosamente', id: results.insertId });
            });
            break;
        default:
            break;
    }

};


module.exports.removeItem = (req, res) => {

    const { table, nro_inv } = req.body;
    var sql = '';
    if (!nro_inv) {
        return res.status(400).json({ message: 'nro_inv es requerido' });
    }

    if (table === 'libros') {
        sql = `DELETE FROM ${table} WHERE id = '${nro_inv}'`;
    }
    else {
        sql = `DELETE FROM ${table} WHERE nro_inv = ${nro_inv}`;
    }
    connection.query(sql, [nro_inv], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar el elemento' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Elemento no encontrado' });
        }

        res.status(200).json({ message: 'Elemento eliminado exitosamente' });
    });

};