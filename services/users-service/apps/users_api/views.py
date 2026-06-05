import json
import os
from urllib import error, request as urllib_request
from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ManagedUser
from .serializers import CreateManagedUserSerializer, ManagedUserSerializer


AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://127.0.0.1:4001').rstrip('/')


def sync_auth_account(payload: dict) -> tuple[bool, str | None, int | None]:
	url = f'{AUTH_SERVICE_URL}/api/auth/provision'
	body = json.dumps(payload).encode('utf-8')
	req = urllib_request.Request(url=url, data=body, method='POST')
	req.add_header('Content-Type', 'application/json')

	try:
		with urllib_request.urlopen(req, timeout=5):
			return True, None, None
	except error.HTTPError as http_error:
		message = 'Failed to provision auth account.'
		try:
			err_payload = json.loads(http_error.read().decode('utf-8'))
			if isinstance(err_payload, dict) and err_payload.get('message'):
				message = str(err_payload['message'])
		except Exception:
			pass
		return False, message, http_error.code
	except Exception:
		return False, 'Auth service unavailable.', 502


def deprovision_auth_account(email: str) -> tuple[bool, str | None, int | None]:
	url = f'{AUTH_SERVICE_URL}/api/auth/deprovision'
	body = json.dumps({'email': email}).encode('utf-8')
	req = urllib_request.Request(url=url, data=body, method='POST')
	req.add_header('Content-Type', 'application/json')

	try:
		with urllib_request.urlopen(req, timeout=5):
			return True, None, None
	except error.HTTPError as http_error:
		message = 'Failed to deprovision auth account.'
		try:
			err_payload = json.loads(http_error.read().decode('utf-8'))
			if isinstance(err_payload, dict) and err_payload.get('message'):
				message = str(err_payload['message'])
		except Exception:
			pass
		return False, message, http_error.code
	except Exception:
		return False, 'Auth service unavailable.', 502


class UsersCollectionView(APIView):
	def get(self, request):
		users = ManagedUser.objects.all()
		serializer = ManagedUserSerializer(users, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def post(self, request):
		serializer = CreateManagedUserSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(
				{'message': 'Invalid user payload.', 'errors': serializer.errors},
				status=status.HTTP_400_BAD_REQUEST,
			)

		payload = serializer.validated_data
		synced, sync_message, sync_code = sync_auth_account(payload)
		if not synced:
			return Response({'message': sync_message}, status=sync_code or status.HTTP_502_BAD_GATEWAY)

		try:
			user = serializer.save()
		except IntegrityError:
			deprovision_auth_account(payload['email'])
			return Response({'message': 'Username or email already exists.'}, status=status.HTTP_409_CONFLICT)

		response_serializer = ManagedUserSerializer(user)
		return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
	def delete(self, request, user_id: str):
		try:
			user = ManagedUser.objects.get(id=user_id)
		except ManagedUser.DoesNotExist:
			return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

		synced, sync_message, sync_code = deprovision_auth_account(user.email)
		if not synced:
			return Response({'message': sync_message}, status=sync_code or status.HTTP_502_BAD_GATEWAY)

		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

# Create your views here.
