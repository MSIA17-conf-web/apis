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
            let objectsList = [];

            console.log("Récupération des données pour le bucket " + bucketName);

            let stream = minioClient.listObjects(bucketName, '', true);
            stream.on('data', data => { objectsList.push(data.name); });

            stream.on('error', err => { reject({ err: err }) });

            stream.on('end', () => {
                console.log("Fin de récupération des données pour le bucket " + bucketName + " terminé");
                resolve({ result: objectsList })
            });
        });
    },
    createObject: body => {
        return new Promise((resolve, reject) => {
            let fileName = body.fileName,
                bucketName = body.bucketName,
                // filePath = body.filePath,
                fileStream = body.fileStream,
                fileSize = body.fileSize,
                error = [],
                isBucketExist = false;

            minioHelper.bucketExist(bucketName)
                .then(result => {
                    isBucketExist = result
                    // Make a bucket called europetrip.
                    let metaData = {
                        'Content-Type': 'application/octet-stream',
                        'X-Amz-Meta-Testing': 1234,
                        'example': 5678
                    }

                    if (!bucketName || !fileName || !fileStream || !isBucketExist || !fileSize) {
                        if (!bucketName) {
                            error.push({ errBucketName: true })
                        }

                        if (!fileName) {
                            error.push({ errFileName: true })
                        }

                        if (!fileStream) {
                            error.push({ errFileStream: true })
                        }

                        if (!isBucketExist) {
                            error.push({ errBucketExist: false })
                        }

                        if (!fileSize) {
                            error.push({ errFileSize: false })
                        }

                        reject({ err: error })
                    }

                    if (isBucketExist) {
                        minioHelper.getListConfFiles(bucketName)
                            .then(result => {
                                let objectsList = result.result;
                                console.log("objectsList", objectsList);

                                // Check if the file exist
                                if (!objectsList.includes(fileName)) {
                                    
                                    
                                    // Using fPutObject API upload your file to the bucket.
                                    minioClient.putObject(bucketName, fileName, streamifier.createReadStream(new Buffer(fileStream, "base64").toString('ascii')), fileSize, function (err, etag) {
                                    // minioClient.putObject(bucketName, fileName, streamifier.createReadStream(fileStream), fileSize, function (err, etag) {
                                        if (err) {
                                            reject({ err: [{ err: true }] });
                                        }

                                        console.log(fileName + ' file uploaded successfully.')
                                        resolve({ result: { fileName: fileName } });
                                    });

                                } else {
                                    error.push({ errFileExist: true })
                                    reject({ err: error })
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
    removeObject: body => {
        return new Promise((resolve, reject) => {
            let bucketName = body.bucketName, fileName = body.fileName;

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
    removeAllObjects: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.getListConfFiles(bucketName)
                .then(result => {
                    let objectsList = result.result

                    if (objectsList.length != 0) {
                        minioClient.removeObjects(bucketName, objectsList, function (err) {
                            if (err) {
                                reject({ err: err })
                            }

                            console.log("All objects are deleting");
                            resolve({result : {removeAllObjects: true}})
                        });
                    } else {
                        resolve({err:{ bucketNotEmpty: true }});
                    }
                }).catch(err => reject(err));
        });
    },
    removeBucket: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.removeAllObjects(bucketName)
                .then(result => {
                    if (result.removeAllObjects || result.bucketNotEmpty) {
                        minioClient.removeBucket(bucketName, function (err) {
                            if (err) {
                                console.log('unable to remove bucket.')
                                reject({ err: err })
                            }
                            console.log('Bucket removed successfully.')
                            resolve({ result: { bucketName: bucketName } });
                        });
                    } else {
                        reject({err : { errNotRemoved: true }});
                    }
                })
        }).catch(err => reject(err));
    }
}

module.exports = minioHelper;