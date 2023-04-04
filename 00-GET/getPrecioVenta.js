const { Router } = require('express')
const router = Router();
const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: process.env.CONNECTIONLIMIT
});

router.get('/', (req, res) => {
    pool.query('SELECT * FROM precio_venta', (error, results, fields) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.json(results);
        }
    });
  });

module.exports = router;