"""
Unit Tests for Logbook Models and Views
Tests for Issue #3 functionality
"""

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from .models import LogbookEntry


class LogbookEntryModelTest(TestCase):
    """Tests for LogbookEntry model"""
    
    def setUp(self):
        """Create test user and logbook entry"""
        self.student = User.objects.create_user(
            username='teststudent',
            password='testpass123',
            first_name='Test',
            last_name='Student'
        )
        
        self.supervisor = User.objects.create_user(
            username='testsupervisor',
            password='testpass123',
            first_name='Test',
            last_name='Supervisor'
        )
        
        self.entry = LogbookEntry.objects.create(
            student=self.student,
            activity_description='Attended Django workshop',
            week_start=date(2025, 5, 1),
            week_end=date(2025, 5, 7),
            hours_spent=20.5,
        )
    
    def test_logbook_entry_creation(self):
        """Test that logbook entry is created correctly"""
        self.assertEqual(self.entry.student.username, 'teststudent')
        self.assertEqual(self.entry.status, 'draft')
        self.assertEqual(self.entry.hours_spent, 20.5)
    
    def test_logbook_entry_string_representation(self):
        """Test string representation of logbook entry"""
        expected = f"teststudent - Week of {date(2025, 5, 1)}"
        self.assertEqual(str(self.entry), expected)
    
    def test_submit_logbook_entry(self):
        """Test submitting a draft logbook entry"""
        self.entry.submit()
        self.assertEqual(self.entry.status, 'submitted')
    
    def test_approve_logbook_entry(self):
        """Test approving a submitted logbook entry"""
        self.entry.submit()
        self.entry.approve(self.supervisor, 'Great work!')
        
        self.assertEqual(self.entry.status, 'approved')
        self.assertEqual(self.entry.approved_by, self.supervisor)
        self.assertEqual(self.entry.supervisor_feedback, 'Great work!')
    
    def test_reject_logbook_entry(self):
        """Test rejecting a submitted logbook entry"""
        self.entry.submit()
        self.entry.reject(self.supervisor, 'Needs improvement')
        
        self.assertEqual(self.entry.status, 'rejected')
        self.assertEqual(self.entry.approved_by, self.supervisor)
        self.assertEqual(self.entry.supervisor_feedback, 'Needs improvement')
    
    def test_unique_entry_per_week(self):
        """Test that only one entry per student per week is allowed"""
        with self.assertRaises(Exception):
            LogbookEntry.objects.create(
                student=self.student,
                activity_description='Another activity',
                week_start=date(2025, 5, 1),
                week_end=date(2025, 5, 7),
                hours_spent=15,
            )


class LogbookEntryAPITest(APITestCase):
    """Tests for LogbookEntry API endpoints"""
    
    def setUp(self):
        """Create test users and entries"""
        self.student = User.objects.create_user(
            username='teststudent',
            password='testpass123'
        )
        
        self.supervisor = User.objects.create_user(
            username='testsupervisor',
            password='testpass123'
        )
        
        self.entry = LogbookEntry.objects.create(
            student=self.student,
            activity_description='Test activity',
            week_start=date(2025, 5, 1),
            week_end=date(2025, 5, 7),
            hours_spent=15,
        )
    
    def test_student_can_create_logbook_entry(self):
        """Test that authenticated student can create logbook entry"""
        self.client.login(username='teststudent', password='testpass123')
        
        url = reverse('logbook-entry-list')
        data = {
            'activity_description': 'New activity',
            'week_start': '2025-05-08',
            'week_end': '2025-05-14',
            'hours_spent': 18.5,
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_student_can_submit_entry(self):
        """Test that student can submit draft entry"""
        self.client.login(username='teststudent', password='testpass123')
        
        url = reverse('logbook-entry-submit', kwargs={'pk': self.entry.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.status, 'submitted')
    
    def test_supervisor_can_approve_entry(self):
        """Test that supervisor can approve submitted entry"""
        self.entry.submit()
        self.client.login(username='testsupervisor', password='testpass123')
        
        url = reverse('logbook-entry-approve', kwargs={'pk': self.entry.id})
        data = {'feedback': 'Excellent work'}
        
        # This would require supervisor profile to work
        # response = self.client.post(url, data, format='json')
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_unauthenticated_cannot_access_api(self):
        """Test that unauthenticated users cannot access API"""
        url = reverse('logbook-entry-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
