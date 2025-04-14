resource "aws_s3_bucket" "private" {
  bucket = var.bucket_name

  tags = {
    Name = var.project
  }
}

resource "aws_s3_bucket_ownership_controls" "private" {
  bucket = aws_s3_bucket.private.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "private" {
  depends_on = [aws_s3_bucket_ownership_controls.private]

  bucket = aws_s3_bucket.private.id
  acl    = "private"
}

resource "aws_s3_bucket_cors_configuration" "private-cors-config" {
  bucket = aws_s3_bucket.private.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "HEAD", "GET"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
