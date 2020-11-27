const process = require('child_process');

module.exports = {
    async rmdir(path) {
        return new Promise((resolve, reject) => {
            const command = 'rm -rf ' + path;
            process.exec(command, (stdout, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        })
    },

};