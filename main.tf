provider "aws" {
  region = "us-east-1"
}

data "aws_route53_zone" "public_zone" {
  name         = var.r53_zone_name
  private_zone = false
}

module "labels" {
  source  = "cloudposse/label/terraform"
  version = "0.5.0"

  namespace = var.namespace
  stage     = var.stage
  name      = var.name
  tags      = var.tags
}

resource "random_string" "random" {
  length  = 6
  special = false
  upper   = false
}

resource "aws_route53_record" "this" {
  zone_id = data.aws_route53_zone.public_zone.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_cloudfront_distribution" "this" {

  dynamic "origin" {
    for_each = var.custom_origin_mappings
    content {
      domain_name = origin.value.domain_name
      origin_id   = origin.value.origin_id

      custom_origin_config {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["SSLv3", "TLSv1.2"]
      }
    }
  }

  dynamic "logging_config" {
    for_each = var.enable_access_logs ? [1] : []
    content {
      include_cookies = var.log_cookies
      bucket          = var.access_logs_bucket
      prefix          = var.domain
    }
  }

  dynamic "origin" {
    for_each = var.s3_origin_mappings
    content {
      domain_name = origin.value.domain_name
      origin_id   = origin.value.origin_id

      s3_origin_config {
        origin_access_identity = origin.value.origin_access_identity
      }
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloudfront distribution for ${module.labels.id}"
  default_root_object = var.default_root_object
  wait_for_deployment = var.wait_for_deployment

  aliases = var.aliases

  default_cache_behavior {
    allowed_methods  = var.default_cache_behavior.allowed_methods
    target_origin_id = var.default_cache_behavior.origin_id

    viewer_protocol_policy = var.viewer_protocol_policy

    dynamic "forwarded_values" {
      for_each = var.default_cache_behavior.static_backend ? [1] : []
      content {
        query_string = false
        cookies {
          forward = "none"
        }
      }
    }

    dynamic "forwarded_values" {
      for_each = var.default_cache_behavior.static_backend ? [] : [1]
      content {
        query_string = true
        headers      = ["*"]
        cookies {
          forward = "all"
        }
      }
    }

    dynamic "lambda_function_association" {
      for_each = var.enable_custom_lambda ? [1] : []
      content {
        event_type = var.lambda_cf_event_type
        // The lambda version number has to be supplied and LATEST cannot be used
        lambda_arn   = "${module.edge_lambda[0].lambda_arn}:${module.edge_lambda[0].lambda_version}"
        include_body = var.lambda_cf_include_body
      }
    }

    lambda_function_association {
      event_type = "viewer-response"
      // The lambda version number has to be supplied and LATEST cannot be used
      lambda_arn   = "${module.hsts_header_edge_lambda.lambda_arn}:${module.hsts_header_edge_lambda.lambda_version}"
      include_body = false
    }

    min_ttl     = var.min_ttl
    default_ttl = var.default_ttl
    max_ttl     = var.max_ttl

    cached_methods = var.cached_methods
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  price_class = "PriceClass_All"

  tags = module.labels.tags

  viewer_certificate {
    acm_certificate_arn      = var.acm_cert_arn
    minimum_protocol_version = "TLSv1.2_2018"
    ssl_support_method       = "sni-only"
  }

  depends_on = [aws_lambda_permission.allow_cloudfront]
}

resource "aws_lambda_permission" "allow_cloudfront" {
  count         = var.enable_custom_lambda ? 1 : 0
  statement_id  = "AllowExecutionFromCloudFront"
  action        = "lambda:GetFunction"
  function_name = module.edge_lambda[0].lambda_name
  principal     = "edgelambda.amazonaws.com"

  depends_on = [module.edge_lambda]
}

module "edge_lambda" {
  count   = var.enable_custom_lambda ? 1 : 0
  source  = "Adaptavist/aws-lambda/module"
  version = "1.8.1"

  function_name   = "${var.lambda_name_prefix}-${random_string.random.result}"
  description     = "An edge lambda which is attached to the CF distribution ${var.domain}"
  lambda_code_dir = var.lambda_dist_dir
  handler         = var.lambda_handler
  runtime         = var.lambda_runtimme
  timeout         = var.hsts_lambda_timeout
  memory_size     = var.lambda_memory_size

  publish_lambda = true

  namespace = var.namespace
  stage     = var.stage
  tags      = module.labels.tags
}

resource "aws_lambda_permission" "hsts_header_lambda_permission" {
  statement_id  = "AllowExecutionFromCloudFront"
  action        = "lambda:GetFunction"
  function_name = module.hsts_header_edge_lambda.lambda_name
  principal     = "edgelambda.amazonaws.com"

  depends_on = [module.hsts_header_edge_lambda]
}

module "hsts_header_edge_lambda" {
  source  = "Adaptavist/aws-lambda/module"
  version = "1.8.1"

  function_name   = "hsts-header-${random_string.random.result}"
  description     = "An edge lambda which ensure the HSTS header is present for the domain ${var.domain}"
  lambda_code_dir = "${path.module}/lambda/hsts-header/"
  handler         = "app.handler"
  runtime         = "nodejs12.x"
  timeout         = "3"
  publish_lambda  = true

  namespace = var.namespace
  stage     = var.stage
  tags      = module.labels.tags

}
