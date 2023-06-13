const assert = require('assert');
const fsp = require('node:fs/promises');
const itParam = require('mocha-param');

const { checksumDirectory } = require('../index');

const ARTIFACTS_PATH = 'test/artifacts';

describe('checksumDirectory', function() {
    it('generates the default md5 checksum correctly', async function() {
        const testFilenameBase = `performs_md5_checksum_correctly`;
        const rootDirectoryPath = `${ARTIFACTS_PATH}/${testFilenameBase}`;
        const rootFiles = [
            {
                "name": `.env`,
                "contents": `ALGORITHM="md5"`
            },
            {
                "name": `README.md`,
                "contents": "# hello world"
            }
        ];
        const nestedDirectoryPath = `${rootDirectoryPath}/nested`;
        const nestedFiles = [
            {
                "name": `${testFilenameBase}.1.md5.txt`,
                "contents": `This is an md5 test file.`
            },
            {
                "name": `${testFilenameBase}.2.md5.txt`,
                "contents": `This is another md5 test file.`
            },
        ];

        await fsp.mkdir(nestedDirectoryPath, {recursive: true});

        for (let file of rootFiles) {
            const filePath = `${rootDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        const initialHash = await checksumDirectory(rootDirectoryPath);
        assert.strictEqual(await checksumDirectory(rootDirectoryPath), initialHash, 'identical hash after no changes');

        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, `${file.contents}-changed`);
        }
        assert.notEqual(await checksumDirectory(rootDirectoryPath), initialHash, 'different hash after file changes');
    });

    itParam(
        "generates the ${value} checksum correctly",
        ["md5", "sha1", "sha256"],
        async function (value)
    {
        const algorithm = value;
        const testFilenameBase = `performs_${algorithm}_checksum_correctly`;
        const rootDirectoryPath = `${ARTIFACTS_PATH}/${testFilenameBase}`;
        const rootFiles = [
            {
                "name": `.env`,
                "contents": `ALGORITHM="${algorithm}"`
            },
            {
                "name": `README.md`,
                "contents": "# hello world"
            }
        ];
        const nestedDirectoryPath = `${rootDirectoryPath}/nested`;
        const nestedFiles = [
            {
                "name": `${testFilenameBase}.1.${algorithm}.txt`,
                "contents": `This is an ${algorithm} test file.`
            },
            {
                "name": `${testFilenameBase}.2.${algorithm}.txt`,
                "contents": `This is another ${algorithm} test file.`
            },
        ];

        await fsp.mkdir(nestedDirectoryPath, {recursive: true});

        for (let file of rootFiles) {
            const filePath = `${rootDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        const initialHash = await checksumDirectory(rootDirectoryPath, algorithm);
        assert.strictEqual(await checksumDirectory(rootDirectoryPath, algorithm), initialHash, 'identical hash after no changes');

        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, `${file.contents}-changed`);
        }
        assert.notEqual(await checksumDirectory(rootDirectoryPath, algorithm), initialHash, 'different hash after file changes');
    })
});
