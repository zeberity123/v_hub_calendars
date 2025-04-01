from django.db import models
from django.contrib.auth.models import User

COLOR_CHOICES = (
    ('#4285F4', 'Blue'),
    ('#DB4437', 'Red'),
    ('#F4B400', 'Yellow'),
    ('#0F9D58', 'Green'),
    ('#AB47BC', 'Purple'),
    ('#00BCD4', 'Cyan'),
    ('#FF9800', 'Orange'),
    ('#E91E63', 'Pink'),
    ('#607D8B', 'Gray'),
)

class Calendar(models.Model):
    title = models.CharField(max_length=30)
    content = models.TextField(blank=True)  # no longer required from form; leave it empty or use for extra info
    tags = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=7, choices=COLOR_CHOICES, default='#4285F4')
    start_day = models.CharField(max_length=20)
    end_day = models.CharField(max_length=20)
    start_time = models.CharField(max_length=20)
    end_time = models.CharField(max_length=20)

    def __str__(self):
        return self.title

class Subtask(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name='subtasks')
    text = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.text