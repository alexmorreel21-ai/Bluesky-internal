import uuid
from django.db import models


class ManagedUser(models.Model):
	class Permission(models.TextChoices):
		MANAGER = 'Manager', 'Manager'
		TEAM_LEADER = 'TeamLeader', 'TeamLeader'
		TEAM_MEMBER = 'TeamMember', 'TeamMember'

	class Status(models.TextChoices):
		ACTIVE = 'ACTIVE', 'ACTIVE'
		INVITED = 'INVITED', 'INVITED'

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	username = models.CharField(max_length=100, unique=True)
	email = models.EmailField(unique=True)
	password = models.CharField(max_length=255)
	permission = models.CharField(max_length=20, choices=Permission.choices)
	status = models.CharField(max_length=10, choices=Status.choices, default=Status.INVITED)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'managed_users'
		ordering = ['username']

	def __str__(self) -> str:
		return f'{self.username} <{self.email}>'

# Create your models here.
