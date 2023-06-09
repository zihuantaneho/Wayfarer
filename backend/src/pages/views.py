#!/usr/bin/python3
# encoding: utf-8
import requests
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.db import models
from pages.models import CountryQuery, UserProfile, ApiPayment
from django.shortcuts import redirect
from django.core import serializers

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
#stripe.api_key = ""
#endpoint_secret = ""

stripe.api_key = os.environ["STRIPE_API_KEY"]
endpoint_secret = os.environ["STRIPE_WEBHOOK_SECRET"]

#"_R4hsnsQ3Dfwnu5H6sLYjMw5QBLcLU5hc"

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

weights = {
    "Meal, Inexpensive Restaurant": 1.0,
    "Meal for 2 People, Mid-range Restaurant, Three-course": 1.0,
    "McMeal at McDonalds (or Equivalent Combo Meal)": 1.0,
    "Domestic Beer (0.5 liter draught)": 1.0,
    "Imported Beer (0.33 liter bottle)": 1.0,
    "Cappuccino (regular)": 1.0,
    "Coke/Pepsi (0.33 liter bottle)": 1.0,
    "Water (0.33 liter bottle)": 1.0,
    "Milk (regular), (1 liter)": 1.0,
    "Loaf of Fresh White Bread (500g)": 1.0,
    "Rice (white), (1kg)": 1.0,
    "Eggs (regular) (12)": 1.0,
    "Local Cheese (1kg)": 1.0,
    "Chicken Fillets (1kg)": 1.0,
    "Beef Round (1kg) (or Equivalent Back Leg Red Meat)": 1.0,
    "Apples (1kg)": 1.0,
    "Banana (1kg)": 1.0,
    "Oranges (1kg)": 1.0,
    "Tomato (1kg)": 1.0,
    "Potato (1kg)": 1.0,
    "Onion (1kg)": 1.0,
    "Lettuce (1 head)": 1.0,
    "Water (1.5 liter bottle)": 1.0,
    "Bottle of Wine (Mid-Range)": 1.0,
    "Domestic Beer (0.5 liter bottle)": 1.0,
    "Imported Beer (0.33 liter bottle)": 1.0,
    "Cigarettes 20 Pack (Marlboro)": 1.0,
    "One-way Ticket (Local Transport)": 1.0,
    "Monthly Pass (Regular Price)": 1.0,
    "Taxi Start (Normal Tariff)": 1.0,
    "Taxi 1km (Normal Tariff)": 1.0,
    "Taxi 1hour Waiting (Normal Tariff)": 1.0,
    "Gasoline (1 liter)": 1.0,
    "Volkswagen Golf 1.4 90 KW Trendline (Or Equivalent New Car)": 1.0,
    "Toyota Corolla Sedan 1.6l 97kW Comfort (Or Equivalent New Car)": 1.0,
    "Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment": 1.0,
    "1 min. of Prepaid Mobile Tariff Local (No Discounts or Plans)": 1.0,
    "Internet (60 Mbps or More, Unlimited Data, Cable/ADSL)": 1.0,
    "Fitness Club, Monthly Fee for 1 Adult": 1.0,
    "Tennis Court Rent (1 Hour on Weekend)": 1.0,
    "Cinema, International Release, 1 Seat": 1.0,
    "Preschool (or Kindergarten), Full Day, Private, Monthly for 1 Child": 1.0,
    "International Primary School, Yearly for 1 Child": 1.0,
    "1 Pair of Jeans (Levis 501 Or Similar)": 1.0,
    "1 Summer Dress in a Chain Store (Zara, H&M, ...)": 1.0,
    "1 Pair of Nike Running Shoes (Mid-Range)": 1.0,
    "1 Pair of Men Leather Business Shoes": 1.0,
    "Apartment (1 bedroom) in City Centre": 1.0,
    "Apartment (1 bedroom) Outside of Centre": 1.0,
    "Apartment (3 bedrooms) in City Centre": 1.0,
    "Apartment (3 bedrooms) Outside of Centre": 1.0,
    "Price per Square Meter to Buy Apartment in City Centre": 1.0,
    "Price per Square Meter to Buy Apartment Outside of Centre": 1.0,
    "Average Monthly Net Salary (After Tax)": 1.0,
}

@require_GET
def estimate_income(request, income, currency, country1, country2):
    user = None

    try:
        pass
        #user = verify_token(request)
        # Rest of your code...
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

    
    url1 = f"http://localhost:3000/{country1}?currency={currency}"
    url2 = f"http://localhost:3000/{country2}?currency={currency}"

    response1 = requests.get(url1).json()
    response2 = requests.get(url2).json()

    print(json.dumps(response1, indent=4))

    country1_value = Decimal(0);
    for item in response1['costs']:
        cost = Decimal(item['cost'].replace(',', ''))
        country1_value += cost * Decimal(weights[item['item']])

    country2_value = Decimal(0);
    for item in response2['costs']:
        cost = Decimal(item['cost'].replace(',', ''))
        country2_value += cost * Decimal(weights[item['item']])
    

    m = float(country1_value / country2_value) if country1_value != 0 else None

    return JsonResponse({"new_income": round(income * m if m else income)});

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
        return JsonResponse({'error': "No compare counts left"})

    # Формируем URL для запроса данных первой страны
    url1 = f"http://localhost:3000/{country1}?currency={currency}"
    # Формируем URL для запроса данных второй страны
    url2 = f"http://localhost:3000/{country2}?currency={currency}"

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

                absolute_change[key] = float(value2_decimal - value1_decimal)
                relative_change[key] = float((value2_decimal - value1_decimal) / value1_decimal) if value1_decimal != 0 else None
            else:
                absolute_change[key] = value1
                relative_change[key] = value2
        else:
            absolute_change[key] = value1
            relative_change[key] = value2

    return absolute_change, relative_change

@require_POST
@csrf_exempt
def delete_user(request):
    user = verify_token(request);

    user.delete();

    return JsonResponse({"status": "ok"})

@require_POST
@csrf_exempt
def stripe_checkout(request, qty):
    user = verify_token(request);

    session = stripe.checkout.Session.create(
        line_items=[{
        'price_data': {
            'currency': 'usd',
            'product_data': {
            'name': '%s calls' % qty,
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

@require_GET
def get_api_payments(request):
    user = verify_token(request);
    payments = user.api_payments.all();

    response = []

    for payment in payments: 
        p = {};
        p['qty'] = payment.qty
        p['amount_paid'] = payment.amount_paid
        p['date'] = payment.date

        response.append(p)

    return JsonResponse({"api_payments": response})

@csrf_exempt
def stripe_webhook(request):
    event = None
    payload = request.body
    sig_header = request.headers['STRIPE_SIGNATURE']

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

        user_profile = UserProfile.objects.get(user=user)

        user_profile.calls_remaining += checkout['line_items']['data'][0]["quantity"]
        user_profile.save()

        api_payment = ApiPayment(user=user, amount_paid=checkout['amount_total'], qty=checkout['line_items']['data'][0]["quantity"])
        api_payment.save()
    else:
        print('Unhandled event type {}'.format(event.type))

    return JsonResponse({'success': True})
