const crypto = require('crypto');
const fs = require('fs');

const DEFAULT_ALGORITHM = 'md5';

function checksumFile(path, algorithm=DEFAULT_ALGORITHM) {
    const hash = crypto.createHash(algorithm);
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(path);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

function checksumDirectory(path, algorithm=DEFAULT_ALGORITHM) {
    const hash = crypto.createHash(algorithm);
    return new Promise(async (resolve, reject) => {
        fs.readdir(path, { withFileTypes: true }, async (err, files) => {
            if (err) {
                reject(err);
            } else {
                files.sort((a, b) => a.name.localeCompare(b.name));
                for (let file of files) {
                    if (file.isDirectory()) {
                        hash.update(await checksumDirectory(path + '/' + file.name, algorithm));
                    } else {
                        hash.update(await checksumFile(path + '/' + file.name, algorithm));
                    }
                }
                resolve(hash.digest('hex'));
            }
        });
    });
}

module.exports = {
    checksumFile,
    checksumDirectory
}
