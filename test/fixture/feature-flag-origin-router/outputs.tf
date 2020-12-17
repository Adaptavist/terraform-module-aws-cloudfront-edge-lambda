output "cf_id" {
  value = module.cf_distro.cf_id
}

output "cf_arn" {
  value = module.cf_distro.cf_arn
}

output "cf_status" {
  value = module.cf_distro.cf_status
}

output "cf_domain_name" {
  value = module.cf_distro.cf_domain_name
}

output "cf_etag" {
  value = module.cf_distro.cf_etag
}

output "cf_hosted_zone_id" {
  value = module.cf_distro.cf_hosted_zone_id
}

output "public_domain_name" {
  value = local.domain
}