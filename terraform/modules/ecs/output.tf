output "cluster_name" {
  value = aws_ecs_cluster.ecs_cluster.name
}

output "service_name" {
  value = {
    api = aws_ecs_service.api.name
  }
}

output "cloudwatch_log_group" {
  value = {
    name = aws_cloudwatch_log_group.log-group.name
    arn  = aws_cloudwatch_log_group.log-group.arn
  }
}
