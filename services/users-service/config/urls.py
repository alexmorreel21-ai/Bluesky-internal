from django.contrib import admin
from django.urls import include, path
from apps.users_api.views import UserDetailView, UsersCollectionView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users', UsersCollectionView.as_view(), name='users-collection'),
    path('api/users/<uuid:user_id>', UserDetailView.as_view(), name='users-detail'),
    path('health', include('apps.health.urls')),
]
