from rest_framework import serializers
from .models import ManagedUser


class ManagedUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)

    class Meta:
        model = ManagedUser
        fields = ['id', 'username', 'email', 'password', 'permission', 'status']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'status': {'required': False},
        }


class CreateManagedUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=255, trim_whitespace=False)
    permission = serializers.ChoiceField(choices=ManagedUser.Permission.choices)

    def create(self, validated_data):
        return ManagedUser.objects.create(**validated_data)