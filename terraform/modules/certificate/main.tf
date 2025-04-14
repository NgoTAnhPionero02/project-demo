resource "aws_acm_certificate" "certificate_api" {
  domain_name       = "${var.api_sub_domain}.${var.domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "Certificate for ${var.api_sub_domain}.${var.domain_name}"
  }
}

resource "aws_route53_record" "cert_validation_api" {
  for_each = {
    for domain_validation_option in aws_acm_certificate.certificate_api.domain_validation_options : domain_validation_option.domain_name => {
      name   = domain_validation_option.resource_record_name
      type   = domain_validation_option.resource_record_type
      record = domain_validation_option.resource_record_value
    }
  }

  name    = each.value.name
  type    = each.value.type
  zone_id = var.route53_zone_id
  records = [each.value.record]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "cert_validation_api" {
  certificate_arn         = aws_acm_certificate.certificate_api.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation_api : record.fqdn]
}

resource "aws_acm_certificate" "certificate_app" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "Certificate for ${var.domain_name}"
  }
}

resource "aws_route53_record" "cert_validation_app" {
  for_each = {
    for domain_validation_option in aws_acm_certificate.certificate_app.domain_validation_options : domain_validation_option.domain_name => {
      name   = domain_validation_option.resource_record_name
      type   = domain_validation_option.resource_record_type
      record = domain_validation_option.resource_record_value
    }
  }

  name    = each.value.name
  type    = each.value.type
  zone_id = var.route53_zone_id
  records = [each.value.record]
  ttl     = 300
}

resource "aws_acm_certificate_validation" "cert_validation_app" {
  certificate_arn         = aws_acm_certificate.certificate_app.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation_app : record.fqdn]
}

