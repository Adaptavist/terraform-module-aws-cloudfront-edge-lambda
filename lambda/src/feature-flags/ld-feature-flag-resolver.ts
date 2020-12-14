import {LDClient} from "launchdarkly-node-server-sdk";
import * as LaunchDarkly from "launchdarkly-node-server-sdk";
import {IFeatureFlagResolver} from "./feature-flag-resolver";

export default class LdFeatureFlagResolver implements IFeatureFlagResolver{

    private static LD_CLIENT: LDClient

    constructor(sdkKey: string) {

        if(!LdFeatureFlagResolver.LD_CLIENT) {
            console.info('Creating LD client...');
            LdFeatureFlagResolver.LD_CLIENT = LaunchDarkly.init(sdkKey);
        }
    }

    public async resolveFlag(clientId: string, flag:string): Promise<boolean> {

        const user = {
            "key": clientId,
        };

        console.info(`Getting the flag ${flag} for the client id ${clientId}`)
        await LdFeatureFlagResolver.LD_CLIENT.waitForInitialization();
        try {
            const detail = await LdFeatureFlagResolver.LD_CLIENT
                .variationDetail(flag, user, false);
            
            console.info(`Got the flag ${flag} for the client id ${clientId}`);
            console.info(`flag value : ${detail.value}`);
            console.info(`reason kind : ${detail.reason.kind}`);
            console.info(`reason rule id : ${detail.reason.ruleId}`);
            console.info(`reason rule index : ${detail.reason.ruleIndex}`);
            console.info(`reason error kind : ${detail.reason.errorKind}`);
            
            return detail.value;
        } catch (err) {
            console.error(`A bad thing happened when trying to get flag : ${flag} for the client id ${clientId}`);
            console.error(err);
            throw err;
        }
    }

    public flushAndCloseClient(): void {
        LdFeatureFlagResolver.LD_CLIENT.flush((err, res) => {
            if (err) {
                console.error('Failed to flush to LD')
                console.error(err)
            } else {
                LdFeatureFlagResolver.LD_CLIENT.close()
            }
        })
    }
}
