from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import CalendarSerializer
from .models import Calendar

# Create your views here.

def index(request):
    return render(request, 'index.html')

@api_view(['GET'])
def calendar_list(request):
    calendar = Calendar.objects.all()
    serializer = CalendarSerializer(calendar, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def calendar_create(request):
    title = request.data['title']
    content = request.data['content']

    start_day = __convert_day_format(request.data['start_day'])
    end_day = __convert_day_format(request.data['end_day'])
    start_time = __convert_time_display(request.data['start_time'])
    end_time = __convert_time_display(request.data['end_time'])
    
    calendars = Calendar(title=title, content=content, start_day=start_day, end_day=end_day, start_time=start_time, end_time=end_time)

    calendars.save()

    return Response(status=status.HTTP_200_OK)

@api_view(['DELETE'])
def calendar_delete(request):
    board_id = request.data['id']
    board = Calendar.objects.get(pk=board_id)
    board.delete()
    return Response(status=status.HTTP_200_OK)

def __convert_day_format(day):
    return day.replace("/", "-")

def __convert_time_display(time):
    return '하루종일' if not time else time