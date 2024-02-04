const express = require("express")

const router = express.Router();

const jwt = require('jsonwebtoken')

const config = require('../../config/keys')

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

router.post('/', (req, res) => {
    // console.log({un:req.body.username,pw:req.body.password});
    username = req.body.username
    password = req.body.password
    if (username == config.webusername && password == config.webpassword) {
        jwt.sign({ username, password }, config.jwtSecret, { expiresIn: '1h' }, (err, token) => {
            // console.log({ err });
            // console.log({ token });
            if (!err) {
                res.status(200).json({ status: "Success", token })
            } else {
                res.status(400).json({ status: "Unauthorized", err })
            }
        })
    } else {
        res.status(400).json({ status: "Unauthorized", msg: "Wrong username or password." })
    }
})



module.exports = router;