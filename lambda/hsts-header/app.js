'use strict';

exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const hstsMaxAge = 31536000;

    response.headers['strict-transport-security'] = [{
        key: 'Strict-Transport-Security',
        value: `max-age=${hstsMaxAge}`,
    }];

    callback(null, response);
};