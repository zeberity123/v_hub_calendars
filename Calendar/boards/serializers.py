from rest_framework import serializers
from .models import Calendar, Subtask

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ['id', 'text', 'completed']

class CalendarSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Calendar
        fields = ['id', 'title', 'content', 'tags', 'color', 'start_day', 'end_day', 'start_time', 'end_time', 'subtasks', 'pinned']