## [1.8.2](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.8.1...v1.8.2) (2022-02-22)


### Bug Fixes

* handle making hsts lambda optional ([201e118](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/201e1187063b337b14165abab023649b8eeff7ad))
* update request path in tests ([f42569f](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/f42569f3ee28c81e86e992576fb6a3b11b6baacb))

## [1.8.1](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.8.0...v1.8.1) (2021-03-18)


### Bug Fixes

* optionally set origin read timeout ([e76d99c](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/e76d99cd662a511117f9caf7ed1645cd0bea01ae))

# [1.8.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.7.0...v1.8.0) (2021-03-17)


### Features

* added lambda memory variable ([4f9df6c](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/4f9df6cd2db158b90c973e72b3021e7070e0479a))

# [1.7.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.6.1...v1.7.0) (2021-03-15)


### Features

* added include body var ([caa2e44](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/caa2e442fcdfd966a74a1f95c8c97e159402490a))

## [1.6.1](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.6.0...v1.6.1) (2021-03-01)


### Bug Fixes

* using newer version of lambda module ([70cc93a](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/70cc93af468d829c218c1ddcdf1dead449425d01))

# [1.6.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.5.0...v1.6.0) (2021-02-19)


### Features

* increased HSTS header timeout and added variable ([0fbafbd](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/0fbafbd64f7671b216b3b1822b3cea89ac0b5703))

# [1.5.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.4.0...v1.5.0) (2021-02-01)


### Features

* **lambda:** optional custom lambda ([b5b72cf](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/b5b72cf35a6a3aeb83acf207cb0a512a13c3202b))

# [1.4.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.3.0...v1.4.0) (2021-01-18)


### Features

* **lambda:** stopped building lambda as part of module ([161580e](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/161580e0423cd7e7a38c76be20579b1754b8bd26))

# [1.3.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.2.4...v1.3.0) (2021-01-12)


### Bug Fixes

* correcting event types ([44ab41b](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/44ab41bd451a8d4ade8e482921dc673cb442d0a8))
* increasinng lambda timeouts ([f461efc](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/f461efc0a4e4b3ddfa78dec9e1235953abeea2f1))


### Features

* locking region ([203f65d](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/203f65d40abbaf8d57f3bfaff8b19265e0592fbb))
* **cf:** baking in the hsts header for the origin-response event ([8d58b2a](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/8d58b2ade30ce38106edf4231295e511e0f5b038))

## [1.2.4](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.2.3...v1.2.4) (2021-01-08)


### Bug Fixes

* **lambda:** removing stage from lambda name ([a3404d3](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/a3404d3509db3c4b1fe338973ddfa27dbcd4f6ad))

## [1.2.3](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.2.2...v1.2.3) (2021-01-08)


### Bug Fixes

* making aliases optional ([816926e](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/816926e2978726693d38390809918561a4fff9f0))

## [1.2.2](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.2.1...v1.2.2) (2021-01-05)


### Bug Fixes

* **docs:** fixing docs ([cb46d61](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/cb46d61d7b04c2ccf9e6106a8bc2bf87988810a5))

## [1.2.1](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.2.0...v1.2.1) (2021-01-03)


### Bug Fixes

* **main.tf:** always running lambda build - not ideal ([0a45655](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/0a45655d1af76a4ddfccf861353c6316de20e68f))

# [1.2.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.1.0...v1.2.0) (2021-01-01)


### Features

* running integration tests in branches ([2e95b37](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/2e95b37b444dc28b536d2179cd83d64eefe94533))

# [1.1.0](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.0.1...v1.1.0) (2021-01-01)


### Bug Fixes

* feedback from review, mainly involving type safety ([9f5a525](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/9f5a525b91152779842bf7bc136caaae5384dcc6))
* fixing tests ([fbdc05a](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/fbdc05a03e6e2794727fffcb78004f8d561e592a))
* making ssm parameters used by edge lambda non product specific ([c2718fa](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/c2718fa3e0dbcdf99da32626afbfdbff9469cf42))
* making ssm parameters used by edge lambda non product specific ([48b7eb2](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/48b7eb21ef778650df057e57f9b997470582cedb))


### Features

* broadened the CF distro module, updated docs ([b566caf](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/b566cafc3b0d62f71cc2904dd8d328e16a46d059))
* Initial version of module ([d9f77e9](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/d9f77e92b28716b4741a4cf510e748bc55336a24))
* moved lambda build command into var ([2e92c28](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/2e92c28a426faee95eb337f749deaaebf51bb8dc))
* removing ld routing lambda and tests, this has been moved into its own module ([11b3b1e](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/11b3b1e493a6b9b9d7ee0cb986dbd68aebd24916))

## [1.0.1](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/compare/v1.0.0...v1.0.1) (2020-12-18)


### Bug Fixes

* correcting github mirror url ([e9dc337](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/e9dc3371ba217cccef463401c9086ba96a17a0d5))

# 1.0.0 (2020-12-18)


### Features

* Initial version of module ([65f6624](http://bitbucket.org/adaptavistlabs/module-aws-cloudfront-edge-lambda/commits/65f66249ef45fa73f331bddd871fb6bf765dfbe8))
