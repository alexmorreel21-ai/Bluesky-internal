from django.contrib import admin
from django.urls import path
from apps.auth_api.views import DeprovisionAccountView, LoginView, LogoutView, MeView, ProvisionAccountView
from apps.health.views import HealthView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login', LoginView.as_view(), name='auth-login'),
    path('api/auth/login/', LoginView.as_view(), name='auth-login-slash'),
    path('api/auth/me', MeView.as_view(), name='auth-me'),
    path('api/auth/me/', MeView.as_view(), name='auth-me-slash'),
    path('api/auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout-slash'),
    path('api/auth/provision', ProvisionAccountView.as_view(), name='auth-provision'),
    path('api/auth/provision/', ProvisionAccountView.as_view(), name='auth-provision-slash'),
    path('api/auth/deprovision', DeprovisionAccountView.as_view(), name='auth-deprovision'),
    path('api/auth/deprovision/', DeprovisionAccountView.as_view(), name='auth-deprovision-slash'),
    path('health', HealthView.as_view(), name='health'),
    path('health/', HealthView.as_view(), name='health-slash'),
]
