const mysql = require('mysql')

const errorFile = require('./functions').errorFile


// Create mySQL Connection
const db = require('../config/keys');

const errorSQL = function(place, error) {
    var connection = mysql.createConnection({
        port:db.port,
        user: db.username,
        password: db.password,
        host:db.host,
        database:db.db
    });
    
    if (place && error) {
        connection.connect(function(err) {
            if (err) {
                errorFile(JSON.stringify(error))
            }
        });

        connection.query(`INSERT INTO errors(place,error) VALUES('${place}','${JSON.stringify(error)}')`, (error) => {
            if (error) {
                errorFile(JSON.stringify(error))
            }
        })

        connection.end()
    }
}
module.exports = {errorSQL }