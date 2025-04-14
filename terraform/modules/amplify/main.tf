resource "aws_amplify_domain_association" "domain" {
  app_id      = var.app_id
  domain_name = var.domain_name

  sub_domain {
    branch_name = var.branch_name
    prefix      = ""
  }

  depends_on = [var.certificate_app_id]
}
