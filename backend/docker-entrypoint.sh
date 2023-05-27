echo "Apply database migrations"
python3 manage.py migrate

echo "Starting server"
python manage.py runserver 0.0.0.0:8000