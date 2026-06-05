from django.urls import path

from .views import UserDetailView, UsersCollectionView

urlpatterns = [
    path('', UsersCollectionView.as_view(), name='users-collection'),
    path('<uuid:user_id>', UserDetailView.as_view(), name='users-detail'),
]