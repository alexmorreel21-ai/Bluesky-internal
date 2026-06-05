from django.contrib import admin
from django.urls import include, path
from apps.assignments_api.views import AssignmentDetailView, AssignmentsCollectionView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/assignments', AssignmentsCollectionView.as_view(), name='assignments-collection'),
    path('api/assignments/<uuid:assignment_id>', AssignmentDetailView.as_view(), name='assignments-detail'),
    path('health', include('apps.health.urls')),
]
