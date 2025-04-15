locals {
  environment_variables = [
    {
      name  = "AWS_REGION"
      value = var.aws_region
    },
    {
      name  = "NODE_ENV"
      value = "production"
    },
    {
      name  = "S3_BUCKET_NAME"
      value = var.s3_bucket_name
    },
    {
      name  = "TABLE_NAME"
      value = var.table_name
    }
  ]
  secret_environments = []
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "${var.project}-execution-task-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
  tags = {
    Name = "${var.project}-iam-role"
  }
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_policy" "S3_bucket_policy" {
  name        = "s3_bucket_policy"
  description = "READ/WRITE to S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}/*",
          "arn:aws:s3:::${var.s3_bucket_name}",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3_bucket_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.S3_bucket_policy.arn
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "dynamodb_policy"
  description = "Allow access to DynamoDB"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = [
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
      ],
      Effect = "Allow",
      Resource = [
        "${var.aws_dynamodb_table_arn}/*",
        "${var.aws_dynamodb_table_arn}",
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

resource "aws_iam_policy" "ses_policy" {
  name        = "ses_policy"
  description = "Policy for sending emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ses:SendEmail"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_ses_policy" {
  policy_arn = aws_iam_policy.ses_policy.arn
  role       = aws_iam_role.ecsTaskExecutionRole.name
}

resource "aws_ecs_cluster" "ecs_cluster" {
  name = "${var.project}-cluster"
  tags = {
    Name = "${var.project}-ecs"
  }
}

resource "aws_cloudwatch_log_group" "log-group" {
  name              = "${var.project}-logs"
  retention_in_days = 60

  tags = {
    Application = var.project
  }
}

resource "aws_ecs_task_definition" "api" {
  container_definitions = jsonencode([
    {
      name        = "${var.project}-container"
      image       = var.ecr_url
      entryPoint  = []
      environment = local.environment_variables
      secrets     = local.secret_environments
      command     = []
      essential   = true
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.log-group.id
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "api"
        }
      }
      portMappings = [
        {
          containerPort = var.port_container
          hostPort      = var.port_container
          protocol      = "tcp"
        }
      ]
      cpu    = 256
      memory = 512
    }
  ])

  family                   = "${var.project}-task"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512

  tags = {
    Name = "${var.project}-ecs-td"
  }
}

resource "aws_ecs_service" "api" {
  name                               = "${var.project}-service"
  cluster                            = aws_ecs_cluster.ecs_cluster.id
  task_definition                    = aws_ecs_task_definition.api.arn
  desired_count                      = 1
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  launch_type                        = "FARGATE"
  scheduling_strategy                = "REPLICA"
  enable_execute_command             = true

  network_configuration {
    security_groups  = [var.security_group.web]
    subnets          = var.vpc.public_subnets
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.aws_alb_target_group_arn
    container_name   = "${var.project}-container"
    container_port   = var.port_container
  }
}
