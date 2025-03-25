from django.contrib import admin
from .models import Calendar

# Register your models here.
class CalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "content", "start_day", "end_day", "start_time", "end_time",)

admin.site.register(Calendar, CalendarAdmin)
