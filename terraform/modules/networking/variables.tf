variable "project" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "ecs_port" {
  type = number
}

variable "private_subnets" {
  type = list(string)
}

variable "public_subnets" {
  type = list(string)
}

variable "azs" {
  type = list(string)
}

variable "region" {
  type = string
}
