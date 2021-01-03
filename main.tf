module "labels" {
  source  = "cloudposse/label/terraform"
  version = "0.5.0"

  namespace = var.namespace
  stage     = var.stage
  name      = var.name
  tags      = var.tags
}

data "aws_route53_zone" "public_zone" {
  name         = var.r53_zone_name
  private_zone = false
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

    lambda_function_association {
      event_type = var.lambda_cf_event_type
      // The lambda version number has to be supplied and LATEST cannot be used
      lambda_arn = "${module.aws-lambda.lambda_arn}:${module.aws-lambda.lambda_version}"
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
  statement_id  = "AllowExecutionFromCloudFront"
  action        = "lambda:GetFunction"
  function_name = module.aws-lambda.lambda_name
  principal     = "edgelambda.amazonaws.com"

  depends_on = [module.aws-lambda]
}

resource "null_resource" "lambda_build" {
  provisioner "local-exec" {
    command = "cd ${var.lambda_code_dir} && ${var.lambda_build_command}"
  }

  triggers = {
    always_run = timestamp()
  }
}

module "aws-lambda" {
  source  = "Adaptavist/aws-lambda/module"
  version = "1.7.0"

  function_name   = "${var.lambda_name}-${var.stage}"
  description     = "An edge lambda which is attached to the CF distribution ${var.domain}"
  lambda_code_dir = var.lambda_dist_dir
  handler         = "app.handler"
  runtime         = "nodejs12.x"
  timeout         = "30"
  publish_lambda  = true

  namespace = var.namespace
  stage     = var.stage
  tags      = module.labels.tags

  depends_on = [null_resource.lambda_build]
}
