import {IParameterStore} from "../src/aws/parameter-store";
import SsmParameterStore from "../src/aws/ssm-parameter-store";
import LdFeatureFlagResolver from "../src/feature-flags/ld-feature-flag-resolver";
import 'mocha';

import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const LD_SDK_SSM_PATH = "/launch-darkly/dev/sdk-key"
const SSM : IParameterStore = new SsmParameterStore();
const FEATURE_FLAG_KEY = "display-contact-form"

describe('`Ensure flag can be obtained`', function () {
    this.timeout(5000);

    it('should return a value for the flag', function() {
        return expect(SSM.getParameterValue(LD_SDK_SSM_PATH).then(key => {
            const flagResolver = new LdFeatureFlagResolver(key);

            return flagResolver
                .resolveFlag("dec00c86-3a15-11eb-adc1-0242ac120002", FEATURE_FLAG_KEY)
                .then(flagValue => {
                    flagResolver.flushAndCloseClient()
                    return flagValue;
                });
        })).to.eventually.equal(true)
    });
});


