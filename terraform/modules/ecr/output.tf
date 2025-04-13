output "ecr_repository_arn" {
  value = aws_ecr_repository.repository.repository_url
}
