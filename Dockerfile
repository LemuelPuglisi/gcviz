FROM python:3.8.11-alpine3.14

WORKDIR /app

COPY . /app/

RUN pip --no-cache-dir install -r requirements.txt

EXPOSE 5000

CMD ["python", "gcviz.py"]