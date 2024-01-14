const fs = require('fs')

module.exports = {
    errorFile : (err)=>{
        fs.writeFile('./Errors/'+Date.now()+'.txt', err,(err)=>{
            if(err) console.log(err);
        });
    }
}