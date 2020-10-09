FROM python:3-slim

LABEL maintainer="Ben Couldrey <ben@unixben.com>"

WORKDIR /app

COPY app.py requirements.txt /app/
COPY config /app/config
COPY static /app/static
COPY templates /app/templates

RUN pip install -r requirements.txt

EXPOSE 9933
ENTRYPOINT ["python", "app.py"]
