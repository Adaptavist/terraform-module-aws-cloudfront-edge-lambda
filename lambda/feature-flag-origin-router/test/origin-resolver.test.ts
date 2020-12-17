import  OriginResolver  from '../src/origin-resolver';
import { expect } from 'chai';
import 'mocha';
import {CloudFrontHeaders} from "aws-lambda";

import MockFeatureFlagResolver from "./mock-feature-flag-resolver";
import FeatureFlagOriginProvider from "../src/feature-flags/feature-flag-origin-provider";

let originResolver = new OriginResolver(new FeatureFlagOriginProvider(new MockFeatureFlagResolver(), "", "", ""));
const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiNDRkNTI4YS0zYjllLTExZWItYWRjMS0wMjQyYWMxMjAwMDIiLCJpYXQiOjE2MDc2ODM4MDAsImV4cCI6MTYzOTIxOTgwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.Bd3gimxBSkcCTf3Vog7bcO5VexrGPR7uFtx6hg72y8E'

describe('`Ensure exception thrown when no token found`', () => {

  it('should throw an exception', () => {

    const queryString = '/my-service/someendpoint.do'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = function () {originResolver.extractClientKey(headers, queryString)}
    expect(result).to.throw("Could not find JWT token!")
  });
});


describe('`Extract client key from URL query, first parameter`', () => {

  it('should return jwt token', () => {

    const queryString = 'jwt=' + jwt

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});


describe('`Extract client key from URL query, not first parameter`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=test&jwt=\n' + jwt + '&name=test'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});

describe('`Extract client key from URL query, last parameter`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=test&jwt=\n' + jwt + '&name=test'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});


describe('`Extract client key from URL query - escaped coded chars`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=%20test%20%3C&jwt=\n'+ jwt + ''

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }]
    }

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});

describe('`Extract client key from HTTP header, first header`', () => {

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

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});

describe('`Extract client key from HTTP header, not first header`', () => {

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

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});

describe('`Extract client key from HTTP header, last header`', () => {

  it('should return jwt token', () => {

    const queryString = '/my-service/someendpoint?someOtherQueryParameter=%20test%20%3C'

    const headers: CloudFrontHeaders =  {
      ["content-type"]: [{
        key: 'Content-Type',
        value: 'application/json'
      }],
      ["host"]: [{
        key: 'Host',
        value: 'www.google.com'
      }],
      ["authorization"]: [{
        key: 'Authorization',
        value: 'Bearer ' + jwt + ''
      }]
    }

    const result = originResolver.extractClientKey(headers, queryString)
    expect(result).to.equal('b44d528a-3b9e-11eb-adc1-0242ac120002');
  });
});




