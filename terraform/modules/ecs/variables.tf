variable "project" {
  type = string
}

variable "port_container" {
  type = number
}

variable "aws_region" {
  type = string
}

variable "ecr_url" {
  type = string
}

variable "vpc" {
  type = any
}

variable "security_group" {
  type = any
}

variable "s3_bucket_name" {
  type = string
}

variable "aws_alb_target_group_arn" {
  type = string
}

variable "fe_domain" {
  type = string
}

variable "aws_dynamodb_table_arn" {
  type = string
}
