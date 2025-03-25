from django.urls import path
from . import views

app_name = 'boards'

urlpatterns = [
    path('api/v1/calendar_delete/', views.calendar_delete, name='calendar_delete'),
    path('api/v1/calendar_create/', views.calendar_create, name='calendar_create'),
    path('api/v1/calendar_list/', views.calendar_list, name='calendar_list'),
    path('', views.index, name='index'),
]