import {IFeatureFlagResolver} from "./feature-flag-resolver";
import {IOriginProvider} from "../aws/origin-provider";

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

    public async determineOrigin(clientId: string): Promise<string> {

        const flag = await this.flagResolver.resolveFlag(clientId, this.featureFlag);

        const targetDomain = flag ? this.flagEnabledDomain : this.defaultDomain;

        console.info(`Determined the origin ${targetDomain} for the client id ${clientId}`);
        return targetDomain;

    }
}
