const fs = require('fs')

module.exports = {
    errorFile : (error)=>{
        fs.writeFile('./Errors/'+Date.now()+'.txt', JSON.stringify(error),(err)=>{
            if(err) console.log(err);
        });
    }
}