import {CloudFrontHeaders} from "aws-lambda";
import jwt_decode from "jwt-decode";
import * as queryStringParser from 'query-string';
import {IOriginProvider} from "./aws/origin-provider";


export default class OriginResolver {

    private static JWT_HEADER_KEY = "Authorization"
    private static AUTH_SCHEME_KEY = "Bearer "

    private originProvider: IOriginProvider;

    constructor(originProvider: IOriginProvider) {
        this.originProvider = originProvider
    }

    public extractClientKey(headers: CloudFrontHeaders, queryString : string): string {

        let token = ''

        if(queryString.indexOf("?") !== 0) {
            token = <string>queryStringParser.parse(queryString).jwt;
        }

        if(!token && headers[OriginResolver.JWT_HEADER_KEY.toLowerCase()]) {
            headers[OriginResolver.JWT_HEADER_KEY.toLowerCase()].forEach((header: { value: any; }) => {

                const value = header.value
                token = value.substr(value.indexOf(OriginResolver.AUTH_SCHEME_KEY) + OriginResolver.AUTH_SCHEME_KEY.length, value.length);
            })
        }

        if(!token) {
            throw new Error('Could not find JWT token!')
        }

        // We are only routing the request so dont need to verify the signature, this will be done downstream
        const decoded:{iss:string} = jwt_decode(token);

        return decoded.iss
    }

    public determineOriginDomain(headers: CloudFrontHeaders, uri : string): Promise<string> {
        const clientKey = this.extractClientKey(headers, uri);
        return this.originProvider.determineOrigin(clientKey);
    }
}



