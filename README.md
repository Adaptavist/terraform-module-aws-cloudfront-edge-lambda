# module-aws-cloudfront-router

A module which creates a CloudFront distribution which is used for setting up a CloudFront distribution which has an Edge Lambda attached. The module assumes that the edge Lambda is

## Variables

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:-----:|
| access\_logs\_bucket | If access logs are enabled the bucket the logs should go into, defaults to false. | `string` | `""` | no |
| acm\_cert\_arn | AWS ACM certificate ARN to use for the CloudFront distribution. | `string` | n/a | yes |
| aliases | Aliases used by the CloudFront distribution. | `list(string)` | n/a | yes |
| cached\_methods | HTTP methods the CloudFront distribution will cache, defaults to GET and HEAD. | `list(string)` | <pre>[<br>  "GET",<br>  "HEAD"<br>]</pre> | no |
| custom\_origin\_mappings | Custom origin mappings. Can be used in conjunction with S3 origin mappings Defaults to an empty map. | <pre>map(object({<br>    origin_id       = string<br>    domain_name     = string<br>    path_pattern    = string<br>    allowed_methods = list(string)<br>  }))</pre> | `{}` | no |
| default\_cache\_behavior | Default cache behaviour used by the distro, if a backend is static no query strings or cookies are forwarded. | <pre>object({<br>    origin_id       = string<br>    domain_name     = string<br>    static_backend  = bool<br>    allowed_methods = list(string)<br>  })</pre> | n/a | yes |
| default\_root\_object | Default root object for the CloudFront distribution, this defaults to 'index.html'. | `string` | `"index.html"` | no |
| default\_ttl | Default TTL of objects in the cache. Set to 0 if you wish to disable caching. Defaults to 3600. | `number` | `3600` | no |
| domain | Domain name to use for the CloudFront distribution. | `string` | n/a | yes |
| enable\_access\_logs | Should accesses to the CloudFront distribution be logged, defaults to false. | `bool` | `false` | no |
| geo\_restriction\_locations | The ISO 3166-1-alpha-2 codes for which you want CloudFront either to allow or disallow content delivery. | `list(string)` | `[]` | no |
| geo\_restriction\_type | The method that you want to use to restrict distribution of your content by country: 'none', 'whitelist', or 'blacklist'. Defaults to none. | `string` | `"none"` | no |
| lambda\_build\_command | Command used to build Lambda | `string` | `"npm install \u0026\u0026 npm run-script build"` | no |
| lambda\_cf\_event\_type | When to trigger the Lambda: 'viewer-request', 'origin-request', 'viewer-response', 'origin-response'. | `string` | n/a | yes |
| lambda\_code\_dir | Directory of the source code for the Edge lambda. | `string` | n/a | yes |
| lambda\_dist\_dir | Directory of compiled JS files including any dependencies. | `string` | n/a | yes |
| lambda\_name | Name to be given to the Lambda, the stage name will be appended to the end. | `string` | n/a | yes |
| log\_cookies | If access logs are enabled, are cookies logged. | `bool` | `false` | no |
| max\_ttl | Maximum TTL of objects in the cache. Set to 0 if you wish to disable caching. Defaults to 3600. | `number` | `86400` | no |
| min\_ttl | Minimum TTL of objects in the cache. Defaults to 0. | `number` | `0` | no |
| name | The name of the distribution. | `string` | n/a | yes |
| namespace | The namespace of the distribution. | `string` | n/a | yes |
| origin\_protocol\_policy | Default origin\_protocol\_policy for the CloudFront distribution, this defaults to 'https-only'. | `string` | `"https-only"` | no |
| r53\_zone\_name | Name of the public hosted zone, this is used for creating the A record for the CloudFront distro. | `string` | n/a | yes |
| s3\_origin\_mappings | S3 origin mappings. Can be used in conjunction with custom origin mappings Defaults to an empty map. | <pre>map(object({<br>    origin_id              = string<br>    domain_name            = string<br>    origin_access_identity = string<br>  }))</pre> | `{}` | no |
| stage | The stage of the distribution - (dev, staging etc). | `string` | n/a | yes |
| tags | Tags applied to the distribution, these should follow what is defined [here](https://github.com/Adaptavist/terraform-compliance/blob/master/features/tags.feature). | `map` | n/a | yes |
| viewer\_protocol\_policy | Default viewer\_protocol\_policy for the CloudFront distribution, this defaults to 'redirect-to-https'. | `string` | `"redirect-to-https"` | no |
| wait\_for\_deployment | Specifies if Terrafrom should wait for deployments to complete before returning. Defaults to true. | `bool` | `true` | no |


# custom_origin_mappings object
| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| origin_id                 | The user defined unique id of the origin.                                      |
| domain_name | The domain name of the origin. |
| path_pattern | The path which matches this origin. |
| allowed_methods | A list containing which HTTP methods CloudFront processes and forwards to the backend origin. |

# s3_origin_mappings object
| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| origin_id                 | The user defined unique id of the origin.                                      |
| domain_name | The domain name of the origin. |
| origin_access_identity | The CloudFront origin access identity to associate with the origin. |

# default_cache_behavior
| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
<<<<<<< HEAD
| origin_id                 | The user defined unique id of the origin                                      |
| domain_name | The domain name of the origin |
| allowed_methods | A list containing which HTTP methods CloudFront processes and forwards to the backend origin |
=======
| origin_id                 | The user defined unique id of the origin.                                      |
| domain_name | The domain name of the origin. |
| allowed_methods | A list containing which HTTP methods CloudFront processes and forwards to the backend origin. |


## Outputs
| Name | Description |
|------|-------------|
| cf\_arn | ARN of AWS CloudFront distribution. |
| cf\_domain\_name | Domain name corresponding to the distribution. |
| cf\_etag | Current version of the distribution's information. |
| cf\_hosted\_zone\_id | CloudFront Route 53 zone ID .|
| cf\_id | ID of AWS CloudFront distribution. |
| cf\_status | Current status of the distribution. |
| lambda\_role\_name | IAM role name given to Edge Lambda. |

>>>>>>> task/SRCLOUD-4267-assets-edge-lambda
