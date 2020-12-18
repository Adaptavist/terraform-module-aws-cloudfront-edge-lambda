import {
    CloudFrontRequestHandler,
    CloudFrontRequestEvent,
    CloudFrontRequestResult,
    CloudFrontHeaders,
    CloudFrontRequest,
} from 'aws-lambda';

import {IParameterStore} from "./aws/parameter-store";
import SsmParameterStore from "./aws/ssm-parameter-store";
import OriginResolver from "./origin-resolver";
import FeatureFlagOriginProvider from "./feature-flags/feature-flag-origin-provider";
import LdFeatureFlagResolver from "./feature-flags/ld-feature-flag-resolver";
import {CloudFrontOrigin} from "aws-lambda/common/cloudfront";
import log from 'lambda-log';

const LEGACY_DOMAIN_SSM_PATH = "/routing/legacy-root-domain"
const FEATURE_FLAG_SSM_PATH = "/routing/feature-flag"
const DOMAIN_SSM_PATH = "/routing/root-domain"
const LD_SDK_SSM_PATH = "/launch-darkly/sdk-key"

const ssm : IParameterStore = new SsmParameterStore();

const srLegacyDomain =  ssm.getParameterValue(LEGACY_DOMAIN_SSM_PATH)
const srDomain =  ssm.getParameterValue(DOMAIN_SSM_PATH)
const ldSdkKey =  ssm.getParameterValue(LD_SDK_SSM_PATH)
const featureFlag =  ssm.getParameterValue(FEATURE_FLAG_SSM_PATH)

let originResolver:OriginResolver;

export const handler: CloudFrontRequestHandler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {

    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const origin:CloudFrontOrigin | undefined = request.origin;

    log.info('URI : ' + request.uri);
    log.info('headers : ' + JSON.stringify(headers));
    log.info('query string : ' + request.querystring);

    if(!origin) {
        log.warn('No origin was found, returning prematurely');
        return
    }

    if(!originResolver) {
        return initRouterProvider().then(originRouterProvider => {
            originResolver = new OriginResolver(originRouterProvider);
            return processRequest(headers, request, origin)
        })
    } else {
       return processRequest(headers, request, origin)
    }
}

async function initRouterProvider() : Promise<FeatureFlagOriginProvider>{
    log.info('Init called...')
    const results = await Promise.all([ldSdkKey, srLegacyDomain, srDomain, featureFlag]);
    const sdkKey = results[0];
    const defaultDomain = results[1];

    // We route to this domain when the feature flag is true
    const domain = results[2];
    log.info('default domain : ' + defaultDomain);
    log.info('domain : ' + domain);
    const targetFeatureFlag = results[3];

    log.info('targetFeatureFlag : ' + targetFeatureFlag);

    return new FeatureFlagOriginProvider(new LdFeatureFlagResolver(sdkKey), defaultDomain, domain, targetFeatureFlag);
}

async function processRequest(headers: CloudFrontHeaders, request: CloudFrontRequest, origin: CloudFrontOrigin): Promise<CloudFrontRequestResult> {
    const targetDomain = await originResolver.determineOriginDomain(headers, request.querystring);

    if(origin.custom) {
        origin.custom.domainName = targetDomain;
    } else if(origin.s3) {
        origin.s3.domainName = targetDomain;
    }

    request.origin = origin;

    return request;
}
