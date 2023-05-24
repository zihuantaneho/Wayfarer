from django.db import models

class CountryQuery(models.Model):
    country1 = models.CharField(max_length=255)
    country2 = models.CharField(max_length=255)
    num_queries = models.IntegerField(default=0)
