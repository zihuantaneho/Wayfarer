from django.urls import path
from .views import compare_countries, signup, signin, top_queried_countries, get_calls_remaining, stripe_checkout, stripe_webhook

urlpatterns = [
    path("compare/<str:currency>/<str:country1>/<str:country2>", compare_countries, name="compare"),
    path("signup", signup, name="signup"),
    path("signin", signin, name="signin"),
    path("top-5-countries", top_queried_countries, name="top-5-countries"),
    path("calls-remaining", get_calls_remaining, name="calls-remaning"),
    path("checkout/<int:qty>", stripe_checkout, name="checkout"),
    path("stripe/callback", stripe_webhook, name="stripe/callback"),
]
