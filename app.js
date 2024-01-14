// Import libraries
const express = require('express')
const bodyParser = require("body-parser");
const mysql = require('mysql')
const xmlparser = require('express-xml-bodyparser');

// Function to write errors to text files
const errorFile = require('./middleware/functions').errorFile

const app = express()
const port = 3000

// Import routes
const postProperty = require('./routes/api/importProperties')

// middleware
app.use(bodyParser.json())
app.use(xmlparser())

// Create mySQL Connection
const db = require('./config/keys');

var connection = mysql.createConnection({
    host: db.host,
    user: db.username,
    password: db.password
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${db.db}`, (error, results, fields) => {
    if (error) errorFile(JSON.stringify(error))
})

connection.changeUser({ database: db.db }, (err) => {
    if (err) throw err;
})

// connection.query("DROP TABLE errors") 

connection.query('CREATE TABLE IF NOT EXISTS errors (\
    id INT NOT NULL AUTO_INCREMENT,\
    place TEXT NOT NULL,\
    error TEXT NOT NULL,\
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
    PRIMARY KEY (id));', (error, results, fields) => {
    if (error) {
        errorFile(JSON.stringify(error))
        console.error(error)
    }
})

connection.end()

app.use("/api/postproperty", postProperty)

app.listen(port, () => {
    console.log(`App started on port ${port}`)
})