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

module.exports.addItem = (req, res) => { //Add libro

    console.log(req.body);

    let sqlBody = {
        id: 0,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        idioma: req.body.idioma,
        tipo: req.body.tipo,
        ubicacion: req.body.ubicacion,
        instrumento_asociado: (req.body.intrumento_asociado) ? req.body.instrumento_asociado : 'NC',
        autor: (req.body.autor) ? req.body.autor : 'NC',
        editorial: (req.body.editorial) ? req.body.editorial : 'NC',
        year: (req.body.year) ? req.body.year : 0
    };

    var sql = `SELECT MAX(CAST(SUBSTRING(ID, 5) AS UNSIGNED)) AS max_id
                FROM libros
                WHERE ID LIKE '${((req.body.tipo === 'manual') ? req.body.equipo : req.body.tipo)}-%';`;

    connection.query(sql, [], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta: ', err);
            res.status(500).send('Error ejecutando la consulta');
            return;
        }
        sqlBody.id = ((req.body.tipo === 'manual') ? req.body.equipo : req.body.tipo) + '-' + (results[0].max_id+1).toString().padStart(5, '0');;

        var sql = `INSERT INTO libros (id, titulo, descripcion, idioma, tipo, ubicacion, instrumento_asociado, autor, editorial, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`;
        console.log(Object.values(sqlBody))
        connection.query(sql, Object.values(sqlBody), (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: 'Error al agregar el elemento' });
            }
            res.status(201).json({ message: 'Elemento agregado exitosamente', id: results.insertId });
        });

    })
}

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