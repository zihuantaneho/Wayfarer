import requests
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.db import models
from .models import CountryQuery


from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
import json


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
    body = json.loads(request.body.decode())
    username = body["username"]
    password = body["password"]

    if not username or not password:
        return JsonResponse({'error': 'Both username and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)

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


@require_GET
def compare_countries(request, country1, country2):
    # Формируем URL для запроса данных первой страны
    url1 = f"http://localhost:3000/{country1}"
    # Формируем URL для запроса данных второй страны
    url2 = f"http://localhost:3000/{country2}"

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
