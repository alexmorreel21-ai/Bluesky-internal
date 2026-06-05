from django.urls import include, path
from apps.dashboard_api.views import DashboardSummaryView


urlpatterns = [
    path('api/dashboard', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('health', include('apps.health.urls')),
]
