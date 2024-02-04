const fs = require('fs')
const jwt = require('jsonwebtoken')
const config = require('../config/keys')

module.exports = {
    errorFile: (place, error) => {
        console.log({es:error});
        fs.writeFileSync('./Errors/' + `${Date.now()}.${place}` + '.txt', `${JSON.stringify({ place, error: `${error}` })}`, (err) => {
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