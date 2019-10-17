const Minio = require('minio'),
    streamifier = require('streamifier');

let minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

let minioHelper = {
    getListConfBuckets: () => {
        return new Promise((resolve, reject) => {
            console.log("Récupération de l'ensemble des buckets");

            minioClient.listBuckets(function (err, buckets) {
                if (err) {
                    console.log("errrrrrrrrror", err);
                    reject({ err: err })
                }
                console.log("Récupération des buckets terminé", buckets);

                resolve({ result: buckets });
            });
        });
    },
    getListConfFiles: bucketName => {
        return new Promise((resolve, reject) => {
            let filesList = [];

            let error = checkBody(null, bucketName);

            if (error.length != 0) {
                reject({ err: error });
            }

            console.log("Récupération de tous les fichiers du bucket " + bucketName);

            let stream = minioClient.listObjects(bucketName, '', true);
            stream.on('data', data => { filesList.push(data.name); });

            stream.on('error', err => { reject({ err: err }) });

            stream.on('end', () => {
                console.log("Fin de récupération des données pour le bucket " + bucketName + " terminé");
                resolve({ result: filesList })
            });
        });
    },
    getFile: body => {
        console.log("yooooooolo");

        return new Promise((resolve, reject) => {
            var size = 0;

            let error = checkBody(body, false, true, true);
            let bucketName = body.bucketName, fileName = body.fileName;
            console.log("body.bucketName, body.fileName", bucketName, fileName);
            console.log("error", error, error.length);

            if (error.length != 0) {
                console.log("erronnnnnnnnr", error, error.length);
                reject({ err: error });
            }

            console.log("Récupération du contenu du fichier " + fileName + " du bucket " + bucketName);

            minioClient.getObject(bucketName, fileName, function (err, dataStream) {
                console.log("tes");

                if (err) {
                    console.log("err 1", err)
                    reject({ err: err })
                }
                dataStream.on('data', function (chunk) {
                    console.log("chunk", chunk);

                    size += chunk.length;
                })
                dataStream.on('end', function () {
                    console.log('End. Total size = ' + size)
                    console.log("dataStream", dataStream);
                    
                    resolve({ result: { file: "ok" } });
                })
                dataStream.on('error', function (err) {
                    console.log("err 2", err)
                    reject({ err: err });
                })
            });
        });
    },
    createFile: body => {
        return new Promise((resolve, reject) => {
            let bucketName = body.bucketName,
                fileName = body.fileName;
            // filePath = body.filePath;

            let error = checkBody(body, false, true, true, true, true);

            if (error.length != 0) {
                reject({ err: error });
            }

            console.log("Création du fichier " + fileName + " dans le bucket " + bucketName);

            minioHelper.bucketExist(bucketName)
                .then(isBucketExist => {
                    let metaData = {
                        'Content-Type': 'application/octet-stream',
                        'X-Amz-Meta-Testing': 1234,
                        'example': 5678
                    }

                    if (!isBucketExist) {
                        reject({ err: { errBucketNotExist: true } })
                    } else {
                        minioHelper.getListConfFiles(bucketName)
                            .then(result => {
                                let filesList = result.result;
                                console.log("filesList", filesList);

                                // Check if the file exist
                                if (!filesList.includes(fileName)) {
                                    // Using fPutObject API upload your file to the bucket.
                                    minioClient.putObject(bucketName, fileName, fileStream, fileSize, function (err, etag) {
                                        // minioClient.putObject(bucketName, fileName, streamifier.createReadStream(fileStream), fileSize, function (err, etag) {
                                        if (err) {
                                            reject({ err: { err: true } });
                                        }

                                        console.log(fileName + ' file uploaded successfully.')
                                        resolve({ result: { fileName: fileName } });
                                    });

                                } else {
                                    reject({ err: { errFileExist: true } })
                                }
                            })
                            .catch(err => reject(err));
                    }
                })
                .catch(err => reject(err));
        });
    },
    bucketExist: bucketName => {
        return new Promise((resolve, reject) => {
            minioClient.bucketExists(bucketName, function (err, exists) {
                if (err) {
                    reject({ err: err });
                }
                exists ? resolve(true) : resolve(false);
            });
        });
    },
    createBucket: bucketName => {
        return new Promise((resolve, reject) => {
            let error = checkBody(null, bucketName);

            if (error.length != 0) {
                reject({ err: error });
            }

            console.log("Création du bucket ", bucketName);

            minioHelper.bucketExist(bucketName)
                .then(isBucketExist => {
                    console.log("isBucketExist", isBucketExist);

                    if (!isBucketExist) {
                        minioClient.makeBucket(bucketName, function (err, exists) {
                            if (err) {
                                reject({ err: err });
                            }
                            resolve({ result: { bucketName: bucketName } })
                        });
                    } else {
                        reject({ err: { errBucketExist: true } });
                    }
                }).catch(err => reject(err));
        });
    },
    removeFile: body => {
        return new Promise((resolve, reject) => {
            let bucketName = body.bucketName, fileName = body.fileName;

            let error = checkBody(body, false, true, true);

            if (error.length != 0) {
                reject({ err: error });
            }

            console.log("Suprression du fichier " + fileName + " dans le bucket " + bucketName);

            minioClient.removeObject(bucketName, fileName, function (err) {
                if (err) {
                    console.log("errrrrrrrrror", err);
                    reject({ err: err })
                }

                resolve({
                    result: {
                        bucketName: bucketName,
                        fileName: fileName
                    }
                });
            });
        });
    },
    removeAllFiles: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.getListConfFiles(bucketName)
                .then(result => {
                    let filesList = result.result
                    console.log("filesList", bucketName, filesList);

                    if (filesList.length != 0) {
                        // TODO: Gérer les accents
                        console.log("PB avec les accent");
                        minioClient.removeObjects(bucketName, filesList, function (err) {
                            if (err) {
                                console.log("errrrrrrrr", err);

                                reject({ err: err });
                            }

                            console.log("All filse are deleting");
                            resolve({ result: { removeAllFiles: true } })
                        });
                    } else {
                        resolve({ err: { bucketNotEmpty: true } });
                    }
                }).catch(err => {
                    reject(err);
                });
        });
    },
    removeBucket: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.removeAllFiles(bucketName)
                .then(result => {
                    if (result.removeAllFiles || result.err.bucketNotEmpty) {
                        minioClient.removeBucket(bucketName, function (err) {
                            if (err) {
                                console.log('Erreur lors de la suppression du bucket ', bucketName)
                                reject({ err: err })
                            }
                            console.log('Bucket supprmiée avec succès.')
                            resolve({ result: { bucketName: bucketName } });
                        });
                    } else {
                        reject({ err: { errNotRemoved: true } });
                    }
                }).catch(err => {
                    reject(err);
                });
        });
    }
}

function checkBody(body, bucketName, checkBucketName, checkFileName, checkFileStream, checkFileSize) {
    let error = [];

    if (!body && !bucketName) {
        error.push({ errBucketName: true });
    } else if (body) {
        if (checkBucketName && !body.bucketName) {
            error.push({ errBucketName: true });
        }

        if (checkFileName && !body.fileName) {
            error.push({ errFileName: true });
        }

        if (checkFileStream && !body.fileStream) {
            error.push({ errFileStream: true });
        }

        if (checkFileSize && !body.fileSize) {
            error.push({ errFileSize: true });
        }
    }

    return error;
}

module.exports = minioHelper;