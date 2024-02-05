const mysql = require('mysql')

const errorFile = require('./functions').errorFile


// Create mySQL Connection
const db = require('../config/keys');

const isJson = function (item) {
    let value = typeof item !== "string" ? JSON.stringify(item) : item;
    try {
        value = JSON.parse(value);
    } catch (e) {
        return false;
    }

    return typeof value === "object" && value !== null;
}


const errorSQL = async function (place, error) {
    var connection = mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    if (place && error) {
        connection.connect(function (err) {
            if (err) {
                errorFile('MySQL Connection.', JSON.stringify(error))
            }
        });

        if (isJson(error)) {
            error = JSON.stringify(error)
        }

        await connection.query(`INSERT INTO errors(place,error) VALUES('${place}','${`${error}`.replace(/'/g, " ")}')`, (error) => {
            if (error) {
                errorFile('MySQL insert errors.', JSON.stringify(error))
            }
        })

        connection.end()
    }
}

const importSQL = function (xml, json) {
    var connection = mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    if (xml && json) {
        connection.connect(function (err) {
            if (err) {
                errorFile('MySQL Connection.', JSON.stringify(error))
            }
        });

        connection.query(`INSERT INTO imports(xml,json) VALUES('${JSON.stringify(xml)}','${JSON.stringify(json)}')`, (error) => {
            if (error) {
                errorFile('MySQL insert errors.', JSON.stringify(error))
            }
        })

        connection.end()
    }
}

const uploadSQL = function (postID, postType, uploadID, xml) {
    var connection = mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    if (postID && postType && uploadID && xml) {
        connection.connect(function (err) {
            if (err) {
                errorFile('MySQL Connection.', JSON.stringify(error))
            }
        });

        connection.query(`INSERT INTO uploads(postID, postType,uploadID,xml) VALUES('${parseInt(postID)}','${postType}','${uploadID}','${xml}')`, (error) => {
            if (error) {
                errorFile('MySQL insert errors.', JSON.stringify(error))
            }
        })

        connection.end()
    }
}
module.exports = { errorSQL, importSQL, uploadSQL }