
#Registering Serializer
from rest_framework import serializers
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=5)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'role']

    def validate_role(self, value):
        roles = ['student', 'admin', 'academic_supervisor', 'workplace_supervisor']
        if value not in roles:
            raise serializers.ValidationError("Invalid role")
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            role=validated_data.get('role', 'student')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    

#Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)