const fs = require('fs')
const jwt = require('jsonwebtoken')
const config = require('../config/keys')

module.exports = {
    errorFile: (error, place = "") => {
        fs.writeFile('./Errors/' + Date.now() + '.txt', JSON.stringify({ place, error }), (err) => {
            if (err) console.log(err);
        });
    },

    authenticate: (req, res, next) => {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            req.token = bearerToken;
            jwt.verify(req.token, config.jwtSecret, (err, authData) => {
                if (err) {
                    res.status(403).json({ status: "Token Expired.", msg: "Login again." })
                } else {
                    next()
                }
            })
        } else {
            res.status(403).json({ status: "Token Expired", msg: "Re-Login." });
        }
    }

}