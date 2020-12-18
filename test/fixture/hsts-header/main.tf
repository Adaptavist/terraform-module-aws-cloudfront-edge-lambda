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

module "cf_distro" {
  source = "../../../"

  aliases = [local.domain]

  namespace = local.namespace
  stage     = local.stage
  name      = local.name
  tags      = local.tags

  acm_cert_arn = data.aws_acm_certificate.cert.arn

  default_cache_behavior = {
    origin_id       = "scriptrunner"
    domain_name     = "sr-cloud-test.connect.adaptavist.com"
    allowed_methods = local.default_allowed_methods
    static_backend  = false
  }

  custom_origin_mappings = {
    scriptrunner = {
      origin_id       = "scriptrunner"
      domain_name     = "sr-cloud-test.connect.adaptavist.com"
      path_pattern    = "/latest/*"
      allowed_methods = local.default_allowed_methods
    }
  }

  lambda_dist_dir      = "../../../lambda/hsts-header/"
  lambda_code_dir      = "../../../lambda/hsts-header/"
  lambda_name          = "cloud-front-hsts-header-${random_string.random.result}"
  lambda_cf_event_type = "origin-response"

  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 0

  domain        = "*.${local.tld}"
  r53_zone_name = local.tld
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

}
