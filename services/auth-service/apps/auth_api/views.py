from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuthAccount
from .serializers import AuthUserSerializer, DeprovisionAccountSerializer, LoginSerializer, ProvisionAccountSerializer


def get_session_account(request):
	account_id = request.session.get('auth_user_id')
	if not account_id:
		return None

	try:
		return AuthAccount.objects.get(id=account_id, is_active=True)
	except AuthAccount.DoesNotExist:
		return None


class LoginView(APIView):
	authentication_classes = []
	permission_classes = []

	def post(self, request):
		AuthAccount.ensure_default_admin()

		serializer = LoginSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(
				{'message': 'Invalid login payload.', 'errors': serializer.errors},
				status=status.HTTP_400_BAD_REQUEST,
			)

		email = serializer.validated_data['email'].strip().lower()
		password = serializer.validated_data['password']

		try:
			account = AuthAccount.objects.get(email__iexact=email, is_active=True)
		except AuthAccount.DoesNotExist:
			return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

		if not account.verify_password(password):
			return Response({'message': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

		request.session.cycle_key()
		request.session['auth_user_id'] = str(account.id)

		return Response(AuthUserSerializer(account).data, status=status.HTTP_200_OK)


class MeView(APIView):
	authentication_classes = []
	permission_classes = []

	def get(self, request):
		account = get_session_account(request)
		if not account:
			return Response({'message': 'Unauthorized.'}, status=status.HTTP_401_UNAUTHORIZED)

		return Response(AuthUserSerializer(account).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
	authentication_classes = []
	permission_classes = []

	def post(self, request):
		request.session.flush()
		return Response(status=status.HTTP_204_NO_CONTENT)


class ProvisionAccountView(APIView):
	authentication_classes = []
	permission_classes = []

	def post(self, request):
		serializer = ProvisionAccountSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(
				{'message': 'Invalid provision payload.', 'errors': serializer.errors},
				status=status.HTTP_400_BAD_REQUEST,
			)

		payload = serializer.validated_data
		account, _ = AuthAccount.objects.get_or_create(
			email=payload['email'].strip().lower(),
			defaults={
				'username': payload['username'],
				'permission': payload['permission'],
				'is_active': True,
			},
		)

		account.username = payload['username']
		account.permission = payload['permission']
		account.is_active = True
		account.set_password(payload['password'])
		account.save()

		return Response(AuthUserSerializer(account).data, status=status.HTTP_200_OK)


class DeprovisionAccountView(APIView):
	authentication_classes = []
	permission_classes = []

	def post(self, request):
		serializer = DeprovisionAccountSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(
				{'message': 'Invalid deprovision payload.', 'errors': serializer.errors},
				status=status.HTTP_400_BAD_REQUEST,
			)

		email = serializer.validated_data['email'].strip().lower()
		AuthAccount.objects.filter(email__iexact=email).delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

# Create your views here.
