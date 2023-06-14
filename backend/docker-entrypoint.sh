echo "Generate database migrations"
STRIPE_API_KEY="A" STRIPE_WEBHOOK_SECRET="B" python3 manage.py makemigrations

echo "Apply database migrations"
STRIPE_API_KEY="A" STRIPE_WEBHOOK_SECRET="B" python3 manage.py migrate
