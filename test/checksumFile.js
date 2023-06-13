const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');

const { checksumFile } = require('../index');

const ARTIFACTS_PATH = 'test/artifacts';

describe('checksumFile', function() {
    it('performs an md5 checksum correctly', async function() {
        const fileContents = 'This is an md5 test file.';
        const expectedHash = '4816f5071bc5556339013096b0059e5d';

        const hash = crypto.createHash('md5');
        hash.update(fileContents);
        assert.strictEqual(hash.digest('hex'), expectedHash);

        fs.mkdirSync(ARTIFACTS_PATH, {recursive: true});
        const filePath = `${ARTIFACTS_PATH}/testfile.md5.txt`;
        fs.writeFileSync(filePath, fileContents);
        assert.strictEqual(await checksumFile(filePath), expectedHash);
    });

    it('performs a sha1 checksum correctly', async function() {
        const fileContents = 'This is a sha1 test file.';
        const expectedHash = '6be379be42f0e61ad299c81277b5203aa4f2b645';

        const hash = crypto.createHash('sha1');
        hash.update(fileContents);
        assert.strictEqual(hash.digest('hex'), expectedHash);

        fs.mkdirSync(ARTIFACTS_PATH, {recursive: true});
        const filePath = `${ARTIFACTS_PATH}/testfile.sha1.txt`;
        fs.writeFileSync(filePath, fileContents);
        assert.strictEqual(await checksumFile(filePath, 'sha1'), expectedHash);
    });
});
