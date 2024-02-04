const express = require('express');

const router = express.Router();
const fs = require('fs')

const errorFile = require('../../middleware/functions').errorFile

const authenticate = require('../../middleware/functions').authenticate
const errorSQL = require('../../middleware/db').errorSQL
const bodyparser = require('body-parser')
const config = require('../../config/keys')

router.get('/get', authenticate, (req, res) => {
    try {
        data = fs.readFileSync('./config/keys.js', { encoding: 'utf-8' })
        res.status(200).json({ "config": data })
    } catch (err) {
        console.log({ err });
        errorSQL('Reading Config file', err)
        res.status(400).json({ "status": "Error Occured", "msg": err })

    }
})


const isEmptyJson = (json) => {
    for (var i in json) return false;
    return true;
}


router.post('/post', authenticate, bodyparser.text(), (req, res) => {
    if (!req.body || isEmptyJson(req.body)) {
        res.status(400).json({ "status": "Error Occured", "msg": "Config is not attached." })
    } else {
        try {
            fs.writeFileSync('./config/keys.js', req.body);
            res.status(200).json({ "status": "Success" })

        } catch (err) {
            console.log({ err });
            errorSQL('Writing Config file', err)
            res.status(400).json({ "status": "Error Occured", "msg": err })
        }
    }
})

/**
 * @api {get} api/config Check if the Config API is working
 * @apiName CheckConfig
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */

router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Config API is working" })
});


module.exports = router;