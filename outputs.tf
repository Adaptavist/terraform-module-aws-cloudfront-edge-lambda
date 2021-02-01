output "cf_id" {
  value       = aws_cloudfront_distribution.this.id
  description = "ID of AWS CloudFront distribution"
}

output "cf_arn" {
  value       = aws_cloudfront_distribution.this.arn
  description = "ARN of AWS CloudFront distribution"
}

output "cf_status" {
  value       = aws_cloudfront_distribution.this.status
  description = "Current status of the distribution"
}

output "cf_domain_name" {
  value       = aws_cloudfront_distribution.this.domain_name
  description = "Domain name corresponding to the distribution"
}

output "cf_etag" {
  value       = aws_cloudfront_distribution.this.etag
  description = "Current version of the distribution's information"
}

output "cf_hosted_zone_id" {
  value       = aws_cloudfront_distribution.this.hosted_zone_id
  description = "CloudFront Route 53 zone ID"
}

output "lambda_role_name" {
  value       = try(module.edge_lambda[0].lambda_role_name, "")
  description = "IAM role name given to Edge Lambda"
}
