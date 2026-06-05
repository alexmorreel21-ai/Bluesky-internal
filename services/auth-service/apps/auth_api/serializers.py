from rest_framework import serializers

from .models import AuthAccount


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(max_length=255, trim_whitespace=False)


class AuthUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)

    class Meta:
        model = AuthAccount
        fields = ['id', 'username', 'email', 'permission']


class ProvisionAccountSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=255, trim_whitespace=False)
    permission = serializers.ChoiceField(choices=AuthAccount.Permission.choices)


class DeprovisionAccountSerializer(serializers.Serializer):
    email = serializers.EmailField()