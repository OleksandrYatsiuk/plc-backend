import * as request from 'request';
var crypto = require('crypto');

export class LiqPayService {
    public host = 'https://www.liqpay.ua/api/';
    public = process.env.PUBLIC_KEY;
    private= process.env.PRIVATE_KEY;
    constructor() {
    }

    public cnb_signature(params) {
        params = this.cnb_params(params);
        var data = Buffer.from(JSON.stringify(params)).toString('base64');
        return this.str_to_sign(this.private + data + this.private);
    }
    public str_to_sign(str) {
        const sha1 = crypto.createHash('sha1');
        sha1.update(str);
        return sha1.digest('base64');
    };

    public cnb_params(params) {

        params.public_key = this.public;
        if (!params.version)
            throw new Error('version is null');
        if (!params.amount)
            throw new Error('amount is null');
        if (!params.currency)
            throw new Error('currency is null');
        if (!params.description)
            throw new Error('description is null');

        return params;
    };

    public cnb_object = function (params) {

        var language = "ru";
        if (params.language)
            language = params.language;

        params = this.cnb_params(params);
        var data = Buffer.from(JSON.stringify(params)).toString('base64');
        var signature = this.str_to_sign(this.private + data + this.private);

        return { data: data, signature: signature };
    };

    public cnb_form(params) {

        var language = "ru";
        if (params.language)
            language = params.language;

        params = this.cnb_params(params);
        var data = Buffer.from(JSON.stringify(params)).toString('base64');
        var signature = this.str_to_sign(this.private + data + this.private);

        return { data, signature };

    }

    public api(path, params) {

        if (!params.version)
            throw new Error('version is null');

        params.public_key = this.public;
        var data = new Buffer(JSON.stringify(params)).toString('base64');
        var signature = this.str_to_sign(this.private + data + this.private);

        request.post(this.host + path, { form: { data: data, signature: signature } }, (error, response) => {
            console.log(error);
            console.log(response.body);
        })
    }
};

