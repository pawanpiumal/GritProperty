const mysql = require('mysql')

const errorFile = require('./functions').errorFile


// Create mySQL Connection
const db = require('../config/keys');

const errorSQL = function (place, error) {
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

        connection.query(`INSERT INTO errors(place,error) VALUES('${place}','${JSON.stringify(error)}')`, (error) => {
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

        connection.query(`INSERT INTO imports(xml,json) VALUES('${xml}','${JSON.stringify(json)}')`, (error) => {
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

        connection.query(`INSERT INTO uploads(uploadID) VALUES('${parseInt(postID)}','${postType}','${uploadID}','${xml}')`, (error) => {
            if (error) {
                errorFile('MySQL insert errors.', JSON.stringify(error))
            }
        })

        connection.end()
    }
}
module.exports = { errorSQL, importSQL, uploadSQL }