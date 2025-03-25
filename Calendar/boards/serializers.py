from rest_framework import serializers
from .models import Calendar

class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['id', 'title', 'content', 'start_day', 'end_day', 'start_time', 'end_time',]