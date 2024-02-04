// Import libraries
const express = require('express')
const bodyParser = require("body-parser");
const mysql = require('mysql')
const xmlparser = require('express-xml-bodyparser');
const cors = require('cors')

// Function to write errors to text files
const errorFile = require('./middleware/functions').errorFile

const app = express()
const port = 3000

// Import routes
const importProperty = require('./routes/api/importProperties')
const exportProperty = require('./routes/api/exportProperties')
const login = require('./routes/api/login')
const database = require('./routes/api/database')
const config = require('./routes/api/config')


app.use(cors())
// middleware
app.use(bodyParser.json())
app.use(xmlparser())



// Create mySQL Connection
const db = require('./config/keys');

var connection = mysql.createConnection({
    port: db.port,
    user: db.username,
    password: db.password,
    host: db.host,
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        errorFile("Connection App.js", err)
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${db.db}`, (error, results, fields) => {
    if (error) errorFile("Create Database", error)
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
        errorFile("Create Table errors", JSON.stringify(error))
        console.error(error)
    }
})

connection.query('CREATE TABLE IF NOT EXISTS imports (\
    id INT NOT NULL AUTO_INCREMENT,\
    xml TEXT NOT NULL,\
    json TEXT NOT NULL,\
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
    PRIMARY KEY (id));', (error, results, fields) => {
    if (error) {
        errorFile("Create Table imports", JSON.stringify(error))
        console.error(error)
    }
})

connection.query('CREATE TABLE IF NOT EXISTS uploads (\
    id INT NOT NULL AUTO_INCREMENT,\
    postID INT NOT NULL,\
    postType TEXT NOT NULL,\
    uploadID TEXT NOT NULL,\
    xml TEXT NOT NULL,\
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
    PRIMARY KEY (id));', (error, results, fields) => {
    if (error) {
        errorFile("Create Table uploads", JSON.stringify(error))
        console.error(error)
    }
})


connection.end()

app.use("/api/postproperty", importProperty)
app.use("/api/exportproperty", exportProperty)
app.use("/api/login", login)
app.use("/api/db", database)
app.use("/api/config", config)

app.get('/', (req, res) => {
    res.status(200).json({ msg: "working" })
})

app.listen(port, () => {
    console.log(`App started on port ${port}`)
})