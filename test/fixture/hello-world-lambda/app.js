'use strict';

exports.handler = (event, context, callback) => {

    const response = event.Records[0].cf.response;

    response.headers['content-type'] = [{
        key: 'Content-Type',
        value: 'application/json'
    }]

    response.headers['message'] = [{
        key: 'message',
        value: 'hello-world'
    }]

    callback(null, response);
};
