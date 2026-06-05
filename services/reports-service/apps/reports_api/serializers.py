from rest_framework import serializers

from .models import Report, ReportLine


class ReportLineSerializer(serializers.ModelSerializer):
    assignmentId = serializers.CharField(source='assignment_id')
    assignmentTitle = serializers.CharField(source='assignment_title')
    workDone = serializers.CharField(source='work_done')

    class Meta:
        model = ReportLine
        fields = ['assignmentId', 'assignmentTitle', 'workDone']


class ReportSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)
    teamId = serializers.CharField(source='team_id')
    teamName = serializers.CharField(source='team_name')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    lines = ReportLineSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'date', 'teamId', 'teamName', 'createdAt', 'lines', 'note']


class ReportLinePayloadSerializer(serializers.Serializer):
    assignmentId = serializers.CharField(max_length=100)
    assignmentTitle = serializers.CharField(max_length=160)
    workDone = serializers.CharField()


class CreateReportSerializer(serializers.Serializer):
    date = serializers.DateField()
    teamId = serializers.CharField(max_length=100)
    teamName = serializers.CharField(max_length=100)
    lines = ReportLinePayloadSerializer(many=True)
    note = serializers.CharField(required=False, allow_blank=True)
