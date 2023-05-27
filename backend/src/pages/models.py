from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    calls_remaining = models.PositiveIntegerField(default=1)  

    def __str__(self):
        return self.user.username

class CountryQuery(models.Model):
    country1 = models.CharField(max_length=255)
    country2 = models.CharField(max_length=255)
    num_queries = models.IntegerField(default=0)
