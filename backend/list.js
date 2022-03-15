const {LIST_SOURCE, S3_BUCKET} = require("./config");
const AWS = require('aws-sdk');
const fs = require("fs");

let source = LIST_SOURCE;

if(source === 's3' && !S3_BUCKET) source = 'local';

const handlers = {
    local: () => {
        const staticListJSONBuffer = fs.readFileSync('./assets/sites_list.json');
        const listJsonString = staticListJSONBuffer.toString('utf-8');
        return JSON.parse(listJsonString);
    },
    s3: () => {
        const s3 = new AWS.S3();
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: 'sites_list.json'
        };

        return new Promise(resolve => {
            s3.getObject(s3Params, async function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                resolve(JSON.parse(res.Body.toString()));
            });
        }).catch(console.log);
    }
}

module.exports = handlers[source];