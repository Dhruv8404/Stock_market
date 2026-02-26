# views.py
import yfinance as yf
from django.http import JsonResponse
import pytz
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import pandas as pd
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def stock_chart(request):
    symbol = request.GET.get('symbol', '')
    range_ = request.GET.get('range', '1d')  # default range
    
    if not symbol:
        return Response({"error": "No symbol provided"}, status=400)

    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=range_.lower())
        data = [
            {"time": str(row.name), "price": row["Close"]}
            for _, row in hist.iterrows()
        ]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
import os
from django.conf import settings

def search_companies(request):
    query = request.GET.get("q", "").upper()
    csv_path = os.path.join(settings.BASE_DIR, "stocks", "EQUITY_L.csv")

    try:
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            results = []
            for row in reader:
                if query in row["SYMBOL"]:
                    results.append({
                        "symbol": row["SYMBOL"],
                        "name": row["NAME OF COMPANY"]
                    })
            return JsonResponse(results, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "CSV file not found."}, status=500)
import requests
from django.http import JsonResponse

def get_chart_data(request):
    symbol = request.GET.get('symbol', '').strip().upper()
    range_param = request.GET.get('range', '1D').strip().upper()

    if not symbol:
        return JsonResponse({'error': 'Missing symbol parameter'}, status=400)

    API_KEY = "38b3c848266e4bb09ce162ee505aeb28"

    # Map range to interval
    interval_map = {
        "1D": "5min",
        "5D": "15min",
        "1M": "1day",
        "6M": "1week",
        "1Y": "1week",
        "MAX": "1month"
    }

    interval = interval_map.get(range_param, "1day")

    # NSE symbol format
    full_symbol = f"{symbol}:NSE"

    url = (
        f"https://api.twelvedata.com/time_series?"
        f"symbol={full_symbol}&interval={interval}&apikey={API_KEY}"
    )

    try:
        response = requests.get(url)
        data = response.json()

        if "values" not in data:
            return JsonResponse({"error": "No data returned", "details": data}, status=404)

        chart_data = [
            {
                "time": item["datetime"],
                "price": float(item["close"])
            }
            for item in reversed(data["values"])
        ]

        return JsonResponse(chart_data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)