from django.db import models

# Create your models here.
class Calendar(models.Model):
    title = models.CharField(max_length=30)
    content = models.TextField()
    start_day = models.CharField(max_length=20)
    end_day = models.CharField(max_length=20)
    start_time = models.CharField(max_length=20)
    end_time = models.CharField(max_length=20)