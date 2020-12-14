/*
  Test Fixture
*/

terraform {
  backend "s3" {
    bucket         = "product-sandbox-terraform-state-management"
    dynamodb_table = "product-sandbox-terraform-state-management"
    region         = "us-east-1"
    encrypt        = "true"
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  default_allowed_methods = ["HEAD", "GET", "OPTIONS"]
  tld                     = "avst-sbx.adaptavist.com"
  domain                  = "${random_string.random.result}-cf-router-test.${local.tld}"
  namespace               = "tf-tests"
  stage                   = "test"
  name                    = "cf-router"
  tags = {
    "Avst:BusinessUnit" : "platform"
    "Avst:Team" : "cloud-infra"
    "Avst:CostCenter" : "foo"
    "Avst:Project" : "foo"
    "Avst:Stage:Type" : "sandbox"
    "Avst:Stage:Name" : "sandbox"
  }
}

data "aws_caller_identity" "current" {}

data "aws_acm_certificate" "cert" {
  domain   = "*.${local.tld}"
  statuses = ["ISSUED"]
}

data "aws_route53_zone" "zone" {
  name         = local.tld
  private_zone = false
}

resource "random_string" "random" {
  length  = 8
  special = false
  upper   = false
}

module cf_distro {
  source = "../../"

  aliases = [local.domain]

  namespace = local.namespace
  stage     = local.stage
  name      = local.name
  tags      = local.tags

  acm_cert_arn = data.aws_acm_certificate.cert.arn

  default_cache_behavior = {
    origin_id       = "google"
    domain_name     = "www.google.co.uk"
    allowed_methods = local.default_allowed_methods
  }

  origin_mappings = {

    google = {
      origin_id       = "google"
      domain_name     = "www.google.co.uk"
      path_pattern    = "/*"
      allowed_methods = local.default_allowed_methods
    }

  }

  lambda_dist_dir = "../../lambda/dist"
  lambda_code_dir = "../../lambda/"
  lambda_name     = "cloud-front-router-${random_string.random.result}"
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = module.cf_distro.cf_domain_name
    zone_id                = module.cf_distro.cf_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_iam_role_policy" "lambda_exec_role_policy" {
  policy = data.aws_iam_policy_document.lambda_exec_role_policy_document.json
  role   = module.cf_distro.lambda_role_name
}

data "aws_iam_policy_document" "lambda_exec_role_policy_document" {

  statement {
    effect = "Allow"

    actions = [
      "lambda:GetFunction",
      "lambda:EnableReplication*",
      "iam:CreateServiceLinkedRole",
      "cloudfront:UpdateDistribution",
      "cloudfront:CreateDistribution"
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "logs:*",
    ]

    resources = ["arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/*.${module.cf_distro.lambda_role_name}"]
  }

  statement {
    effect = "Allow"

    actions = [
      "ssm:*",
    ]

    resources = ["arn:aws:ssm:*:${data.aws_caller_identity.current.account_id}:parameter/sr/*"]
  }
}