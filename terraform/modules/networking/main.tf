module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project}-vpc"
  cidr = var.vpc_cidr
  azs  = var.azs

  private_subnets  = var.private_subnets
  public_subnets   = var.public_subnets

  enable_nat_gateway           = false
  single_nat_gateway           = false

  tags = {
    project     = var.project
  }
}

module "alb_sg" {
  source        = "terraform-in-action/sg/aws"
  vpc_id        = module.vpc.vpc_id
  name          = "${var.project}-alb-sg"
  ingress_rules = [
    {
      port        = 80
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      port        = 443
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "web_sg" {
  source        = "terraform-in-action/sg/aws"
  vpc_id        = module.vpc.vpc_id
  name          = "${var.project}-web-sg"
  ingress_rules = [
    {
      port            = var.ecs_port
      security_groups = [module.alb_sg.security_group.id]
    }
  ]
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = module.vpc.private_route_table_ids

  tags = {
    Name    = "${var.project}-s3-endpoint"
  }
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids

  tags = {
    Name    = "${var.project}-dynamodb-endpoint"
  }
}
