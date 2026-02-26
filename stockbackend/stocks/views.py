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

    # 🔥 PUT YOUR API KEY HERE DIRECTLY
    API_KEY = "CDM6GB2YTHCW2JLD"

    # Alpha Vantage function mapping
    function_map = {
        "1D": "TIME_SERIES_INTRADAY",
        "5D": "TIME_SERIES_INTRADAY",
        "1M": "TIME_SERIES_DAILY",
        "6M": "TIME_SERIES_WEEKLY",
        "1Y": "TIME_SERIES_WEEKLY",
        "MAX": "TIME_SERIES_MONTHLY"
    }

    function = function_map.get(range_param, "TIME_SERIES_DAILY")

    # NSE stocks → use .BSE or .NS format
    full_symbol = symbol + ".BSE"

    url = (
        f"https://www.alphavantage.co/query?"
        f"function={function}&symbol={full_symbol}&apikey={API_KEY}&interval=15min"
    )

    try:
        response = requests.get(url)
        data = response.json()

        # Find correct time series key
        time_series_key = next(
            (key for key in data if "Time Series" in key),
            None
        )

        if not time_series_key:
            return JsonResponse({"error": "No data returned from Alpha Vantage"}, status=404)

        series = data[time_series_key]

        chart_data = [
            {
                "time": time,
                "price": float(values["4. close"])
            }
            for time, values in series.items()
        ]

        chart_data.reverse()

        return JsonResponse(chart_data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)