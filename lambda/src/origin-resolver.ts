import {CloudFrontHeaders} from "aws-lambda";
import jwt_decode from "jwt-decode";
import * as queryStringParser from 'query-string';
import {IOriginProvider} from "./aws/origin-provider";


export default class OriginResolver {

    static JWT_HEADER_KEY = "Authorization"
    static AUTH_SCHEME_KEY = "Bearer "

    originProvider: IOriginProvider;

    constructor(originProvider: IOriginProvider) {
        this.originProvider = originProvider
    }

    public extractJWT(headers: CloudFrontHeaders, queryString : string): string {

        let token: string = '';

        if(queryString.indexOf("?") !== 0) {
            let potentialTokenMatches = <string | string[]>queryStringParser.parse(queryString).jwt;
            token = Array.isArray(potentialTokenMatches) ? potentialTokenMatches[0] : potentialTokenMatches
        }

        if(!token && headers[OriginResolver.JWT_HEADER_KEY.toLowerCase()]) {
            const value = headers[OriginResolver.JWT_HEADER_KEY.toLowerCase()].values().next().value.value
            token = value.substr(value.indexOf(OriginResolver.AUTH_SCHEME_KEY) + OriginResolver.AUTH_SCHEME_KEY.length, value.length);
        }

        if(!token) {
            throw new Error('Could not find JWT token!')
        }

        return token
    }

    public extractClientKey(token : string): string {

        // We are only routing the request so dont need to verify the signature, this will be done downstream
        const decoded:{iss:string} = jwt_decode(token);

        return decoded.iss
    }

    public determineOriginDomain(headers: CloudFrontHeaders, uri : string): Promise<string> {
        const clientKey = this.extractClientKey(this.extractJWT(headers, uri));
        return this.originProvider.determineOrigin(clientKey);
    }
}



