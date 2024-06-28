# Dockerfile for Python service
FROM python:3.12

WORKDIR /usr/src/app

RUN pip install paho-mqtt nats-py

COPY . .

CMD [ "python", "-u", "analytics.py" ]