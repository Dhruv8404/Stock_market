#!/bin/bash

# Run migrations
python manage.py migrate --noinput

# Start Gunicorn
exec gunicorn --bind 0.0.0.0:8000 stockbackend.wsgi:application
