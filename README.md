# simple-recursive-checksum

![](https://img.shields.io/badge/Coverage-93%25-83A603.svg?color=black&prefix=$coverage$)

## Simple checksum determination for files or folders

A simple pure Javascript tool to get a checksum of a single file or of an entire folder.

For a single file this will use the crypto module to get a hash of the file's contents.
For a directory, it will recursively get the folder's file hashes (with the files sorted
in alphabetical order). This is not standard in any way, but is very useful nonetheless.

## Installation

```bash
npm install simple-recursive-checksum
```

## Usage

```javascript
const { checksumFile, checksumDirectory } = require("simple-recursive-checksum");

async function main() {
    const fileHashMd5 = await checksumFile("my_file.txt");
    const fileHashSha256 = await checksumFile("my_file.txt", "sha256");

    const directoryHashMd5 = await checksumDirectory("folder_name");
    const directoryHashSha256 = await checksumDirectory("folder_name", "sha256");

    console.log(fileHashMd5, fileHashSha256, directoryHashMd5, directoryHashSha256);
}

main();
```
