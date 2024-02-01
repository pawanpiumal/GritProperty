const express = require('express');

const router = express.Router();

const mysql = require('mysql2/promise');

const errorFile = require('../../middleware/functions').errorFile

const authenticate = require('../../middleware/functions').authenticate

// Create mySQL Connection
const db = require('../../config/keys');

router.get('/errors', authenticate, async (req, res) => {
    var connection = await mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    if(req.query.limit){
        limit = parseInt(req.query.limit)
    }else{
        limit = 1000
    }
    // console.log(limit);
    const [rows, fields] = await connection.execute(`SELECT * FROM errors ORDER BY time DESC LIMIT 0,${limit}`).catch(err => {
        if (err) {
            console.log({ err });
            errorFile(JSON.stringify(error))
            res.status(400).json({ 'msg': "Error", 'error': err })
        }
    })

    connection.end()

    res.status(200).json({ "msg": 'DB working', rows, fields })
})


router.get('/', (req, res) => {
    res.status(200).json({ "msg": 'DB working' })
});

module.exports = router;