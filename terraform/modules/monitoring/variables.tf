variable "project" {
  type = string
}

variable "email_monitor" {
  type = string
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_services" {
  type = list(string)
}

