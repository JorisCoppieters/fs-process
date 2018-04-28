'use strict';

// ******************************
//
//
// FS PROCESS LIBRARY v1.1
//
// Version History:
//
// 1.0.1
// - Added removeFile
//
// 1.0.0
// - Stable release
//
// ******************************

// ******************************
// Utilities:
// ******************************

var fs = require('fs');
var cprint = require('color-print');
var path = require('path');
var Promise = require('bluebird');

// ******************************
// Exports:
// ******************************

module.exports = {
    read: readFileWithCb,
    write: writeFileWithCb,
    remove: removeFileWithCb,
    readWithPromise: readFileWithPromise, // TODO: Make these the default
    writeWithPromise: writeFileWithPromise, // TODO: Make these the default
    removeWithPromise: removeFileWithPromise, // TODO: Make these the default
    process: processFiles,
    list: listFiles,
};

// ******************************
// Functions:
// ******************************

function readFileWithCb (filePath, cbSuccess, cbError) {
    var file = path.resolve(process.cwd(), filePath);
    fs.readFile(file, 'utf8', function (error, data) {
        if (error) {
            cprint.red('File does not exist: ' + file);
            cprint.red('  ' + error);
            if (cbError) {
                cbError(error);
            }
        } else {
            if (cbSuccess) {
                cbSuccess(data);
            }
        }
    });
}

// ******************************

function readFileWithPromise (filePath) {
    return new Promise(function (resolve, reject) {
        readFileWithCb(filePath, function () { resolve(); }, function () { reject(); });
    });
}

// ******************************

function writeFileWithCb (filePath, fileContents, cbSuccess, cbError) {
    var file = path.resolve(process.cwd(), filePath);
    fs.writeFile(file, fileContents, 'utf8', function (error, data) {
        if (error) {
            cprint.red('Could not write to file: ' + file);
            cprint.red('  ' + error);
            if (cbError) {
                cbError(error);
            }
        } else {
            if (cbSuccess) {
                cbSuccess(data);
            }
        }
    });
}

// ******************************

function writeFileWithPromise (filePath, fileContents) {
    return new Promise(function (resolve, reject) {
        writeFileWithCb(filePath, fileContents, function () { resolve(); }, function () { reject(); });
    });
}

// ******************************

function removeFileWithCb (filePath, cbSuccess, cbError) {
    var file = path.resolve(process.cwd(), filePath);
    fs.unlink(file, function (error, data) {
        if (error) {
            cprint.red('Could not remove file: ' + file);
            cprint.red('  ' + error);
            if (cbError) {
                cbError(error);
            }
        } else {
            if (cbSuccess) {
                cbSuccess(data);
            }
        }
    });
}

// ******************************

function removeFileWithPromise (filePath) {
    return new Promise(function (resolve, reject) {
        removeFileWithCb(filePath, function () { resolve(); }, function () { reject(); });
    });
}

// ******************************

function listFiles (folder, filter) {
    return new Promise(function (resolveAll) {
        var files = fs.readdirSync(folder);
        var fileList = [];

        processFiles(files, function (file, resolve) {

            var fullPath = folder + '/' + file;

            fs.stat(fullPath, function (err, stats){
                if (!err && stats.isDirectory()) {
                    listFiles(fullPath, filter)
                    .then(function (subFileList) {
                        fileList = fileList.concat(subFileList);
                        resolve();
                    });
                } else {
                    if (!filter || file.match(new RegExp(filter))) {
                        fileList.push(fullPath);
                    }
                    resolve();
                }
            });

        }).then(function () {
            resolveAll(fileList);
        });
    });
}

// ******************************

function processFiles (files, process) {
    return new Promise(function (resolveAll) {
        var requests = files.map(function (file) {
            return new Promise(function (resolve, reject) {
                process(file, resolve, reject);
            });
        })
        Promise.all(requests).then(resolveAll);
    });
}

// ******************************
