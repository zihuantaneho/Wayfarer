from django.urls import path
from .views import compare_countries, signup, signin, top_queried_countries, get_calls_remaining, stripe_checkout, stripe_webhook, delete_user, estimate_income, get_api_payments

urlpatterns = [
    path("compare/<str:currency>/<str:country1>/<str:country2>", compare_countries, name="compare"),
    path("estimate/<int:income>/<str:currency>/<str:country1>/<str:country2>", estimate_income, name="income"),
    path("signup", signup, name="signup"),
    path("signin", signin, name="signin"),
    path("delete_user", delete_user, name="delete_user"),
    path("api_payments", get_api_payments, name="get_api_payments"),
    path("top-5-countries", top_queried_countries, name="top-5-countries"),
    path("calls-remaining", get_calls_remaining, name="calls-remaning"),
    path("checkout/<int:qty>", stripe_checkout, name="checkout"),
    path("stripe/callback", stripe_webhook, name="stripe/callback"),
]
