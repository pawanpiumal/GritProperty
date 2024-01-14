const mysql = require('mysql')

const errorFile = require('./functions').errorFile


// Create mySQL Connection
const db = require('../config/keys');

var connection = mysql.createConnection({
    host: db.host,
    user: db.username,
    password: db.password,
    database: db.db
});


const errorSQL = function(place, error) {
    if (place && error) {
        connection.connect(function(err) {
            if (err) {
                errorFile(JSON.stringify(error))
            }
        });

        connection.query(`INSERT INTO errors(place,error) VALUES('${place}','${error}')`, (error) => {
            if (error) {
                errorFile(JSON.stringify(error))
            }
        })

        connection.end()
    }
}
module.exports = { connection, errorSQL }