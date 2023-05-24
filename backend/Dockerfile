FROM python:3.10-bullseye
WORKDIR /code
COPY src/ /code
COPY requirements.txt ./
RUN pip3 install -r requirements.txt
CMD [ "python3", "manage.py", "runserver", "8000" ]
