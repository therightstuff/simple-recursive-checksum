# simple-recursive-checksum

A simple pure Javascript tool to get a checksum of a file or recursively over a folder.

For a single file this will use the crypto module to get a hash of the file's contents.
For a directory, it will recursively get the folder's file hashes (with the files sorted
in alphabetical order).
