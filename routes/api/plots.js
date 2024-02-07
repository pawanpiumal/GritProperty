const express = require('express');

const router = express.Router();

const mysql = require('mysql2/promise');

const errorFile = require('../../middleware/functions').errorFile
const errorSQL = require('../../middleware/db').errorSQL

const authenticate = require('../../middleware/functions').authenticate

// Create mySQL Connection
const db = require('../../config/keys');

router.get('/all', async (req, res) => {
    var type = "";
    if (!req.query.type) {
        return res.status(400).json({ status: "Unsuccessful", msg: "Type is not one of (errors, imports, uploads, records)." });
    } else {
        type = req.query.type;
    }

    var typeArray = ['errors', 'imports', 'uploads', 'records'];
    if (!typeArray.includes(type)) {
        return res.status(400).json({ status: "Unsuccessful", msg: "Type is not one of (errors, imports, uploads, records)." });
    }

    var duration = "day";
    if (req.query.duration) {
        duration = req.query.duration;
    }

    var durationArray = ['min', 'hour', 'day', 'month', 'year'];
    if (!durationArray.includes(duration)) {
        return res.status(400).json({ status: "Unsuccessful", msg: "Duration is not one of (min, hour, day, month, year)." });
    }

    var dcut = 10;
    switch (duration) {
        case "min":
            dcut = 16;
            break;
        case "hour":
            dcut = 13;
            break;
        case "day":
            dcut = 10;
            break;
        case "month":
            dcut = 7;
            break;
        case "year":
            dcut = 4;
            break;
        default:
            dcut = 10;
    }

    var connection = await mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    var SQLString = `SELECT COUNT(*) as Count, substring(time,1,${dcut}) as Date FROM ${type} GROUP BY substring(time,1,${dcut});`;
    // console.log(SQLString);
    const [rows, fields] = await connection.execute(SQLString).catch(err => {
        if (err) {
            errorSQL("Plots.js - SQL COUNT for Errors.", JSON.stringify(err))
            return res.status(400).json({ status: "Unsuccessful", msg: "Error reading data from the database." })
        }
    })

    connection.end()

    var row = [];
    var x = [];
    var y = [];
    rows.forEach((e, index) => {
        var DateStr = e.Date
        switch (dcut) {
            case 13:
                DateStr = e.Date + ':00:00';
                break;
            case 16:
                DateStr = e.Date + ':00';
                break;
            default:
                DateStr = e.Date;
        }
        // row.push({ Count: e.Count, Date: new Date(DateStr).getTime() })
        row.push({ index: index, Count: e.Count, Date: DateStr })
        y.push(e.Count);
        x.push(DateStr);
    });

    res.status(200).json({ status: "Successful", msg: `${type} Counts are attached.`, rows: row, x, y })

});


/**
 * @api {get} api/plots Check if the Plots API is working
 * @apiName CheckPlots
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */
router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Plots API is working." })
});



module.exports = router;