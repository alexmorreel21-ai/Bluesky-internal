from rest_framework import serializers

from .models import Team, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)
    userId = serializers.UUIDField(source='user_id', format='hex_verbose', read_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'userId', 'username', 'email']


class TeamSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)
    leaderId = serializers.UUIDField(source='leader_id', format='hex_verbose', read_only=True)
    leaderName = serializers.CharField(source='leader_name', read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'leaderId', 'leaderName', 'members']


class TeamPayloadSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    leaderId = serializers.UUIDField()


class TeamMemberPayloadSerializer(serializers.Serializer):
    userId = serializers.UUIDField()
