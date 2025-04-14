resource "aws_sns_topic" "monitoring" {
  name = "${var.project}-monitoring"
}

resource "aws_sns_topic_subscription" "sns-topic" {
  topic_arn = aws_sns_topic.monitoring.arn
  protocol  = "email"
  endpoint  = var.email_monitor
}

resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  for_each            = toset(var.ecs_services)
  alarm_name          = "ECS CPUUtilization ${each.value}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = each.value
  }

  alarm_description = "This metric ECS CPU watcher"
  alarm_actions     = [aws_sns_topic.monitoring.arn]
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory" {
  for_each            = toset(var.ecs_services)
  alarm_name          = "ECS MemoryUtilization ${each.value}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = each.value
  }

  alarm_description = "This metric ECS MEMORY watcher"
  alarm_actions     = [aws_sns_topic.monitoring.arn]
}
