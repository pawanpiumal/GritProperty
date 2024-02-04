const express = require("express")

const router = express.Router();

const jwt = require('jsonwebtoken')

const config = require('../../config/keys')

const errorSQL = require('../../middleware/db').errorSQL

/**
 * @api {get} api/login Check if the Login API is working
 * @apiName CheckLogin
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */

router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Login API is working" })
})

/**
 * @api {get} api/login Login to the react backend.
 * @apiName login
 * @apiGroup Login
 * 
 * 
 * @apiBody {String} username Username
 * @apiBody {String} password Password
 * 
 * @apiUse StatusMsg
 * @apiUse ErrorStatusMsg
 * @apiSuccess {String} token JWT token for the logged user.
 */

router.post('/', (req, res) => {
    username = req.body.username
    password = req.body.password
    if (username == config.webusername && password == config.webpassword) {
        jwt.sign({ username, password }, config.jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (!err) {
                res.status(200).json({ status: "Successful", msg: "Loggedin", token })
            } else {
                errorSQL('Login', err)
                res.status(400).json({ status: "Unsuccessful", msg: "Error in creating the token. Try again later." })
            }
        })
    } else {
        res.status(400).json({ status: "Unsuccessful", msg: "Wrong username or password." })
    }
})



module.exports = router;