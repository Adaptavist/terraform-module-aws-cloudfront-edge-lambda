module "labels" {
  source  = "cloudposse/label/terraform"
  version = "0.5.0"

  namespace = var.namespace
  stage     = var.stage
  name      = var.name
  tags      = var.tags
}

resource "aws_cloudfront_distribution" "this" {

  dynamic origin {
    for_each = var.origin_mappings
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

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloudfront distribution for ${module.labels.id}"
  default_root_object = var.default_root_object

  aliases = var.aliases

  default_cache_behavior {
    allowed_methods  = var.default_cache_behavior.allowed_methods
    target_origin_id = var.default_cache_behavior.origin_id

    viewer_protocol_policy = var.viewer_protocol_policy

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    lambda_function_association {
      event_type = "origin-request"
      // The lambda version number has to be supplied and LATEST cannot be used
      lambda_arn = "${module.aws-lambda.lambda_arn}:${module.aws-lambda.lambda_version}"
    }

    // We are using cloudfront for routing only, we dont want to cache anything. 
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
    // we have to specifiy some methods even tho cache is disabled
    cached_methods = ["HEAD", "GET"]

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
    command = "cd ${var.lambda_code_dir} && npm install && npm run-script build"
  }
}

module "aws-lambda" {
  source  = "Adaptavist/aws-lambda/module"
  version = "1.7.0"

  function_name   = "${var.lambda_name}-${var.stage}"
  description     = "A lambda which routes requests based on custom logic"
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