const assert = require("assert");
const fsp = require("node:fs/promises");
const itParam = require("mocha-param");
const os = require("os");
const path = require("path");
const fs = require("fs");

const { checksumDirectory } = require("../index");

describe("checksumDirectory", function () {
    let tempDir;

    beforeEach(async function () {
        tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "checksum-test-"));
    });

    afterEach(async function () {
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it("generates the default md5 checksum correctly", async function () {
        const rootDirectoryPath = tempDir;
        const rootFiles = [
            {
                name: `.env`,
                contents: `ALGORITHM="md5"`,
            },
            {
                name: `README.md`,
                contents: "# hello world",
            },
        ];
        const nestedDirectoryPath = path.join(rootDirectoryPath, "nested");
        const nestedFiles = [
            {
                name: `test1.md5.txt`,
                contents: `This is an md5 test file.`,
            },
            {
                name: `test2.md5.txt`,
                contents: `This is another md5 test file.`,
            },
        ];

        await fsp.mkdir(nestedDirectoryPath, { recursive: true });

        for (let file of rootFiles) {
            const filePath = `${rootDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, file.contents);
        }
        const initialHash = await checksumDirectory(rootDirectoryPath);
        assert.strictEqual(
            await checksumDirectory(rootDirectoryPath),
            initialHash,
            "identical hash after no changes"
        );

        for (let file of nestedFiles) {
            const filePath = `${nestedDirectoryPath}/${file.name}`;
            await fsp.writeFile(filePath, `${file.contents}-changed`);
        }
        assert.notEqual(
            await checksumDirectory(rootDirectoryPath),
            initialHash,
            "different hash after file changes"
        );
    });

    itParam(
        "generates the ${value} checksum correctly",
        ["md5", "sha1", "sha256"],
        async function (value) {
            const algorithm = value;
            const rootDirectoryPath = tempDir;
            const rootFiles = [
                {
                    name: `.env`,
                    contents: `ALGORITHM="${algorithm}"`,
                },
                {
                    name: `README.md`,
                    contents: "# hello world",
                },
            ];
            const nestedDirectoryPath = path.join(rootDirectoryPath, "nested");
            const nestedFiles = [
                {
                    name: `test1.${algorithm}.txt`,
                    contents: `This is an ${algorithm} test file.`,
                },
                {
                    name: `test2.${algorithm}.txt`,
                    contents: `This is another ${algorithm} test file.`,
                },
            ];

            await fsp.mkdir(nestedDirectoryPath, { recursive: true });

            for (let file of rootFiles) {
                const filePath = `${rootDirectoryPath}/${file.name}`;
                await fsp.writeFile(filePath, file.contents);
            }
            for (let file of nestedFiles) {
                const filePath = `${nestedDirectoryPath}/${file.name}`;
                await fsp.writeFile(filePath, file.contents);
            }
            const initialHash = await checksumDirectory(rootDirectoryPath, {
                algorithm,
            });
            assert.strictEqual(
                await checksumDirectory(rootDirectoryPath, { algorithm }),
                initialHash,
                "identical hash after no changes"
            );

            for (let file of nestedFiles) {
                const filePath = `${nestedDirectoryPath}/${file.name}`;
                await fsp.writeFile(filePath, `${file.contents}-changed`);
            }
            assert.notEqual(
                await checksumDirectory(rootDirectoryPath, { algorithm }),
                initialHash,
                "different hash after file changes"
            );
        }
    );

    it("handles symlinks without throwing exceptions", async function () {
        const symlinkTargetPath = path.join(tempDir, "target");
        const symlinkPath = path.join(tempDir, "symlink");

        await fsp.writeFile(
            symlinkTargetPath,
            "This is the symlink target file."
        );
        await fsp.symlink(symlinkTargetPath, symlinkPath);

        try {
            const hash = await checksumDirectory(tempDir);
            assert(
                hash,
                "A hash should be generated without throwing an exception"
            );

            // modify the symlink name and test that the hash changes
            await fsp.rename(symlinkPath, path.join(tempDir, "symlink2"));
            const newHash = await checksumDirectory(tempDir);
            assert.notEqual(
                hash,
                newHash,
                "Hash should change when symlink is renamed"
            );
        } catch (error) {
            assert.fail(`Symlink caused an exception: ${error.message}`);
        }
    });

    it("should handle special file types without error", async function () {
        const testDir = path.join(os.tmpdir(), "checksum-test-special");
        fs.mkdirSync(testDir, { recursive: true });

        // Create a regular file
        fs.writeFileSync(
            path.join(testDir, "regular.txt"),
            "regular file content"
        );

        // Create a symbolic link (if supported by the OS)
        if (process.platform !== "win32") {
            fs.symlinkSync("regular.txt", path.join(testDir, "symlink.txt"));
        }

        // Create a named pipe (if supported by the OS)
        if (process.platform !== "win32") {
            fs.mkfifoSync(path.join(testDir, "named-pipe"));
        }

        try {
            const checksum = await checksumDirectory(testDir);
            assert.ok(checksum, "Checksum should be generated without error");
        } finally {
            // Clean up
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });
});
