#!/usr/bin/python3
# encoding: utf-8
import requests
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.db import models
from pages.models import CountryQuery, UserProfile
from django.shortcuts import redirect

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
import os
import json
import stripe
import logging

#TODO: env
#stripe.api_key = "sk_test_51HFGmbL6ej6rkcOPZAgfDDeKg4At624zhc0PWSaZoUlDFk7lEGDqmWdI8oekiq4AmX78HzkEYS3GH9DmdmB6NV4e00dRev9Thx"
#endpoint_secret = "whsec_812d5fcb03d92761efe432f9300385ead5ffc68c1afb4e60e22047f46f354395"

stripe.api_key = os.environ["STRIPE_API_KEY"]
endpoint_secret = os.environ["STRIPE_WEBHOOK_SECRET"]

#"whsec_R4hsnsQ3Dfwnu5H6sLYjMw5QBLcLU5hc"

logging.basicConfig()
logger = logging.getLogger('backend_views')
logger.setLevel(logging.DEBUG)


@require_GET
def top_queried_countries(request):
    top_countries = CountryQuery.objects.order_by('-num_queries')[:5]
    country_data = [
        {'country1': country.country1, 'country2': country.country2, 'num_queries': country.num_queries}
        for country in top_countries
    ]

    return JsonResponse(country_data, safe=False)

@csrf_exempt
@require_POST
def signup(request):
    logger.info(f"Request: {request}")

    body = json.loads(request.body.decode())
    username = body["username"]
    password = body["password"]

    if not username or not password:
        return JsonResponse({'error': 'Both username and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)
    profile = UserProfile.objects.create(user=user,calls_remaining=5)

    return JsonResponse({'token': token.key}, status=201)

@csrf_exempt
@require_POST
def signin(request):
    body = json.loads(request.body.decode())
    username = body["username"]
    password = body["password"]

    if not username or not password:
        return JsonResponse({'error': 'Both username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)

    if not user:
        return JsonResponse({'error': 'Invalid username or password.'}, status=401)

    token, created = Token.objects.get_or_create(user=user)

    return JsonResponse({'token': token.key}, status=200)

def verify_token(request):
    auth_header = request.headers.get('Authorization')

    if auth_header and auth_header.startswith('Bearer '):
        token_key = auth_header.split('Bearer ')[1].strip()
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            raise Exception('Invalid token.')
    else:
        raise Exception('Token not provided.')


@require_GET
def compare_countries(request, currency, country1, country2):
    user = None

    try:
        user = verify_token(request)
        # Rest of your code...
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

    profile = UserProfile.objects.get(user=user)
    if profile.calls_remaining == 0:
        return JsonResponse({'error': "No API calls left"})

    # Формируем URL для запроса данных первой страны
    url1 = f"http://api:3000/{country1}?currency={currency}"
    # Формируем URL для запроса данных второй страны
    url2 = f"http://api:3000/{country2}?currency={currency}"

    try:
        # Выполняем GET-запросы для получения данных
        response1 = requests.get(url1)
        response2 = requests.get(url2)


        #Сортируем, чтобы не было дублей, типа США-Канада и Канада-США
        sorted_countries = sorted([country1, country2])

        # Увеличиваем счетчик запросов для пары стран country1 и country2

        _, created = CountryQuery.objects.get_or_create(country1=country1, country2=country2)
        if not created:
            CountryQuery.objects.filter(country1=country1, country2=country2).update(num_queries=models.F('num_queries') + 1)

        # Проверяем статусы ответов
        if response1.status_code == 200 and response2.status_code == 200:
            # Получаем JSON данные первой страны
            data1 = response1.json()
            # Получаем JSON данные второй страны
            data2 = response2.json()

            if len(data1['costs']) == 0:
                return JsonResponse({"error": "We do not have sufficient amount of data for " + country1}, status=500)

            if len(data2['costs']) == 0:
                return JsonResponse({"error": "We do not have sufficient amount of data for " + country2}, status=500)

            # Вычисляем разницу между данными
            absolute_difference, relative_difference = calculate_difference(data1, data2)

            # Формируем JSON-ответ
            response_data = {
                "country1": data1,
                "country2": data2,
                "absolute_difference": absolute_difference,
                "relative_difference": relative_difference
                }

            profile.calls_remaining -= 1
            profile.save()

            return JsonResponse(response_data, status=200)
        else:
            # Один из запросов вернул ошибку
            error_message = f"Failed to fetch data. Status codes: Country1 - {response1.status_code}, Country2 - {response2.status_code}"
            return JsonResponse({"error": error_message}, status=500)
    except requests.RequestException as e:
        # Обработка ошибки запроса
        return JsonResponse({"error": str(e)}, status=500)

def calculate_difference(data1, data2):
    absolute_change = {}
    relative_change = {}

    for key in data1:
        if key in data2:
            value1 = data1[key]
            value2 = data2[key]

            if isinstance(value1, dict) and isinstance(value2, dict):
                absolute_change[key], relative_change[key] = calculate_difference(value1, value2)
            elif isinstance(value1, list) and isinstance(value2, list):
                absolute_change[key] = []
                relative_change[key] = []
                for item1, item2 in zip(value1, value2):
                    abs_diff, rel_diff = calculate_difference(item1, item2)
                    absolute_change[key].append(abs_diff)
                    relative_change[key].append(rel_diff)
            elif isinstance(value1, str) and value1.replace('.', '').replace(',','').isdigit() and isinstance(value2, str) and value2.replace('.', '').replace(',','').isdigit():
                value1_decimal = Decimal(value1.replace(',', ''))
                value2_decimal = Decimal(value2.replace(',', ''))

                absolute_change[key] = float(value1_decimal - value2_decimal)
                relative_change[key] = float((value1_decimal - value2_decimal) / value2_decimal) if value2_decimal != 0 else None
            else:
                absolute_change[key] = value1
                relative_change[key] = value2
        else:
            absolute_change[key] = value1
            relative_change[key] = value2

    return absolute_change, relative_change


@require_POST
@csrf_exempt
def stripe_checkout(request, qty):
    user = verify_token(request);

    session = stripe.checkout.Session.create(
        line_items=[{
        'price_data': {
            'currency': 'usd',
            'product_data': {
            'name': '%s API calls' % qty,
            },
            'unit_amount': 100,
        },
        'quantity': qty,
        }],
        mode='payment',
        client_reference_id=user.id,
        success_url='http://localhost:8080/home',
        cancel_url='http://localhost:8080/home',
    )

    return JsonResponse({"url": session.url})

@require_GET
def get_calls_remaining(request):
    user = verify_token(request);
    user_profile = UserProfile.objects.get(user=user);

    return JsonResponse({"calls_remaining": user_profile.calls_remaining})




@csrf_exempt
def stripe_webhook(request):
    event = None
    payload = request.body
    sig_header = request.headers['STRIPE_SIGNATURE']

    print(request.body)
    print(request.headers)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        raise e
    except stripe.error.SignatureVerificationError as e:
        raise e

    if event.type == 'checkout.session.completed':
        session = event.data.object
        checkout = stripe.checkout.Session.retrieve(session['id'], expand=["line_items"])
        user = User.objects.get(id=session['client_reference_id'])
        print(checkout)
        user_profile = UserProfile.objects.get(user=user)

        user_profile.calls_remaining += checkout['line_items']['data'][0]["quantity"]
        user_profile.save()
    else:
        print('Unhandled event type {}'.format(event.type))

    return JsonResponse({'success': True})
