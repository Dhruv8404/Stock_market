from django.urls import path
from .views import get_chart_data, search_companies

urlpatterns = [
    path('stock_chart/', get_chart_data, name='stock_chart'),
     path('search/', search_companies, name='search_companies'),
]
