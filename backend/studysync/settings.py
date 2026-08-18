import os
SECRET_KEY=os.getenv("SECRET_KEY","dev-only-secret")
DEBUG=os.getenv("DEBUG","1")=="1"
ALLOWED_HOSTS=["*"]
INSTALLED_APPS=["django.contrib.contenttypes","django.contrib.auth","rest_framework","corsheaders"]
MIDDLEWARE=["corsheaders.middleware.CorsMiddleware","django.middleware.common.CommonMiddleware"]
ROOT_URLCONF="studysync.urls"
CORS_ALLOW_ALL_ORIGINS=True
DATABASES={"default":{"ENGINE":"django.db.backends.dummy"}}
