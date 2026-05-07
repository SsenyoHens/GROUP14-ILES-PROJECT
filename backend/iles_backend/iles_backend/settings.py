import environ
from pathlib import Path
import os

# ==================================
# 📁 BASE DIRECTORY
# ==================================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================================
# 📁 STATIC FILES
# ==================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ==================================
# 🔐 ENVIRONMENT SETUP
# ==================================
env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')


# ==================================
# 🔐 SECURITY SETTINGS
# ==================================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-secret-key")
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

#Secure cookies
#SESSION_COOKIE_SECURE = True
#CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

#if frontend uses another port
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]


# ==================================
# 🌍 INTERNATIONALIZATION
# ==================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ==================================
# 📦 APPLICATIONS
# ==================================
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    "corsheaders",
    'core',
]


# ==================================
# 🔧 MIDDLEWARE
# ==================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==================================
# 🔗 URLS & TEMPLATES
# ==================================
ROOT_URLCONF = 'iles_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'iles_backend.wsgi.application'


# ==================================
# 🗄 DATABASE (PostgreSQL via .env)
# ==================================
DATABASES = {
    'default': env.db()
}

# Ensures each request is wrapped in a transaction
DATABASES['default']['ATOMIC_REQUESTS'] = True


# ==================================
# 🔑 AUTHENTICATION
# ==================================
AUTH_USER_MODEL = 'core.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==================================
# 📡 DJANGO REST FRAMEWORK
# ==================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],

    'DEFAULT_AUTHENTICATION_CLASSES': [],
}


# ==================================
# 📊 LOGGING
# ==================================
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}


# ==================================
# 🔧 DEFAULT PRIMARY KEY
# ==================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

#for testing
CORS_ALLOW_ALL_ORIGINS = True