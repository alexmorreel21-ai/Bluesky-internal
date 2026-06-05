import uuid
from django.db import models


class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    leader_id = models.UUIDField()
    leader_name = models.CharField(max_length=100)
    leader_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class TeamMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(Team, related_name='members', on_delete=models.CASCADE)
    user_id = models.UUIDField()
    username = models.CharField(max_length=100)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'team_members'
        ordering = ['username']
        constraints = [
            models.UniqueConstraint(fields=['team', 'user_id'], name='unique_team_member_user'),
        ]

    def __str__(self) -> str:
        return f'{self.username} -> {self.team.name}'
