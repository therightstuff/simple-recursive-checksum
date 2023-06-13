const crypto = require('crypto');
const fs = require('node:fs');
const fsp = fs.promises;

const DEFAULT_ALGORITHM = 'md5';

async function safeStat(path) {
    const stat = await fsp.stat(path);
    delete stat["atime"];
    delete stat["atimeMs"];
    return `${stat.mode}:${stat.uid}:${stat.gid}:${stat.size}:${stat.mtime}:${stat.ctime}:${stat.birthtime}:${stat.dev}:${stat.ino}:${stat.rdev}:${stat.blksize}:${stat.blocks}`;
}

// inspired by https://stackoverflow.com/a/44643479/2860309
function checksumFile(path, algorithm=DEFAULT_ALGORITHM) {
    return new Promise(async (resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(path);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

function checksumDirectory(path, algorithm=DEFAULT_ALGORITHM) {
    return new Promise(async (resolve, reject) => {
        const hash = crypto.createHash(algorithm);

        hash.update(await safeStat(path));

        fsp.readdir(path, { withFileTypes: true })
        .then(async files => {
            files.sort((a, b) => a.name.localeCompare(b.name));
            for (let file of files) {
                hash.update(file.name);
                hash.update(await safeStat(`${path}/${file.name}`));
                if (file.isDirectory()) {
                    hash.update(await checksumDirectory(path + '/' + file.name, algorithm));
                } else {
                    hash.update(await checksumFile(path + '/' + file.name, algorithm));
                }
            }
            resolve(hash.digest('hex'));
        })
        .catch(err => reject(err));
    });
}

module.exports = {
    checksumFile,
    checksumDirectory
}
