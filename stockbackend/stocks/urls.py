from django.urls import path
from .views import get_chart_data, search_companies

urlpatterns = [
    path('stock_chart/', get_chart_data, name='get_chart_data'),
     path('search/', search_companies, name='search_companies'),
]
