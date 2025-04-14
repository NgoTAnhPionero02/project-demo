resource "aws_alb" "application_load_balancer" {
  name               = "${var.project}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.vpc.public_subnets
  security_groups    = [var.sg.lb]

  tags = {
    Name = "${var.project}-alb"
  }
}

resource "aws_lb_target_group" "target_group" {
  name        = "${var.project}-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc.vpc_id

  health_check {
    healthy_threshold   = "3"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "10"
    path                = "/health"
    unhealthy_threshold = "2"
  }

  tags = {
    Name = "${var.project}-lb-tg"
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.id
  port              = "80"
  protocol          = "HTTP"

  # default_action {
  #   type = "redirect"
  #   redirect {
  #     port        = "443"
  #     protocol    = "HTTPS"
  #     status_code = "HTTP_301"
  #   }
  # }

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.id
  }
}

# resource "aws_lb_listener" "https-listener" {
#   load_balancer_arn = aws_alb.application_load_balancer.id
#   port              = "443"
#   protocol          = "HTTPS"
#   certificate_arn   = var.certificate_arn

#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.target_group.id
#   }
# }

# resource "aws_route53_record" "api" {
#   zone_id = var.route53_zone_id
#   name    = "${var.api_sub_domain}.${var.domain_name}"
#   type    = "A"

#   alias {
#     name                   = aws_alb.application_load_balancer.dns_name
#     zone_id                = aws_alb.application_load_balancer.zone_id
#     evaluate_target_health = true
#   }
# }
