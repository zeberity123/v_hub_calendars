from django.contrib import admin
from .models import Calendar, Subtask

# Register your models here.
class SubtaskInline(admin.TabularInline):
    model = Subtask
    extra = 1

class CalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "content", "start_day", "end_day", "start_time", "end_time", "tags", "color", "pinned")
    inlines = [SubtaskInline]

admin.site.register(Calendar, CalendarAdmin)
