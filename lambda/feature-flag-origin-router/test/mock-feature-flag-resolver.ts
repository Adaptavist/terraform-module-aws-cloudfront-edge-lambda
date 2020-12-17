import {IFeatureFlagResolver} from "../src/feature-flags/feature-flag-resolver";

export default class MockFeatureFlagResolver implements IFeatureFlagResolver {

    resolveFlag(clientId: string, flag: string): Promise<boolean> {

        if(clientId === 'client-A') {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
}
