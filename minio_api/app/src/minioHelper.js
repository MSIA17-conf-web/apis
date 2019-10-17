const Minio = require('minio');

let minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

let minioHelper = {
    getListConf: async bucketName => {
        return new Promise((resolve, reject) => {
            let bucketList = [];

            console.log("Récupération des données pour le bucket " + bucketName);

            let stream = minioClient.listObjects(bucketName, '', true);
            stream.on('data', data => { bucketList.push(data.name); });

            stream.on('error', err => { reject({ err: err }) });

            stream.on('end', () => {
                console.log("Récupération des données pour le bucket " + bucketName + " terminé");
                resolve({ result: bucketList })
            });
        });
    },
    createObject: body => {
        return new Promise((resolve, reject) => {
            let fileName = body.fileName,
                bucketName = body.bucketName,
                filePath = body.filePath,
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

                    if (!bucketName || !fileName || !filePath || !isBucketExist) {
                        if (!bucketName) {
                            error.push({ errBucketName: true })
                        }

                        if (!fileName) {
                            error.push({ errFileName: true })
                        }

                        if (!filePath) {
                            error.push({ errFilePath: true })
                        }

                        if (!isBucketExist) {
                            error.push({ errBucketExist: false })
                        }

                        reject({ err: error })
                    }

                    if (isBucketExist) {
                        minioHelper.getListConf(bucketName)
                            .then(result => {
                                let bucketList = result.result;
                                console.log("bucketList", bucketList);

                                // Check if the file exist
                                if (!bucketList.includes(fileName)) {
                                    // Using fPutObject API upload your file to the bucket.
                                    minioClient.fPutObject(bucketName, fileName, filePath, metaData, function (err, etag) {
                                        if (err) {
                                            reject({
                                                err: [{
                                                    err: true
                                                }]
                                            });
                                        }

                                        console.log(fileName + ' file uploaded successfully.')
                                        resolve({ fileName: fileName });
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
    createBucket: async bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.bucketExist(bucketName)
                .then(isBucketExist => {
                    console.log("isBucketExist", isBucketExist);

                    if (!isBucketExist) {
                        minioClient.makeBucket(bucketName, function (err, exists) {
                            if (err) {
                                reject({ err: err });
                            }
                            resolve({ bucketName: bucketName })
                        });
                    }
                    else {
                        reject({ errBucketExist: true });
                    }
                }).catch(err => reject({ err: err }));
        });
    },
    removeObject: body => {
        return new Promise((resolve, reject) => {
            let bucketName = body.bucketName, fileName = body.fileName;

            minioClient.removeObject(bucketName, fileName, function (err) {
                if (err) {
                    console.log("errrrrrrrrror", err);
                    reject(err)
                }

                resolve({
                    bucketName: bucketName,
                    fileName: fileName
                });
            });
        });
    },
    removeAllObjects: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.getListConf(bucketName)
                .then(result => {
                    let bucketList = result.result

                    if (bucketList.length != 0) {
                        minioClient.removeObjects(bucketName, bucketList, function (err) {
                            if (err) {
                                reject(err)
                            }

                            console.log("All objects are deleting");
                            resolve(true)
                        });
                    } else {
                        resolve({bucketNotEmpty: true});
                    }
                }).catch(err => reject(err));
        });
    },
    removeBucket: bucketName => {
        return new Promise((resolve, reject) => {
            minioHelper.removeAllObjects(bucketName)
                .then(result => {
                    if (result || result.bucketNotEmpty) {
                        minioClient.removeBucket(bucketName, function (err) {
                            if (err) {
                                console.log('unable to remove bucket.')
                                reject({ err: err })
                            }
                            console.log('Bucket removed successfully.')
                            resolve({ bucketName: bucketName })
                        });
                    } else {
                        reject({ errNotRemoved: true })
                    }
                })
        }).catch(err => reject(err));
    }
}

module.exports = minioHelper;