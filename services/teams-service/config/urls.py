from django.contrib import admin
from django.urls import include, path
from apps.teams_api.views import TeamDetailView, TeamMembersView, TeamsCollectionView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/teams', TeamsCollectionView.as_view(), name='teams-collection'),
    path('api/teams/<uuid:team_id>', TeamDetailView.as_view(), name='teams-detail'),
    path('api/teams/<uuid:team_id>/members', TeamMembersView.as_view(), name='team-members'),
    path('health', include('apps.health.urls')),
]
