from django.urls import path
from .views import compare_countries, signup, signin, top_queried_countries
urlpatterns = [
    path("compare/<str:country1>/<str:country2>", compare_countries, name="compare"),
    path("signup", signup, name="signup"),
    path("signin", signin, name="signin"),
    path("top-5-countries", top_queried_countries, name="top-5-countries")
]
