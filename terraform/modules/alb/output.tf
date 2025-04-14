output "target_group_arn" {
  value = aws_lb_target_group.target_group.arn
}

output "alb_dns_name" {
  value = aws_alb.application_load_balancer.dns_name
}

output "alb_id" {
  value = aws_alb.application_load_balancer.id
}

output "alb_arn" {
  value = aws_alb.application_load_balancer.arn
}

output "target_group_arn_suffix" {
  value = aws_lb_target_group.target_group.arn_suffix
}

output "alb_arn_suffix" {
  value = aws_alb.application_load_balancer.arn_suffix
}
