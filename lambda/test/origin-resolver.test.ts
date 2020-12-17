import  OriginResolver  from '../src/origin-resolver';
import { expect } from 'chai';
import 'mocha';
import {CloudFrontHeaders} from "aws-lambda";

import MockFeatureFlagResolver from "./mock-feature-flag-resolver";
import FeatureFlagOriginProvider from "../src/feature-flags/feature-flag-origin-provider";

let originResolver = new OriginResolver(new FeatureFlagOriginProvider(new MockFeatureFlagResolver(), "", "", ""));
const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiNDRkNTI4YS0zYjllLTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJpYXQiOjE2MDc2ODM4MDAsImV4cCI6MTYzOTIxOTgwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.Bd3gimxBSkcCTf3Vog7bcO5VexrGPR7uFtx6hg72y8E'
const incorrectJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI0YWQzYjAxMi00MDU2LTExZWItYjM3OC0wMjQyYWMxMzAwMDIiLCJpYXQiOjE2MDgyMDI0ODQsImV4cCI6MTYzOTczODQ4NCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.KABnoJx8DFB7fc6Lsr4cgCRBrTPBw6Mo64fYPlJYdo0'

describe('`Ensure exception thrown when no token found`', () => {

  it('should throw an exception', () => {

    const queryString = '/my-service/someendpoint.do'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = function () {originResolver.extractJWT(headers, queryString)}
    expect(result).to.throw("Could not find JWT token!")
  });
});

describe('`Ensure exception thrown when no token found in empty URL parameter`', () => {

  it('should throw an exception', () => {

    const queryString = '/my-service/someendpoint.do?jwt='

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = function () {originResolver.extractJWT(headers, queryString)}
    expect(result).to.throw("Could not find JWT token!")
  });
});

describe('`Ensure exception thrown when no token found in empty HTTP header`', () => {

  it('should throw an exception', () => {

    const queryString = '/my-service/someendpoint.do'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
      key: 'Content-Type',
      value: 'application/json'
    }],
      ["authorization"]: [{
      key: 'Authorization',
      value: ''
    }],
    }

    const result = function () {originResolver.extractJWT(headers, queryString)}
    expect(result).to.throw("Could not find JWT token!")
  });
});


describe('`Extract JWT from URL query, first parameter`', () => {

  it('should return jwt token', () => {

    const queryString = 'jwt=' + jwt

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});


describe('`Extract JWT from URL query, not first parameter`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=test&jwt=' + jwt + '&name=test'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});

describe('`Extract JWT from URL query, last parameter`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=test&jwt=' + jwt + '&name=test'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});

describe('`Extract JWT from URL query, multiple parameters`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=test&jwt=' + jwt + '&name=test&jwt=' + incorrectJwt

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});


describe('`Extract JWT from URL query - escaped coded chars`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=%20test%20%3C&jwt='+ jwt + ''

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});

describe('`Extract JWT from HTTP header, first header`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=%20test%20%3C'

    const headers: CloudFrontHeaders =  {

      ["authorization"]: [{
      key: 'Authorization',
      value: 'Bearer ' + jwt + ''
      }],
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }],
    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});

describe('`Extract JWT from HTTP header, not first header`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=%20test%20%3C'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }],
      ["authorization"]: [{
        key: 'Authorization',
        value: 'Bearer ' + jwt + ''
      }],
      ["host"]: [{
        key: 'Host',
        value: 'www.google.com'
      }],

    }

    const result = originResolver.extractJWT(headers, queryString)
    expect(result).to.equal(jwt);
  });
});

describe('`Extract client key from JWT`', () => {

  it('should return client key', () => {

    const result = originResolver.extractClientKey(jwt)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});




