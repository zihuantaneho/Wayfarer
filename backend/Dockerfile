FROM python:3.10-bullseye
WORKDIR /code
COPY src/ /code
COPY requirements.txt ./
COPY docker-entrypoint.sh ./
RUN pip3 install -r requirements.txt

#ENV STRIPE_API_KEY ""
#ENV STRIPE_WEBHOOK_SECRET ""
#RUN mkdir /var/database
#RUN python manage.py migrate
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]
