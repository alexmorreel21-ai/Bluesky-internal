import json
import os
from urllib import error, request as urllib_request
from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Team, TeamMember
from .serializers import TeamMemberPayloadSerializer, TeamMemberSerializer, TeamPayloadSerializer, TeamSerializer


USERS_SERVICE_URL = os.getenv('USERS_SERVICE_URL', 'http://127.0.0.1:4002').rstrip('/')


def fetch_user(user_id) -> tuple[dict | None, Response | None]:
    url = f'{USERS_SERVICE_URL}/api/users'
    req = urllib_request.Request(url=url, method='GET')

    try:
        with urllib_request.urlopen(req, timeout=5) as response:
            users = json.loads(response.read().decode('utf-8'))
    except error.HTTPError as http_error:
        return None, Response({'message': 'Failed to load users.'}, status=http_error.code)
    except Exception:
        return None, Response({'message': 'Users service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)

    user_id_text = str(user_id)
    for user in users:
        if str(user.get('id')) == user_id_text:
            return user, None

    return None, Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


def validate_user_permission(user: dict, permission: str, message: str) -> Response | None:
    if user.get('permission') != permission:
        return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)
    return None


class TeamsCollectionView(APIView):
    def get(self, request):
        teams = Team.objects.prefetch_related('members').all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TeamPayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid team payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        leader, error_response = fetch_user(payload['leaderId'])
        if error_response:
            return error_response

        permission_error = validate_user_permission(leader, 'TeamLeader', 'Selected leader must have TeamLeader permission.')
        if permission_error:
            return permission_error

        try:
            team = Team.objects.create(
                name=payload['name'].strip(),
                leader_id=payload['leaderId'],
                leader_name=leader['username'],
                leader_email=leader['email'],
            )
        except IntegrityError:
            return Response({'message': 'Team name already exists.'}, status=status.HTTP_409_CONFLICT)

        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)


class TeamDetailView(APIView):
    def put(self, request, team_id: str):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({'message': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TeamPayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid team payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        leader, error_response = fetch_user(payload['leaderId'])
        if error_response:
            return error_response

        permission_error = validate_user_permission(leader, 'TeamLeader', 'Selected leader must have TeamLeader permission.')
        if permission_error:
            return permission_error

        team.name = payload['name'].strip()
        team.leader_id = payload['leaderId']
        team.leader_name = leader['username']
        team.leader_email = leader['email']

        try:
            team.save()
        except IntegrityError:
            return Response({'message': 'Team name already exists.'}, status=status.HTTP_409_CONFLICT)

        return Response(TeamSerializer(team).data, status=status.HTTP_200_OK)

    def delete(self, request, team_id: str):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({'message': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)

        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamMembersView(APIView):
    def post(self, request, team_id: str):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({'message': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TeamMemberPayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid team member payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        user, error_response = fetch_user(payload['userId'])
        if error_response:
            return error_response

        permission_error = validate_user_permission(user, 'TeamMember', 'Selected user must have TeamMember permission.')
        if permission_error:
            return permission_error

        try:
            member = TeamMember.objects.create(
                team=team,
                user_id=payload['userId'],
                username=user['username'],
                email=user['email'],
            )
        except IntegrityError:
            return Response({'message': 'User is already a member of this team.'}, status=status.HTTP_409_CONFLICT)

        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)
