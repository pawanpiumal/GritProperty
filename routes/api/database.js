const express = require('express');

const router = express.Router();

const mysql = require('mysql2/promise');

const errorFile = require('../../middleware/functions').errorFile
const errorSQL = require('../../middleware/db').errorSQL

const authenticate = require('../../middleware/functions').authenticate

// Create mySQL Connection
const db = require('../../config/keys');


/**
 * @api {get} api/db/errors?limit=:limit Get the Errors in the SQL database
 * @apiName GetErrorsSQL
 * @apiGroup Errors
 * 
 * @apiQuery {Number} limit Number of errors required from the database.
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiSuccess {Object} rows The errors are attached in JSON format.
 *  
 * @apiUse ErrorStatusMsg
 */

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
            // console.log({ err });
            errorFile("SQL SELECT for Errors.", JSON.stringify(error))
            res.status(400).json({ status: "Unsuccessful", msg: "Error reading data from the database." })
        }
    })

    connection.end()

    res.status(200).json({ status: "Successful", msg: "Errors are attached.", rows })
})

const fs = require('fs')

/**
 * @api {get} api/db/errorFiles?limit=:limit Get the Errors stored as text files.
 * @apiName GetErrorsFiles
 * @apiGroup Errors
 * 
 * @apiQuery {Number} limit Number of errors required from the database.
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiSuccess {Object} rows The errors are attached in JSON format.
 *  
 * @apiUse ErrorStatusMsg
 */

router.get('/errorFiles', authenticate, async (req, res) => {
    if (req.query.limit) {
        limit = parseInt(req.query.limit)
    } else {
        limit = 100
    }

    try {
        fs.readdir('Errors', async (err, files) => {
            if (err) {
                errorSQL('Reading Error files', err)
                return res.status(400).json({ status: "Successful", msg: "Error reading files." })
            }
            fileArray = []
            for (const [i, file] of files.entries()) {
                try {
                    fileArray.push({ index: i, place: file, error: fs.readFileSync('Errors/' + file, 'utf-8') })
                } catch (err) {
                    errorSQL('Reading Single Error file', err)
                    return res.status(400).json({ status: "Successful", msg: "Error reading files." })
                }
            }
            await Promise.all(fileArray)
            return res.status(200).json({ status: "Successful", msg: "Errors are attached.", rows: fileArray.reverse().slice(0, limit) })
        })
    } catch (err) {
        errorSQL('Reading Error files', err)
        return res.status(400).json({ status: "Unsuccessful", msg: "Error reading files." })
    }
})

/**
 * @api {get} api/db Check if the DB API is working
 * @apiName CheckDB
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */

router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Config API is working" })
});

module.exports = router;