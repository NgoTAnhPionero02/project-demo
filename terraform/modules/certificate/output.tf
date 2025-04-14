output "certificate_api_arn" {
  value = aws_acm_certificate.certificate_api.arn
}

output "certificate_app_id" {
  value = aws_acm_certificate.certificate_app.id
}
