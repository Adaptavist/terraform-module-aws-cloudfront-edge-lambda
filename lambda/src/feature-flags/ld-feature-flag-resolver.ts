import {LDClient} from "launchdarkly-node-server-sdk";
import * as LaunchDarkly from "launchdarkly-node-server-sdk";
import {IFeatureFlagResolver} from "./feature-flag-resolver";
import log from 'lambda-log';

export default class LdFeatureFlagResolver implements IFeatureFlagResolver{

    static LD_CLIENT: LDClient

    constructor(sdkKey: string) {

        if(!LdFeatureFlagResolver.LD_CLIENT) {
            log.info('Creating LD client...');
            LdFeatureFlagResolver.LD_CLIENT = LaunchDarkly.init(sdkKey);
        }
    }

    public async resolveFlag(clientId: string, flag:string): Promise<boolean> {

        const user = {
            "key": clientId,
        };

        log.info(`Getting the flag ${flag} for the client id ${clientId}`)
        await LdFeatureFlagResolver.LD_CLIENT.waitForInitialization();
        try {
            const detail = await LdFeatureFlagResolver.LD_CLIENT
                .variationDetail(flag, user, false);

            log.info(`Got the flag ${flag} for the client id ${clientId}`);
            log.info(`flag value : ${detail.value}`);
            log.info(`reason kind : ${detail.reason.kind}`);
            log.info(`reason rule id : ${detail.reason.ruleId}`);
            log.info(`reason rule index : ${detail.reason.ruleIndex}`);
            log.info(`reason error kind : ${detail.reason.errorKind}`);

            return detail.value;
        } catch (err) {
            log.error(`A bad thing happened when trying to get flag : ${flag} for the client id ${clientId}`);
            log.error(err);
            throw err;
        }
    }

    public flushAndCloseClient(): void {
        LdFeatureFlagResolver.LD_CLIENT.flush((err, res) => {
            if (err) {
                log.error('Failed to flush to LD')
                log.error(err)
            } else {
                LdFeatureFlagResolver.LD_CLIENT.close()
            }
        })
    }
}
