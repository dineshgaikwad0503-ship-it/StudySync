import os
SECRET_KEY=os.getenv("DJANGO_SECRET_KEY","change-me")
DEBUG=os.getenv("DEBUG","0")=="1"
ALLOWED_HOSTS=["*"]
INSTALLED_APPS=["django.contrib.auth","django.contrib.contenttypes","rest_framework","corsheaders","api"]
MIDDLEWARE=["corsheaders.middleware.CorsMiddleware","django.middleware.common.CommonMiddleware"]
ROOT_URLCONF="studysync.urls"
DATABASES={"default":{"ENGINE":"django.db.backends.sqlite3","NAME":":memory:"}}
CORS_ALLOW_ALL_ORIGINS=True
