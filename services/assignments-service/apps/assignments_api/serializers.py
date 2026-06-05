from rest_framework import serializers

from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)
    teamId = serializers.CharField(source='team_id')
    teamName = serializers.CharField(source='team_name')
    taskName = serializers.CharField(source='task_name')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id',
            'teamId',
            'teamName',
            'taskName',
            'content',
            'deadline',
            'objective',
            'progress',
            'status',
            'createdAt',
            'updatedAt',
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt']


class CreateAssignmentSerializer(serializers.Serializer):
    teamId = serializers.CharField(max_length=100)
    teamName = serializers.CharField(max_length=100)
    taskName = serializers.CharField(max_length=160)
    content = serializers.CharField()
    deadline = serializers.DateField()
    objective = serializers.IntegerField(min_value=1, max_value=100)


class UpdateAssignmentSerializer(serializers.Serializer):
    taskName = serializers.CharField(max_length=160, required=False)
    content = serializers.CharField(required=False)
    deadline = serializers.DateField(required=False)
    objective = serializers.IntegerField(min_value=1, max_value=100, required=False)
    progress = serializers.IntegerField(min_value=0, max_value=100, required=False)
    status = serializers.ChoiceField(choices=Assignment.Status.choices, required=False)
