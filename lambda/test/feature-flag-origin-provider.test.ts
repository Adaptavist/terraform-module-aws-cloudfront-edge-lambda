import { expect } from 'chai';
import 'mocha';

import MockFeatureFlagResolver from "./mock-feature-flag-resolver";
import FeatureFlagOriginProvider from "../src/feature-flags/feature-flag-origin-provider";

const DEFAULT_DOMAIN = "www.google.com"
const DOMAIN = "www.bbc.co.uk"

const featureFlagProvider = new FeatureFlagOriginProvider(new MockFeatureFlagResolver(), DEFAULT_DOMAIN, DOMAIN, "");

describe('`Ensure when using test client A, flag is true`', () => {

  it('should return true', () => {

    const clientKey = "client-A"

    featureFlagProvider.determineOrigin(clientKey).then(result => {
      expect(result).to.equal(DEFAULT_DOMAIN)
    })
  });
});

describe('`Ensure when using test client B, flag is true`', () => {

  it('should return true', () => {

    const clientKey = "client-B"

    featureFlagProvider.determineOrigin(clientKey).then(result => {
      expect(result).to.equal(DOMAIN)
    })
  });
});





