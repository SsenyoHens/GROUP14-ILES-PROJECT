
#Registering Serializer
from rest_framework import serializers
from .models import CustomUser
from .models import Evaluation
from .models import StudentProfile


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
    email=serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

#Evaluation Serializer
class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'
    def validate_score(self, value):
        if value<0 or value>100:
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value
    
#Student Profile Serializer
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['registration_number', 'course', 'year_of_study', 'phone_number']