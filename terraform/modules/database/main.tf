resource "aws_dynamodb_table" "database" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "assignee"
    type = "S"
  }

  global_secondary_index {
    name            = "UserBoardIndex"
    hash_key        = "sk"
    range_key       = "pk"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "AssigneeIndex"
    hash_key        = "assignee"
    projection_type = "ALL"
  }

  tags = {
    Project = var.project
  }
}
