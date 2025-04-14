provider "aws" {
  region = "ap-southeast-1"
}

terraform {
  backend "s3" {
    bucket = "hoat-bucket-infra"
    key    = "terraform/state"
    region = "ap-southeast-1"
  }
}

locals {
  private_subnets = ["10.1.21.0/24", "10.1.22.0/24"]
  public_subnets  = ["10.1.4.0/24", "10.1.5.0/24"]
  vpc_cidr        = "10.1.0.0/16"
  zone            = ["ap-southeast-1a", "ap-southeast-1c"]
  project         = "project-demo"
  region          = "ap-southeast-1"
  domain_name     = "haptienhoat.click"
  api_sub_domain  = "api"

  #dynamodb
  table_name = "demo-table"

  #ecr
  repository_name = "project-demo"

  #ecs
  container_port = 3000

  #s3
  bucket_name = "hoat-bucket-project-demo"

  #monitoring
  email_monitor = "hoathaptest1@gmail.com"

  #github
  branch_name = "main"

  #amplify
  amplify_app_id = "dyv34pi6pfpah"
}

module "database" {
  source = "./modules/database"

  table_name = local.table_name
  project    = "my-project"
  hash_key   = "id"
}

# module "route53" {
#   source = "./modules/route53"

#   domain_name = local.domain_name
# }

module "ecr" {
  source = "./modules/ecr"

  repository_name = local.repository_name
}

# module "certificate" {
#   source = "./modules/certificate"

#   domain_name     = local.domain_name
#   route53_zone_id = module.route53.route53_zone_id
#   api_sub_domain  = local.api_sub_domain
# }

# module "ses" {
#   source = "./modules/ses"

#   domain_name     = local.domain_name
#   route53_zone_id = module.route53.route53_zone_id
#   email_monitor   = local.email_monitor
# }

module "networking" {
  source = "./modules/networking"

  project         = local.project
  vpc_cidr        = local.vpc_cidr
  private_subnets = local.private_subnets
  public_subnets  = local.public_subnets
  azs             = local.zone
  ecs_port        = local.container_port
  region          = local.region
}

module "s3" {
  source      = "./modules/s3"
  project     = local.project
  bucket_name = local.bucket_name
}

module "alb" {
  source = "./modules/alb"

  project         = local.project
  sg              = module.networking.sg
  vpc             = module.networking.vpc
  # certificate_arn = module.certificate.certificate_api_arn
  # route53_zone_id = module.route53.route53_zone_id
  # domain_name     = local.domain_name
  # api_sub_domain  = local.api_sub_domain
}

module "ecs" {
  source = "./modules/ecs"

  project                  = local.project
  aws_region               = local.region
  aws_alb_target_group_arn = module.alb.target_group_arn

  ecr_url                = "${module.ecr.ecr_repository_arn}:latest"
  port_container         = local.container_port
  s3_bucket_name         = local.bucket_name
  security_group         = module.networking.sg
  vpc                    = module.networking.vpc
  aws_dynamodb_table_arn = module.database.dynamodb_table_arn
}

module "autoscaling" {
  source = "./modules/autoscaling"

  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_name = module.ecs.service_name.api
}

module "monitoring" {
  source = "./modules/monitoring"

  project       = local.project
  email_monitor = local.email_monitor

  ecs_cluster_name = module.ecs.cluster_name
  ecs_services = [
    module.ecs.service_name.api,
  ]
}

# module "amplify" {
#   source             = "./modules/amplify"
#   app_id             = local.amplify_app_id
#   domain_name        = local.domain_name
#   branch_name        = local.branch_name
#   certificate_app_id = module.certificate.certificate_app_id
#   route53_zone_id    = module.route53.route53_zone_id
# }
