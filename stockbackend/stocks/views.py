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


def get_chart_data(request):
    symbol = request.GET.get('symbol', '').strip().upper()
    range_param = request.GET.get('range', '1D').strip().upper()

    if not symbol:
        return JsonResponse({'error': 'Missing symbol parameter'}, status=400)

    # Auto append .NS if not provided
    if '.' not in symbol:
        symbol += '.NS'

    range_map = {
        '1D': ('1d', '15m'),
        '5D': ('5d', '1h'),
        '1M': ('1mo', '1d'),
        '6M': ('6mo', '1wk'),
        '1Y': ('1y', '1wk'),
        'MAX': ('max', '1mo'),
    }

    if range_param not in range_map:
        return JsonResponse({'error': 'Invalid range parameter'}, status=400)

    period, interval = range_map[range_param]

    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)

        if df.empty:
            return JsonResponse({'error': 'Invalid symbol or no data available'}, status=404)

        df = df.reset_index()

        data = [
            {
                'time': row['Datetime' if 'Datetime' in row else 'Date'].astimezone(pytz.UTC).isoformat(),
                'price': float(row['Close']) if not str(row['Close']).lower() == 'nan' else None
            }
            for _, row in df.iterrows()
        ]

        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({'error': 'Failed to fetch stock data', 'details': str(e)}, status=500)
