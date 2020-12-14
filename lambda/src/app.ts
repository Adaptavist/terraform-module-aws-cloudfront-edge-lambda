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

const SR_LEGACY_DOMAIN_SSM_PATH = "/sr/legacy-root-domain"
const SR_FEATURE_FLAG_SSM_PATH = "/sr/feature-flag"
const SR_DOMAIN_SSM_PATH = "/sr/root-domain"
const LD_SDK_SSM_PATH = "/launch-darkly/dev/sdk-key"

const ssm : IParameterStore = new SsmParameterStore();

const srLegacyDomain =  ssm.getParameterValue(SR_LEGACY_DOMAIN_SSM_PATH)
const srDomain =  ssm.getParameterValue(SR_DOMAIN_SSM_PATH)
const ldSdkKey =  ssm.getParameterValue(LD_SDK_SSM_PATH)
const featureFlag =  ssm.getParameterValue(SR_FEATURE_FLAG_SSM_PATH)

let originResolver:OriginResolver;

export const handler: CloudFrontRequestHandler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {

    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const origin:CloudFrontOrigin | undefined = request.origin;

    console.info('URI : ' + request.uri);
    console.info('headers : ' + JSON.stringify(headers));
    console.info('query string : ' + request.querystring);

    if(!origin) {
        console.warn('No origin was found, returning prematurely');
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
    console.log('Init called...')
    const results = await Promise.all([ldSdkKey, srLegacyDomain, srDomain, featureFlag]);
    const sdkKey = results[0];
    const defaultDomain = results[1];    

    // We route to this domain when the feature flag is true
    const domain = results[2];
    console.info('default domain : ' + defaultDomain);
    console.info('domain : ' + domain);
    const targetFeatureFlag = results[3];

    console.info('targetFeatureFlag : ' + targetFeatureFlag);

    return new FeatureFlagOriginProvider(new LdFeatureFlagResolver(sdkKey), defaultDomain, domain, targetFeatureFlag);
}

async function processRequest(headers: CloudFrontHeaders, request: CloudFrontRequest, origin: CloudFrontOrigin): Promise<CloudFrontRequestResult> {
    const targetDomain = await originResolver.determineOriginDomain(headers, request.querystring);
    origin!.custom!.domainName = targetDomain;
    request.origin = origin;

    return request;
}
