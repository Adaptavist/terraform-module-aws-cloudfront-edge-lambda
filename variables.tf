// R53
variable "r53_zone_name" {
  type        = string
  description = "Name of the public hosted zone, this is used for creating the A record for the CloudFront distro."
}

variable "domain" {
  type        = string
  description = "Domain name to use for the CloudFront distribution."
}

// CloudFront distribution
variable "custom_origin_mappings" {
  type = map(object({
    origin_id       = string
    domain_name     = string
    path_pattern    = string
    allowed_methods = list(string)
  }))
  default     = {}
  description = "Custom origin mappings. Can be used in conjunction with S3 origin mappings Defaults to an empty map."
}

variable "s3_origin_mappings" {
  type = map(object({
    origin_id              = string
    domain_name            = string
    origin_access_identity = string
  }))
  default     = {}
  description = "S3 origin mappings. Can be used in conjunction with custom origin mappings Defaults to an empty map."
}

variable "default_cache_behavior" {
  type = object({
    origin_id       = string
    domain_name     = string
    static_backend  = bool
    allowed_methods = list(string)
  })
  description = "Default cache behaviour used by the distro, if a backend is static no query strings or cookies are forwarded."
}

variable "aliases" {
  type        = list(string)
  description = "Aliases used by the CloudFront distribution."
  default     = []
}

variable "default_root_object" {
  type        = string
  default     = "index.html"
  description = "Default root object for the CloudFront distribution, this defaults to 'index.html'."
}

variable "viewer_protocol_policy" {
  type        = string
  default     = "redirect-to-https"
  description = "Default viewer_protocol_policy for the CloudFront distribution, this defaults to 'redirect-to-https'."
}

variable "origin_protocol_policy" {
  type        = string
  default     = "https-only"
  description = "Default origin_protocol_policy for the CloudFront distribution, this defaults to 'https-only'."
}

variable "acm_cert_arn" {
  type        = string
  description = "AWS ACM certificate ARN to use for the CloudFront distribution."
}

variable "enable_access_logs" {
  type        = bool
  default     = false
  description = "Should accesses to the CloudFront distribution be logged, defaults to false."
}

variable "log_cookies" {
  type        = bool
  default     = false
  description = "If access logs are enabled, are cookies logged."
}
variable "access_logs_bucket" {
  type        = string
  default     = ""
  description = "If access logs are enabled the bucket the logs should go into, defaults to false."
}

variable "wait_for_deployment" {
  type        = bool
  default     = true
  description = "Specifies if Terrafrom should wait for deployments to complete before returning. Defaults to true."
}

variable "cached_methods" {
  type        = list(string)
  default     = ["GET", "HEAD"]
  description = "HTTP methods the CloudFront distribution will cache, defaults to GET and HEAD."
}

variable "min_ttl" {
  type        = number
  default     = 0
  description = "Minimum TTL of objects in the cache. Defaults to 0."
}

variable "default_ttl" {
  type        = number
  default     = 3600
  description = "Default TTL of objects in the cache. Set to 0 if you wish to disable caching. Defaults to 3600."
}

variable "max_ttl" {
  type        = number
  default     = 86400
  description = "Maximum TTL of objects in the cache. Set to 0 if you wish to disable caching. Defaults to 3600."
}

variable "geo_restriction_type" {
  type        = string
  default     = "none"
  description = "The method that you want to use to restrict distribution of your content by country: 'none', 'whitelist', or 'blacklist'. Defaults to none."
}

variable "geo_restriction_locations" {
  type        = list(string)
  default     = []
  description = "The ISO 3166-1-alpha-2 codes for which you want CloudFront either to allow or disallow content delivery."
}

//EDGE LAMBDA
variable "lambda_dist_dir" {
  type        = string
  description = "Directory of compiled JS files including any dependencies."
}

variable "lambda_code_dir" {
  type        = string
  description = "Directory of the source code for the Edge lambda."
}

variable "lambda_name" {
  type        = string
  description = "Name to be given to the Lambda, the stage name will be appended to the end."
}

variable "lambda_build_command" {
  type        = string
  default     = "npm install && npm run-script build"
  description = "Command used to build Lambda"
}

variable "lambda_cf_event_type" {
  type        = string
  description = "When to trigger the Lambda: 'viewer-request', 'origin-request', 'viewer-response', 'origin-response'."
}

// TAGGING
variable "namespace" {
  type        = string
  description = "The namespace of the distribution."
}

variable "stage" {
  type        = string
  description = "The stage of the distribution - (dev, staging etc)."
}

variable "name" {
  type        = string
  description = "The name of the distribution."
}

variable "tags" {
  type        = map(any)
  description = "Tags applied to the distribution, these should follow what is defined [here](https://github.com/Adaptavist/terraform-compliance/blob/master/features/tags.feature)."
}
