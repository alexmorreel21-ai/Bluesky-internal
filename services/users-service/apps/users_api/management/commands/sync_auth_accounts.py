from django.core.management.base import BaseCommand

from apps.users_api.models import ManagedUser
from apps.users_api.views import sync_auth_account


class Command(BaseCommand):
    help = 'Sync all users-service records into auth-service login accounts.'

    def handle(self, *args, **options):
        ok_count = 0
        fail_count = 0

        for user in ManagedUser.objects.all():
            success, message, code = sync_auth_account(
                {
                    'username': user.username,
                    'email': user.email,
                    'password': user.password,
                    'permission': user.permission,
                }
            )

            if success:
                ok_count += 1
            else:
                fail_count += 1
                self.stderr.write(
                    self.style.ERROR(
                        f'Failed to sync {user.email}: status={code} message={message}'
                    )
                )

        self.stdout.write(self.style.SUCCESS(f'Sync completed. success={ok_count} failed={fail_count}'))
