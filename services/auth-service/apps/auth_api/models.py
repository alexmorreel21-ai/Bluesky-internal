from django.db import models
import uuid
from django.contrib.auth.hashers import check_password, make_password


class AuthAccount(models.Model):
	class Permission(models.TextChoices):
		MANAGER = 'Manager', 'Manager'
		TEAM_LEADER = 'TeamLeader', 'TeamLeader'
		TEAM_MEMBER = 'TeamMember', 'TeamMember'

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	username = models.CharField(max_length=100, unique=True)
	email = models.EmailField(unique=True)
	password_hash = models.CharField(max_length=255)
	permission = models.CharField(max_length=20, choices=Permission.choices)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'auth_accounts'

	def set_password(self, raw_password: str) -> None:
		self.password_hash = make_password(raw_password)

	def verify_password(self, raw_password: str) -> bool:
		return check_password(raw_password, self.password_hash)

	@classmethod
	def ensure_default_admin(cls) -> None:
		account, created = cls.objects.get_or_create(
			email='admin@bluesky.com',
			defaults={
				'username': 'admin',
				'permission': cls.Permission.MANAGER,
				'is_active': True,
			},
		)

		if created or not account.password_hash:
			account.set_password('1234567890')
			account.save(update_fields=['password_hash', 'updated_at'])

	def __str__(self) -> str:
		return f'{self.username} <{self.email}>'

# Create your models here.
