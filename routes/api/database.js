const express = require('express');

const router = express.Router();

const mysql = require('mysql2/promise');

const errorFile = require('../../middleware/functions').errorFile
const errorSQL = require('../../middleware/db').errorSQL

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

    if (req.query.limit) {
        limit = parseInt(req.query.limit)
    } else {
        limit = 1000
    }
    // console.log(limit);
    const [rows, fields] = await connection.execute(`SELECT * FROM errors ORDER BY time DESC LIMIT 0,${limit}`).catch(err => {
        if (err) {
            console.log({ err });
            errorFile(JSON.stringify(error), "SQL SELECT for Errors.")
            res.status(400).json({ 'msg': "Error", 'error': err })
        }
    })

    connection.end()

    res.status(200).json({ "msg": 'DB working', rows, fields })
})

const fs = require('fs')

router.get('/errorFiles', async (req, res) => {
    if (req.query.limit) {
        limit = parseInt(req.query.limit)
    } else {
        limit = 100
    }

    try {
        fs.readdir('Errors', async (err, files) => {
            if (err) {
                errorSQL('Reading Error files', err)
                return res.status(400).json({ status: "Error", msg: "Error reading files." })
            }
            fileArray = []
            for (const [i, file] of files.entries()) {
                try {
                    fileArray.push({ index: i, place: file, error: fs.readFileSync('Errors/' + file, 'utf-8') })
                } catch (err) {
                    errorSQL('Reading Single Error file', err)
                }
            }
            await Promise.all(fileArray)
            return res.status(200).json({ status: "Successful", rows: fileArray.reverse().slice(0, limit) })
        })
    } catch (err) {
        errorSQL('Reading Error files', err)
        return res.status(400).json({ status: "Error", msg: "Error reading files.", err })
    }
})


router.get('/', (req, res) => {
    res.status(200).json({ "msg": 'DB working' })
});

module.exports = router;