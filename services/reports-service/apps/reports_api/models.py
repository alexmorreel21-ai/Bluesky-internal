import uuid
from django.db import models


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    team_id = models.CharField(max_length=100)
    team_name = models.CharField(max_length=100)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-date', '-created_at']

    def __str__(self) -> str:
        return f'{self.team_name} report for {self.date}'


class ReportLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(Report, related_name='lines', on_delete=models.CASCADE)
    assignment_id = models.CharField(max_length=100)
    assignment_title = models.CharField(max_length=160)
    work_done = models.TextField()

    class Meta:
        db_table = 'report_lines'
        ordering = ['assignment_title']

    def __str__(self) -> str:
        return self.assignment_title
