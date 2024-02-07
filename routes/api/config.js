const express = require('express');

const router = express.Router();
const fs = require('fs')

const errorFile = require('../../middleware/functions').errorFile

const authenticate = require('../../middleware/functions').authenticate
const errorSQL = require('../../middleware/db').errorSQL
const bodyparser = require('body-parser')
const config = require('../../config/keys')

const keepRecords = require('../../middleware/db').keepRecords

/**
 * @api {get} api/config/get Get Config file
 * @apiName GetConfig
 * @apiGroup Config
 * 
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiUse ErrorStatusMsg
 * @apiSuccess {string} config Content of the config file
 */

router.get('/get', authenticate, (req, res) => {
    try {
        data = fs.readFileSync('./config/keys.js', { encoding: 'utf-8' })
        res.status(200).json({ status: "Successful", msg: "Config is attached.", "config": data })
    } catch (err) {
        errorSQL('Config.js - Reading Config file', err)
        res.status(400).json({ status: "Unsuccessful", msg: "Error reading the config file." })

    }
})


const isEmptyJson = (json) => {
    for (var i in json) return false;
    return true;
}

/**
 * @api {post} api/config/get Change the Config file
 * @apiName PostConfig
 * @apiGroup Config
 * 
 * @apiBody {String[]} Body The config file content as the request body.
 * @apiHeader {String} Content-Type text/plain content type is required for this request.
 * 
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiSuccess {string} config Content of the config file
 *  
 * @apiUse ErrorStatusMsg
 */

router.post('/post', keepRecords, authenticate, bodyparser.text(), (req, res) => {
    if (!req.body || isEmptyJson(req.body)) {
        res.status(400).json({ status: "Unsuccessful", msg: "Config is not attached." })
    } else {
        try {
            fs.writeFileSync('./config/keys.js', req.body);
            res.status(200).json({ status: "Successful", msg: "Config file changed successfully." })

        } catch (err) {
            errorSQL('Config.js - Writing Config file', err)
            res.status(400).json({ status: "Unsuccessful", msg: "Error writing the config file." })
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