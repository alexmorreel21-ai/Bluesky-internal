import uuid
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Assignment(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'In progress'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team_id = models.CharField(max_length=100)
    team_name = models.CharField(max_length=100)
    task_name = models.CharField(max_length=160)
    content = models.TextField()
    deadline = models.DateField()
    objective = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    progress = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['deadline', 'team_name', 'task_name']

    def save(self, *args, **kwargs):
        if self.progress >= 100:
            self.progress = 100
            self.status = self.Status.COMPLETED
        elif self.status == self.Status.COMPLETED:
            self.progress = 100
        else:
            self.status = self.Status.IN_PROGRESS

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.task_name} ({self.team_name})'
