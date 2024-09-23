const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs").promises;
const itParam = require("mocha-param");
const os = require("os");
const path = require("path");

const { checksumFile } = require("../index");

describe("checksumFile", function () {
    let tempDir;

    beforeEach(async function () {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "checksum-test-"));
    });

    afterEach(async function () {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it("generates the default md5 checksum correctly", async function () {
        const fileContents = "This is an md5 test file.";
        const expectedHash = "4816f5071bc5556339013096b0059e5d";

        const hash = crypto.createHash("md5");
        hash.update(fileContents);
        assert.strictEqual(hash.digest("hex"), expectedHash);

        const filePath = path.join(tempDir, "testfile.md5.txt");
        await fs.writeFile(filePath, fileContents);
        assert.strictEqual(await checksumFile(filePath), expectedHash);
    });

    itParam(
        "generates the ${value.name} checksum correctly",
        [
            { name: "md5", hash: "8147d9006822bd584eb438e9c22d5619" },
            { name: "sha1", hash: "4e23988f59842887688e889457b7fed81f81ab6e" },
            {
                name: "sha256",
                hash: "cab017a7f93005e1f07eb1657c79edfbb696f5c70fcf170374e1cf996a36c4c5",
            },
        ],
        async function (value) {
            const algorithm = value.name;
            const fileContents = `This is a(n) ${algorithm} test file.`;
            const expectedHash = value.hash;

            const hash = crypto.createHash(algorithm);
            hash.update(fileContents);
            assert.strictEqual(hash.digest("hex"), expectedHash);

            const filePath = path.join(tempDir, `testfile.${algorithm}.txt`);
            await fs.writeFile(filePath, fileContents);
            assert.strictEqual(
                await checksumFile(filePath, { algorithm }),
                expectedHash
            );
        }
    );
});
