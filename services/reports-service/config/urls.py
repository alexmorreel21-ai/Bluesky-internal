from django.contrib import admin
from django.urls import include, path
from apps.reports_api.views import ReportsCollectionView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports', ReportsCollectionView.as_view(), name='reports-collection'),
    path('health', include('apps.health.urls')),
]
