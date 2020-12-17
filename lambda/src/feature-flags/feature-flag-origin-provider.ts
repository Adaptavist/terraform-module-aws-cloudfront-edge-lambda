import {IFeatureFlagResolver} from "./feature-flag-resolver";
import {IOriginProvider} from "../aws/origin-provider";
import log from 'lambda-log';

export default class FeatureFlagOriginProvider implements IOriginProvider{

    readonly defaultDomain;
    readonly flagEnabledDomain;
    readonly flagResolver;
    readonly featureFlag;

    constructor(flagResolver: IFeatureFlagResolver, defaultDomain: string, flagEnabledDomain: string, featureFlag : string) {

        this.defaultDomain = defaultDomain;
        this.flagEnabledDomain = flagEnabledDomain;
        this.flagResolver = flagResolver;
        this.featureFlag = featureFlag
    }

    async determineOrigin(clientId: string): Promise<string> {
        return this.flagResolver.resolveFlag(clientId, this.featureFlag).then(flag => {            
            const targetDomain =  flag ? this.flagEnabledDomain : this.defaultDomain
            log.info(`Determined the origin ${targetDomain} for the client id ${clientId}`)    
            return targetDomain
        })
    }
}
