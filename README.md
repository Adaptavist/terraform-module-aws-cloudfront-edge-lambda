# module-aws-cloudfront-router

A module which creates a CloudFront distribution which is used for routing requests to backend origins based on paths. The requests are not cached. 

## Variables

| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |                                         |
| namespace | The namespace of the distribution |
| stage | The stage of the distribution - (dev, staging etc) |
| name | The name of the distribution |
| tags | Tags applied to the distribution, these should follow what is defined [here](https://github.com/Adaptavist/terraform-compliance/blob/master/features/tags.feature)  |
| origin_mappings | A map of objects which setups up the backend origins and provides a mapping between what path matches which origin. The order of precedence matches what is populated into CloudFront, the behaviors within the cloudfront distribution are also driven by this map. See below for details on the objects properties. |
| default_cache_behavior | An objects which defines the default behaviour when no paths have been matched, see below for details on the objects properties|
| aliases | A of extra CNAMES for the distribution if any  |
| default_root_object | The object that you want CloudFront to return (for example, index.html) when an end user requests the root URL |
| viewer_protocol_policy | What protocol is used when matching requests to the distribution (allow-all, https-only, or redirect-to-https) |
| origin_protocol_policy | What protocol is used to talk to the backend origins (http-only, https-only, or match-viewer.) |
| acm_cert_arn | ARN of the ACM managed SSL cert for the CloudFront distribution  |
| lambda_dist_dir | Directory of compiled JS files including any dependencies |
| lambda_code_dir | Directory of the source code for the Edge lambda |
| lambda_name | Name to be given to the Lambda, the stage name will be appended to the end  |


# origin_mappings object
| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| origin_id                 | The user defined unique id of the origin                                      |
| domain_name | The domain name of the origin |
| path_pattern | The path which matches this origin |
| allowed_methods | A list containing which HTTP methods CloudFront processes and forwards to the backend origin |


# default_cache_behavior
| Name                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| origin_id                 | The user defined unique id of the origin                                      |
| domain_name | The domain name of the origin |
| allowed_methods | A list containing which HTTP methods CloudFront processes and forwards to the backend origin |