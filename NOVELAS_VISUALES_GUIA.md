# Guia Completa: Proyecto Fullstack de Novelas Visuales
# Django REST Framework + React + Vite + MySQL + JWT

---

## Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Crear proyecto Django](#2-crear-proyecto-django)
3. [Instalar dependencias Python](#3-instalar-dependencias-python)
4. [Configurar .env](#4-configurar-env)
5. [Configurar settings.py](#5-configurar-settingspy)
6. [Configurar prueba/urls.py](#6-configurar-pruebaurlspy)
7. [App: usuarios](#7-app-usuarios)
8. [App: recursos](#8-app-recursos)
9. [App: historias](#9-app-historias)
10. [App: nodos](#10-app-nodos)
11. [App: personajes](#11-app-personajes)
12. [App: progreso](#12-app-progreso)
13. [Migrations y datos iniciales](#13-migrations-y-datos-iniciales)
14. [Frontend: setup](#14-frontend-setup)
15. [Frontend: vite.config.js](#15-frontend-viteconfigjs)
16. [Frontend: index.css y auth.css](#16-frontend-indexcss-y-authcss)
17. [Frontend: services/api.js](#17-frontend-servicesapijs)
18. [Frontend: login.jsx](#18-frontend-loginjsx)
19. [Frontend: register.jsx](#19-frontend-registerjsx)
20. [Frontend: App.jsx](#20-frontend-appjsx)
21. [Frontend: HistoriasApp.jsx](#21-frontend-historiasappjsx)
22. [Frontend: RecursosApp.jsx](#22-frontend-recursosappjsx)
23. [Levantar el proyecto](#23-levantar-el-proyecto)

---

## 1. Prerrequisitos

Antes de comenzar asegurate de tener instalado lo siguiente en tu maquina:

- **Python 3.11 o superior** — [https://www.python.org/downloads/](https://www.python.org/downloads/)
- **pip** (viene incluido con Python)
- **MySQL 8.0 o superior** — [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
- **Node.js 18 o superior** (incluye npm) — [https://nodejs.org/](https://nodejs.org/)
- **Git** — [https://git-scm.com/](https://git-scm.com/)
- Un editor de codigo como **VS Code**

Verifica las versiones con:

```bash
python --version
pip --version
mysql --version
node --version
npm --version
```

---

## 2. Crear proyecto Django

Abre una terminal en la carpeta donde quieres crear el proyecto y ejecuta:

```bash
# Crear el proyecto principal de Django llamado "novelasvisual"
django-admin startproject novelasvisual

# Entrar a la carpeta del proyecto
cd novelasvisual

# Crear todas las apps necesarias
python manage.py startapp core
python manage.py startapp usuarios
python manage.py startapp recursos
python manage.py startapp historias
python manage.py startapp nodos
python manage.py startapp personajes
python manage.py startapp progreso
```

Tambien crea las carpetas de medios y estaticos:

```bash
mkdir media
mkdir static
mkdir templates
```

La estructura del proyecto debe quedar asi:

```
novelasvisual/
    core/
    historias/
    media/
    nodos/
    novelasvisual/   <-- carpeta de configuracion (settings, urls, wsgi)
    personajes/
    progreso/
    recursos/
    static/
    templates/
    usuarios/
    manage.py
```

---

## 3. Instalar dependencias Python

Instala todas las dependencias necesarias con pip:

```bash
pip install django==4.2.16
pip install djangorestframework==3.15.2
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.4.0
pip install mysqlclient==2.2.4
pip install Pillow==10.4.0
pip install python-decouple==3.8
```

Opcionalmente genera un archivo requirements.txt para reproducibilidad:

```bash
pip freeze > requirements.txt
```

El archivo `requirements.txt` deberia contener al menos:

```
Django==4.2.16
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
mysqlclient==2.2.4
Pillow==10.4.0
python-decouple==3.8
```

> **Nota sobre mysqlclient en Windows:** Si mysqlclient falla al instalar, descarga el wheel precompilado desde [https://www.lfd.uci.edu/~gohlke/pythonlibs/](https://www.lfd.uci.edu/~gohlke/pythonlibs/) o usa `pip install PyMySQL` como alternativa e inicializa en `novelasvisual/__init__.py` con:
> ```python
> import pymysql
> pymysql.install_as_MySQLdb()
> ```

---

## 4. Configurar .env

Crea el archivo `.env` en la raiz del proyecto (junto a `manage.py`). **Nunca subas este archivo a git.**

```
SECRET_KEY=tu-clave-secreta-muy-larga-y-aleatoria-aqui-cambiala
DEBUG=True
DB_NAME=novelasvisual_db
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_HOST=localhost
DB_PORT=3306
```

Tambien crea la base de datos en MySQL antes de continuar:

```sql
CREATE DATABASE novelasvisual_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Agrega `.env` a tu `.gitignore`:

```
# .gitignore
.env
__pycache__/
*.pyc
media/
db.sqlite3
```

---

## 5. Configurar settings.py

Reemplaza el contenido completo de `novelasvisual/settings.py` con lo siguiente:

```python
# Configuracion principal del proyecto Novelas Visuales
# Utiliza python-decouple para leer variables del archivo .env

from decouple import config
from datetime import timedelta
from pathlib import Path
import os

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------------
# Seguridad
# -----------------------------------------------------------
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# -----------------------------------------------------------
# Aplicaciones instaladas
# -----------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Librerias de terceros
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',
    # Apps del proyecto
    'core',
    'usuarios',
    'recursos',
    'historias',
    'nodos',
    'personajes',
    'progreso',
]

# -----------------------------------------------------------
# Middleware
# -----------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'novelasvisual.urls'

# -----------------------------------------------------------
# Templates
# -----------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'novelasvisual.wsgi.application'

# -----------------------------------------------------------
# Base de datos MySQL
# -----------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# -----------------------------------------------------------
# Validaciones de contrasena
# -----------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -----------------------------------------------------------
# Internacionalizacion
# -----------------------------------------------------------
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# -----------------------------------------------------------
# Archivos estaticos y de medios
# -----------------------------------------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -----------------------------------------------------------
# Clave primaria por defecto
# -----------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------
# CORS: permite peticiones desde el frontend en Vite
# -----------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# -----------------------------------------------------------
# Django REST Framework: JWT global por defecto
# -----------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# -----------------------------------------------------------
# SimpleJWT: configuracion de tokens
# -----------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(seconds=300),   # 5 minutos
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# -----------------------------------------------------------
# Modelo de usuario personalizado
# -----------------------------------------------------------
AUTH_USER_MODEL = 'usuarios.MiUsuario'
```

---

## 6. Configurar prueba/urls.py

Reemplaza el contenido de `novelasvisual/urls.py` con lo siguiente:

```python
# URL raiz del proyecto Novelas Visuales
# Incluye las rutas de todas las apps y los endpoints de JWT

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views as core_views
from usuarios.views import RegistroView

urlpatterns = [
    # Vista de inicio (renderiza template HTML principal)
    path('', core_views.index, name='index'),

    # Endpoint para iniciar sesion: recibe email y password, devuelve access y refresh tokens
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Endpoint para refrescar el access token usando el refresh token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoint de registro publico (AllowAny)
    path('api/registro/', RegistroView.as_view(), name='registro'),

    # Rutas de cada app del proyecto
    path('', include('usuarios.urls')),
    path('', include('recursos.urls')),
    path('', include('historias.urls')),
    path('', include('nodos.urls')),
    path('', include('personajes.urls')),
    path('', include('progreso.urls')),
]

# Servir archivos de medios en modo DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 7. App: usuarios

Esta app maneja el modelo de usuario personalizado y el modelo de Rol.

### core/views.py

Primero configura la vista de inicio de la app `core`:

```python
# Vista de inicio del proyecto
from django.shortcuts import render

def index(request):
    # Renderiza la pagina de inicio
    return render(request, 'index.html')
```

Crea tambien `templates/index.html` con contenido minimo:

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Novelas Visuales</title></head>
<body><h1>API de Novelas Visuales</h1></body>
</html>
```

### usuarios/models.py

```python
# Modelos de usuario personalizado y roles del sistema
import base64
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin


# -----------------------------------------------------------
# Manager personalizado: define como crear usuarios y superusuarios
# -----------------------------------------------------------
class MiUsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        # set_password encripta la contrasena automaticamente
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# -----------------------------------------------------------
# Modelo de Rol: define los permisos de cada tipo de usuario
# -----------------------------------------------------------
class Rol(models.Model):
    # Nombre del rol (ej. administrador, lector, creador)
    nombre_rol = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.nombre_rol


# -----------------------------------------------------------
# Modelo de usuario personalizado: usa email en lugar de username
# -----------------------------------------------------------
class MiUsuario(AbstractUser, PermissionsMixin):
    # Eliminamos el campo username que trae Django por defecto
    username = None

    # Campos personales del usuario
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    # Relacion con el rol del usuario
    id_rol = models.ForeignKey(
        Rol,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )

    # Campos requeridos por Django para el admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MiUsuarioManager()

    # El email es el campo de autenticacion (reemplaza a username)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido_paterno']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.nombre} {self.apellido_paterno} ({self.email})'
```

### usuarios/serializers.py

```python
# Serializadores para registro y consulta de usuarios
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Rol

# Obtiene dinamicamente el modelo MiUsuario gracias a AUTH_USER_MODEL en settings.py
User = get_user_model()


# -----------------------------------------------------------
# Serializador de Rol
# -----------------------------------------------------------
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre_rol']


# -----------------------------------------------------------
# Serializador de registro de usuario
# La contrasena es write_only para que nunca se devuelva en respuestas
# -----------------------------------------------------------
class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'email',
            'password',
            'id_rol',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Usamos create_user del manager para que la contrasena se encripte
        user = User.objects.create_user(**validated_data)
        return user


# -----------------------------------------------------------
# Serializador de consulta de usuario (sin contrasena)
# -----------------------------------------------------------
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'email',
            'fecha_registro',
            'activo',
            'id_rol',
        ]
```

### usuarios/views.py

```python
# Vistas de la app usuarios
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from .models import Rol
from .serializers import RegistroSerializer, RolSerializer, UsuarioSerializer

# Obtenemos el modelo personalizado
User = get_user_model()


# -----------------------------------------------------------
# Vista de registro: publica, no requiere autenticacion
# -----------------------------------------------------------
class RegistroView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistroSerializer


# -----------------------------------------------------------
# ViewSet de Roles: CRUD completo con autenticacion
# -----------------------------------------------------------
class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


# -----------------------------------------------------------
# ViewSet de Usuarios: CRUD completo con autenticacion
# -----------------------------------------------------------
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
```

### usuarios/urls.py

```python
# URLs de la app usuarios
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RolViewSet, UsuarioViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Todas las rutas generadas quedan bajo el prefijo api/
    path('api/', include(router.urls)),
]
```

---

## 8. App: recursos

Esta app maneja las imagenes (con patron dual ImageField + BinaryField) y los archivos de audio.

### recursos/models.py

```python
# Modelos de recursos multimedia: imagenes y audios
import base64
from django.db import models


# -----------------------------------------------------------
# Modelo de Imagen: almacena la imagen en el servidor (ImageField)
# y tambien en la base de datos como binario (BinaryField)
# -----------------------------------------------------------
class Imagen(models.Model):

    # Opciones de tipo de imagen
    TIPO_CHOICES = [
        ('escenario', 'Escenario'),
        ('personaje', 'Personaje'),
        ('portada', 'Portada'),
    ]

    # Ruta del archivo en el servidor (carpeta media/imagenes/)
    url = models.ImageField(upload_to='imagenes/', blank=True, null=True)

    # Copia binaria de la imagen guardada directamente en la base de datos
    imagen_binaria = models.BinaryField(blank=True, null=True)

    # Tipo de imagen segun su uso en la novela visual
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='escenario')

    # Descripcion opcional para identificar la imagen
    descripcion = models.CharField(max_length=255, blank=True)

    @property
    def imagen_base64(self):
        """Convierte la imagen binaria a base64 para mostrarla en el frontend"""
        if self.imagen_binaria:
            return base64.b64encode(self.imagen_binaria).decode('utf-8')
        return None

    class Meta:
        verbose_name = 'Imagen'
        verbose_name_plural = 'Imagenes'

    def __str__(self):
        return f'{self.tipo} - {self.descripcion or self.id}'


# -----------------------------------------------------------
# Modelo de Audio: almacena el archivo de sonido en el servidor
# -----------------------------------------------------------
class Audio(models.Model):

    # Archivo de audio guardado en media/audio/
    archivo = models.FileField(upload_to='audio/', blank=True, null=True)

    # Descripcion para identificar el audio
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Audio'
        verbose_name_plural = 'Audios'

    def __str__(self):
        return self.descripcion or f'Audio {self.id}'
```

### recursos/serializers.py

```python
# Serializadores de la app recursos
from rest_framework import serializers
from .models import Imagen, Audio


# -----------------------------------------------------------
# Serializador de Imagen con patron dual:
# - imagen_para_binario: recibe el archivo (write_only)
# - imagen_base64_display: devuelve la version base64 (read_only)
# -----------------------------------------------------------
class ImagenSerializer(serializers.ModelSerializer):
    # Campo para recibir el archivo que se guardara como binario en la BD
    imagen_para_binario = serializers.ImageField(write_only=True, required=False)

    # Campo calculado que expone la imagen binaria como cadena base64
    imagen_base64_display = serializers.ReadOnlyField(source='imagen_base64')

    class Meta:
        model = Imagen
        fields = [
            'id',
            'url',
            'imagen_para_binario',
            'imagen_base64_display',
            'tipo',
            'descripcion',
        ]

    def create(self, validated_data):
        # Extraemos el archivo binario antes de crear el objeto
        archivo_binario = validated_data.pop('imagen_para_binario', None)
        imagen = Imagen.objects.create(**validated_data)
        if archivo_binario:
            # Leemos los bytes del archivo y los guardamos en el campo binario
            imagen.imagen_binaria = archivo_binario.read()
            imagen.save()
        return imagen

    def update(self, instance, validated_data):
        # Extraemos el archivo binario si se envio en la actualizacion
        archivo_binario = validated_data.pop('imagen_para_binario', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if archivo_binario:
            instance.imagen_binaria = archivo_binario.read()
        instance.save()
        return instance


# -----------------------------------------------------------
# Serializador de Audio
# -----------------------------------------------------------
class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        fields = [
            'id',
            'archivo',
            'descripcion',
        ]
```

### recursos/views.py

```python
# Vistas de la app recursos
from rest_framework import viewsets
from .models import Imagen, Audio
from .serializers import ImagenSerializer, AudioSerializer


# -----------------------------------------------------------
# ViewSet de Imagen: CRUD completo
# -----------------------------------------------------------
class ImagenViewSet(viewsets.ModelViewSet):
    queryset = Imagen.objects.all()
    serializer_class = ImagenSerializer


# -----------------------------------------------------------
# ViewSet de Audio: CRUD completo
# -----------------------------------------------------------
class AudioViewSet(viewsets.ModelViewSet):
    queryset = Audio.objects.all()
    serializer_class = AudioSerializer
```

### recursos/urls.py

```python
# URLs de la app recursos
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImagenViewSet, AudioViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'imagenes', ImagenViewSet, basename='imagen')
router.register(r'audios', AudioViewSet, basename='audio')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 9. App: historias

Esta app maneja el modelo Historia. Tiene una referencia circular con Nodo (id_nodo_inicio) que se resuelve con null=True y blank=True.

### historias/models.py

```python
# Modelo de Historia: unidad principal de la novela visual
from django.db import models
from django.conf import settings


# -----------------------------------------------------------
# Modelo Historia
# Nota: id_nodo_inicio es null=True para resolver la referencia circular
# con el modelo Nodo (que aun no existe cuando se crea la historia)
# -----------------------------------------------------------
class Historia(models.Model):

    # Titulo visible de la historia
    titulo = models.CharField(max_length=200)

    # Descripcion o sinopsis de la historia
    descripcion = models.TextField(blank=True)

    # Fecha en que fue creada (se llena automaticamente)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    # Indica si la historia esta publicada o es borrador
    publicada = models.BooleanField(default=False)

    # Usuario que creo la historia (FK a MiUsuario)
    id_creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='historias_creadas'
    )

    # Nodo de inicio de la historia (se asigna despues de crear los nodos)
    # null=True y blank=True para evitar referencia circular al crear la historia
    id_nodo_inicio = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historia_inicio'
    )

    class Meta:
        verbose_name = 'Historia'
        verbose_name_plural = 'Historias'

    def __str__(self):
        return self.titulo
```

### historias/serializers.py

```python
# Serializadores de la app historias
from rest_framework import serializers
from .models import Historia


# -----------------------------------------------------------
# Serializador de Historia
# -----------------------------------------------------------
class HistoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historia
        fields = [
            'id',
            'titulo',
            'descripcion',
            'fecha_creacion',
            'publicada',
            'id_creador',
            'id_nodo_inicio',
        ]
```

### historias/views.py

```python
# Vistas de la app historias
from rest_framework import viewsets
from .models import Historia
from .serializers import HistoriaSerializer


# -----------------------------------------------------------
# ViewSet de Historia: CRUD completo
# -----------------------------------------------------------
class HistoriaViewSet(viewsets.ModelViewSet):
    queryset = Historia.objects.all()
    serializer_class = HistoriaSerializer
```

### historias/urls.py

```python
# URLs de la app historias
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HistoriaViewSet

# Registramos el ViewSet en el router
router = DefaultRouter()
router.register(r'historias', HistoriaViewSet, basename='historia')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 10. App: nodos

Esta app maneja los Nodos (escenas de la novela) y las Opciones (elecciones del jugador).

### nodos/models.py

```python
# Modelos de Nodo y Opcion para la estructura de la novela visual
from django.db import models


# -----------------------------------------------------------
# Modelo Nodo: representa una escena o pantalla de la novela visual
# -----------------------------------------------------------
class Nodo(models.Model):

    # Titulo interno para identificar el nodo en el editor
    titulo_nodo = models.CharField(max_length=200)

    # Texto narrativo que se muestra al jugador en esta escena
    texto = models.TextField()

    # Indica si este nodo es un final de la historia
    es_final = models.BooleanField(default=False)

    # Historia a la que pertenece este nodo
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='nodos'
    )

    # Imagen de escenario de fondo para esta escena (opcional)
    id_imagen_escenario = models.ForeignKey(
        'recursos.Imagen',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nodos_como_escenario'
    )

    # Audio de fondo para esta escena (opcional)
    id_audio_fondo = models.ForeignKey(
        'recursos.Audio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nodos_con_audio'
    )

    class Meta:
        verbose_name = 'Nodo'
        verbose_name_plural = 'Nodos'

    def __str__(self):
        return f'{self.titulo_nodo} (Historia: {self.id_historia_id})'


# -----------------------------------------------------------
# Modelo Opcion: representa una eleccion que el jugador puede tomar
# desde un nodo, llevandolo a otro nodo
# -----------------------------------------------------------
class Opcion(models.Model):

    # Texto de la opcion que ve el jugador
    texto_opcion = models.CharField(max_length=300)

    # Nodo desde el cual se muestra esta opcion
    id_nodo_origen = models.ForeignKey(
        Nodo,
        on_delete=models.CASCADE,
        related_name='opciones_origen'
    )

    # Nodo al que lleva esta opcion cuando el jugador la elige
    id_nodo_destino = models.ForeignKey(
        Nodo,
        on_delete=models.CASCADE,
        related_name='opciones_destino'
    )

    class Meta:
        verbose_name = 'Opcion'
        verbose_name_plural = 'Opciones'

    def __str__(self):
        return f'{self.texto_opcion} (Nodo {self.id_nodo_origen_id} -> {self.id_nodo_destino_id})'
```

### nodos/serializers.py

```python
# Serializadores de la app nodos
from rest_framework import serializers
from .models import Nodo, Opcion


# -----------------------------------------------------------
# Serializador de Nodo
# -----------------------------------------------------------
class NodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nodo
        fields = [
            'id',
            'titulo_nodo',
            'texto',
            'es_final',
            'id_historia',
            'id_imagen_escenario',
            'id_audio_fondo',
        ]


# -----------------------------------------------------------
# Serializador de Opcion
# -----------------------------------------------------------
class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = [
            'id',
            'texto_opcion',
            'id_nodo_origen',
            'id_nodo_destino',
        ]
```

### nodos/views.py

```python
# Vistas de la app nodos
from rest_framework import viewsets
from .models import Nodo, Opcion
from .serializers import NodoSerializer, OpcionSerializer


# -----------------------------------------------------------
# ViewSet de Nodo: CRUD completo
# -----------------------------------------------------------
class NodoViewSet(viewsets.ModelViewSet):
    queryset = Nodo.objects.all()
    serializer_class = NodoSerializer


# -----------------------------------------------------------
# ViewSet de Opcion: CRUD completo
# -----------------------------------------------------------
class OpcionViewSet(viewsets.ModelViewSet):
    queryset = Opcion.objects.all()
    serializer_class = OpcionSerializer
```

### nodos/urls.py

```python
# URLs de la app nodos
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NodoViewSet, OpcionViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'nodos', NodoViewSet, basename='nodo')
router.register(r'opciones', OpcionViewSet, basename='opcion')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 11. App: personajes

Esta app maneja los Personajes y la tabla intermedia NodoPersonaje (through de ManyToMany).

### personajes/models.py

```python
# Modelos de Personaje y NodoPersonaje (tabla pivote)
from django.db import models


# -----------------------------------------------------------
# Modelo Personaje: un personaje que aparece en una historia
# -----------------------------------------------------------
class Personaje(models.Model):

    # Nombre del personaje
    nombre = models.CharField(max_length=150)

    # Historia a la que pertenece el personaje
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='personajes'
    )

    # Imagen del personaje (sprite o ilustracion), opcional
    id_imagen = models.ForeignKey(
        'recursos.Imagen',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='personajes'
    )

    # Relacion ManyToMany con Nodo usando la tabla through NodoPersonaje
    nodos = models.ManyToManyField(
        'nodos.Nodo',
        through='NodoPersonaje',
        related_name='personajes'
    )

    class Meta:
        verbose_name = 'Personaje'
        verbose_name_plural = 'Personajes'

    def __str__(self):
        return f'{self.nombre} (Historia: {self.id_historia_id})'


# -----------------------------------------------------------
# Modelo NodoPersonaje: tabla pivote que registra en que posicion
# aparece cada personaje dentro de un nodo especifico
# -----------------------------------------------------------
class NodoPersonaje(models.Model):

    # Opciones de posicion en pantalla
    POSICION_CHOICES = [
        ('izquierda', 'Izquierda'),
        ('centro', 'Centro'),
        ('derecha', 'Derecha'),
    ]

    # Nodo en el que aparece el personaje
    id_nodo = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.CASCADE,
        related_name='nodo_personajes'
    )

    # Personaje que aparece en el nodo
    id_personaje = models.ForeignKey(
        Personaje,
        on_delete=models.CASCADE,
        related_name='nodo_personajes'
    )

    # Posicion del personaje en la pantalla
    posicion = models.CharField(
        max_length=10,
        choices=POSICION_CHOICES,
        default='centro'
    )

    class Meta:
        verbose_name = 'Nodo Personaje'
        verbose_name_plural = 'Nodo Personajes'
        # Un personaje solo puede aparecer una vez por nodo
        unique_together = ('id_nodo', 'id_personaje')

    def __str__(self):
        return f'Nodo {self.id_nodo_id} | {self.id_personaje} | {self.posicion}'
```

### personajes/serializers.py

```python
# Serializadores de la app personajes
from rest_framework import serializers
from .models import Personaje, NodoPersonaje


# -----------------------------------------------------------
# Serializador de Personaje
# -----------------------------------------------------------
class PersonajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personaje
        fields = [
            'id',
            'nombre',
            'id_historia',
            'id_imagen',
        ]


# -----------------------------------------------------------
# Serializador de NodoPersonaje (tabla pivote)
# -----------------------------------------------------------
class NodoPersonajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NodoPersonaje
        fields = [
            'id',
            'id_nodo',
            'id_personaje',
            'posicion',
        ]
```

### personajes/views.py

```python
# Vistas de la app personajes
from rest_framework import viewsets
from .models import Personaje, NodoPersonaje
from .serializers import PersonajeSerializer, NodoPersonajeSerializer


# -----------------------------------------------------------
# ViewSet de Personaje: CRUD completo
# -----------------------------------------------------------
class PersonajeViewSet(viewsets.ModelViewSet):
    queryset = Personaje.objects.all()
    serializer_class = PersonajeSerializer


# -----------------------------------------------------------
# ViewSet de NodoPersonaje: CRUD completo
# -----------------------------------------------------------
class NodoPersonajeViewSet(viewsets.ModelViewSet):
    queryset = NodoPersonaje.objects.all()
    serializer_class = NodoPersonajeSerializer
```

### personajes/urls.py

```python
# URLs de la app personajes
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonajeViewSet, NodoPersonajeViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'personajes', PersonajeViewSet, basename='personaje')
router.register(r'nodo-personajes', NodoPersonajeViewSet, basename='nodo-personaje')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 12. App: progreso

Esta app maneja el progreso de cada usuario en cada historia. El ViewSet filtra por usuario autenticado.

### progreso/models.py

```python
# Modelo de progreso del usuario en una historia
from django.db import models
from django.conf import settings


# -----------------------------------------------------------
# Modelo ProgresoUsuario: guarda en que nodo se quedo
# cada usuario dentro de cada historia
# -----------------------------------------------------------
class ProgresoUsuario(models.Model):

    # Usuario dueno del progreso
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Historia en la que tiene progreso
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Nodo en el que se encuentra actualmente el usuario
    id_nodo_actual = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Fecha y hora de la ultima actualizacion del progreso
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Progreso de Usuario'
        verbose_name_plural = 'Progresos de Usuarios'
        # Un usuario solo puede tener un progreso activo por historia
        unique_together = ('id_usuario', 'id_historia')

    def __str__(self):
        return f'Usuario {self.id_usuario_id} | Historia {self.id_historia_id} | Nodo {self.id_nodo_actual_id}'
```

### progreso/serializers.py

```python
# Serializadores de la app progreso
from rest_framework import serializers
from .models import ProgresoUsuario


# -----------------------------------------------------------
# Serializador de ProgresoUsuario
# -----------------------------------------------------------
class ProgresoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgresoUsuario
        fields = [
            'id',
            'id_usuario',
            'id_historia',
            'id_nodo_actual',
            'fecha_actualizacion',
        ]
```

### progreso/views.py

```python
# Vistas de la app progreso
# El ViewSet filtra los progresos por el usuario autenticado actual
from rest_framework import viewsets
from .models import ProgresoUsuario
from .serializers import ProgresoUsuarioSerializer


# -----------------------------------------------------------
# ViewSet de ProgresoUsuario
# Solo devuelve los progresos del usuario que hace la peticion
# -----------------------------------------------------------
class ProgresoUsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = ProgresoUsuarioSerializer

    def get_queryset(self):
        # Filtramos para que cada usuario solo vea su propio progreso
        return ProgresoUsuario.objects.filter(id_usuario=self.request.user)
```

### progreso/urls.py

```python
# URLs de la app progreso
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgresoUsuarioViewSet

# Registramos el ViewSet en el router
router = DefaultRouter()
router.register(r'progresos', ProgresoUsuarioViewSet, basename='progreso')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

---

## 13. Migrations y datos iniciales

Ejecuta los siguientes comandos en orden para crear las tablas en la base de datos:

```bash
# 1. Crear las migraciones de todas las apps
python manage.py makemigrations usuarios
python manage.py makemigrations recursos
python manage.py makemigrations historias
python manage.py makemigrations nodos
python manage.py makemigrations personajes
python manage.py makemigrations progreso

# 2. Aplicar todas las migraciones a la base de datos
python manage.py migrate

# 3. Crear un superusuario para acceder al admin de Django
python manage.py createsuperuser
# Ingresa: email, nombre, apellido_paterno y contrasena cuando se te pida
```

Si quieres cargar datos iniciales de roles, crea el archivo `usuarios/fixtures/roles_iniciales.json`:

```json
[
    {
        "model": "usuarios.rol",
        "pk": 1,
        "fields": {
            "nombre_rol": "administrador"
        }
    },
    {
        "model": "usuarios.rol",
        "pk": 2,
        "fields": {
            "nombre_rol": "creador"
        }
    },
    {
        "model": "usuarios.rol",
        "pk": 3,
        "fields": {
            "nombre_rol": "lector"
        }
    }
]
```

Carga los datos con:

```bash
python manage.py loaddata usuarios/fixtures/roles_iniciales.json
```

Verifica que el servidor Django funciona:

```bash
python manage.py runserver
```

Abre [http://localhost:8000/api/](http://localhost:8000/api/) en tu navegador. Deberas ver la interfaz del DRF con los endpoints disponibles.

---

## 14. Frontend: setup

Abre una nueva terminal (deja Django corriendo en la primera) y ejecuta:

```bash
# Crear el proyecto Vite con React
npm create vite@latest front -- --template react

# Entrar a la carpeta del frontend
cd front

# Instalar dependencias base de Vite
npm install

# Instalar dependencias del proyecto
npm install axios react-router-dom bootstrap react-data-table-component react-hot-toast
```

La estructura de `front/src/` debe quedar asi:

```
front/src/
    assets/
    services/
        api.js
    App.jsx
    App.css
    auth.css
    index.css
    login.jsx
    main.jsx
    register.jsx
    HistoriasApp.jsx
    RecursosApp.jsx
```

---

## 15. Frontend: vite.config.js

Reemplaza el contenido de `front/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracion de Vite para el proyecto de novelas visuales
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Proxy para redirigir llamadas /api al servidor Django
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 16. Frontend: index.css y auth.css

### front/src/index.css

```css
html,
body,
#root {
  margin: 0;
  min-width: 320px;
  min-height: 100%;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #111827;
  background-color: #f9fafb;
}
```

### front/src/auth.css

```css
:root {
  --auth-bg: #f2efe7;
  --auth-surface: #fffdf7;
  --auth-primary: #16404d;
  --auth-accent: #d1a980;
  --auth-text: #1f2937;
  --auth-error: #b91c1c;
  --auth-success: #166534;
}

* {
  box-sizing: border-box;
}

.auth-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 10% 15%, rgba(209, 169, 128, 0.4), transparent 35%),
    radial-gradient(circle at 90% 85%, rgba(22, 64, 77, 0.26), transparent 35%),
    var(--auth-bg);
  overflow: hidden;
}

.auth-background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(14px);
  opacity: 0.45;
}

.auth-shape-1 {
  width: 260px;
  height: 260px;
  top: -70px;
  right: -40px;
  background: var(--auth-accent);
}

.auth-shape-2 {
  width: 300px;
  height: 300px;
  left: -80px;
  bottom: -120px;
  background: var(--auth-primary);
}

.auth-card {
  position: relative;
  width: min(440px, 100%);
  padding: 32px;
  border-radius: 20px;
  background: linear-gradient(170deg, #ffffff, var(--auth-surface));
  box-shadow: 0 20px 40px rgba(22, 64, 77, 0.18);
  animation: card-entry 0.55s ease-out;
}

.auth-title {
  margin: 0;
  font-size: 2rem;
  color: var(--auth-primary);
  letter-spacing: 0.03em;
}

.auth-subtitle {
  margin: 8px 0 20px;
  color: #4b5563;
  font-size: 0.95rem;
}

.auth-form {
  display: grid;
  gap: 10px;
}

.auth-form label {
  font-size: 0.9rem;
  color: var(--auth-text);
  font-weight: 600;
}

.auth-form input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font-size: 0.95rem;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--auth-primary);
  box-shadow: 0 0 0 4px rgba(22, 64, 77, 0.16);
}

.auth-form button {
  margin-top: 6px;
  border: none;
  border-radius: 10px;
  padding: 0.8rem;
  background: linear-gradient(120deg, var(--auth-primary), #1f5c6f);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.auth-form button:hover {
  transform: translateY(-1px);
}

.auth-form button:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.auth-error,
.auth-success {
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.auth-error {
  color: var(--auth-error);
}

.auth-success {
  color: var(--auth-success);
}

.auth-footer-text {
  margin-top: 18px;
  text-align: center;
  color: #4b5563;
}

.auth-footer-text a {
  color: var(--auth-primary);
  font-weight: 700;
  text-decoration: none;
}

@keyframes card-entry {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px;
  }

  .auth-title {
    font-size: 1.6rem;
  }
}
```

---

## 17. Frontend: services/api.js

Crea el archivo `front/src/services/api.js` con todos los endpoints del proyecto:

```javascript
// Servicio central de API para el proyecto Novelas Visuales
// Maneja autenticacion JWT con interceptores de axios

import axios from 'axios';

// URL base del servidor Django
const BASE = 'http://localhost:8000';

// Instancia de axios apuntando a la raiz del servidor
const api = axios.create({ baseURL: BASE });

// -----------------------------------------------------------
// Endpoints publicos de autenticacion
// -----------------------------------------------------------

// Inicia sesion con email y password, devuelve access y refresh tokens
export const loginUser = (credentials) => {
    return api.post('/api/login/', credentials);
};

// Registra un nuevo usuario (ruta publica)
export const registerUser = (data) => {
    return api.post('/api/registro/', data);
};

// -----------------------------------------------------------
// Interceptor de Solicitud: agrega el token JWT en cada peticion
// -----------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// -----------------------------------------------------------
// Interceptor de Respuesta: renueva el token si expiro (401)
// Si el refresh tambien falla, redirige al login
// -----------------------------------------------------------
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${BASE}/api/token/refresh/`, {
                    refresh: refreshToken,
                });

                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// -----------------------------------------------------------
// HISTORIAS
// -----------------------------------------------------------

// Listar todas las historias
export const readHistorias = () => api.get('/api/historias/');

// Crear una nueva historia
export const createHistoria = (data) => api.post('/api/historias/', data);

// Actualizar una historia existente
export const updateHistoria = (id, data) => api.put(`/api/historias/${id}/`, data);

// Eliminar una historia
export const deleteHistoria = (id) => api.delete(`/api/historias/${id}/`);

// -----------------------------------------------------------
// NODOS
// -----------------------------------------------------------

// Listar todos los nodos
export const readNodos = () => api.get('/api/nodos/');

// Crear un nuevo nodo
export const createNodo = (data) => api.post('/api/nodos/', data);

// Actualizar un nodo
export const updateNodo = (id, data) => api.put(`/api/nodos/${id}/`, data);

// Eliminar un nodo
export const deleteNodo = (id) => api.delete(`/api/nodos/${id}/`);

// -----------------------------------------------------------
// OPCIONES
// -----------------------------------------------------------

// Listar todas las opciones
export const readOpciones = () => api.get('/api/opciones/');

// Crear una nueva opcion
export const createOpcion = (data) => api.post('/api/opciones/', data);

// Actualizar una opcion
export const updateOpcion = (id, data) => api.put(`/api/opciones/${id}/`, data);

// Eliminar una opcion
export const deleteOpcion = (id) => api.delete(`/api/opciones/${id}/`);

// -----------------------------------------------------------
// PERSONAJES
// -----------------------------------------------------------

// Listar todos los personajes
export const readPersonajes = () => api.get('/api/personajes/');

// Crear un nuevo personaje
export const createPersonaje = (data) => api.post('/api/personajes/', data);

// Actualizar un personaje
export const updatePersonaje = (id, data) => api.put(`/api/personajes/${id}/`, data);

// Eliminar un personaje
export const deletePersonaje = (id) => api.delete(`/api/personajes/${id}/`);

// -----------------------------------------------------------
// NODO-PERSONAJE (tabla pivote)
// -----------------------------------------------------------

// Listar todos los nodo-personajes
export const readNodoPersonajes = () => api.get('/api/nodo-personajes/');

// Crear un nuevo nodo-personaje
export const createNodoPersonaje = (data) => api.post('/api/nodo-personajes/', data);

// Actualizar un nodo-personaje
export const updateNodoPersonaje = (id, data) => api.put(`/api/nodo-personajes/${id}/`, data);

// Eliminar un nodo-personaje
export const deleteNodoPersonaje = (id) => api.delete(`/api/nodo-personajes/${id}/`);

// -----------------------------------------------------------
// IMAGENES
// -----------------------------------------------------------

// Listar todas las imagenes
export const readImagenes = () => api.get('/api/imagenes/');

// Crear una imagen (envia FormData con url e imagen_para_binario)
export const createImagen = (data) => {
    if (data instanceof FormData) {
        return api.post('/api/imagenes/', data);
    }
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return api.post('/api/imagenes/', formData);
};

// Actualizar una imagen
export const updateImagen = (id, data) => {
    if (data instanceof FormData) {
        return api.put(`/api/imagenes/${id}/`, data);
    }
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return api.put(`/api/imagenes/${id}/`, formData);
};

// Eliminar una imagen
export const deleteImagen = (id) => api.delete(`/api/imagenes/${id}/`);

// -----------------------------------------------------------
// AUDIOS
// -----------------------------------------------------------

// Listar todos los audios
export const readAudios = () => api.get('/api/audios/');

// Crear un nuevo audio (envia FormData con archivo)
export const createAudio = (data) => {
    if (data instanceof FormData) {
        return api.post('/api/audios/', data);
    }
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return api.post('/api/audios/', formData);
};

// Actualizar un audio
export const updateAudio = (id, data) => {
    if (data instanceof FormData) {
        return api.put(`/api/audios/${id}/`, data);
    }
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return api.put(`/api/audios/${id}/`, formData);
};

// Eliminar un audio
export const deleteAudio = (id) => api.delete(`/api/audios/${id}/`);

// -----------------------------------------------------------
// PROGRESOS
// -----------------------------------------------------------

// Listar progresos del usuario actual (el backend filtra por usuario)
export const readProgresos = () => api.get('/api/progresos/');

// Crear un nuevo progreso
export const createProgreso = (data) => api.post('/api/progresos/', data);

// Actualizar un progreso
export const updateProgreso = (id, data) => api.put(`/api/progresos/${id}/`, data);

// Eliminar un progreso
export const deleteProgreso = (id) => api.delete(`/api/progresos/${id}/`);

// -----------------------------------------------------------
// ROLES
// -----------------------------------------------------------

// Listar todos los roles
export const readRoles = () => api.get('/api/roles/');

// -----------------------------------------------------------
// USUARIOS
// -----------------------------------------------------------

// Listar todos los usuarios
export const readUsuarios = () => api.get('/api/usuarios/');
```

---

## 18. Frontend: login.jsx

Crea el archivo `front/src/login.jsx`:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from './services/api';
import './auth.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(formData);
            // Guardamos los tokens en localStorage para usarlos en peticiones futuras
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            // Redirigimos al modulo principal
            navigate('/historias');
        } catch (apiError) {
            const message =
                apiError.response?.data?.detail ||
                'No fue posible iniciar sesion. Verifica tus credenciales.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-1" />
            <div className="auth-background-shape auth-shape-2" />

            <section className="auth-card">
                <h1 className="auth-title">Iniciar sesion</h1>
                <p className="auth-subtitle">Accede con tu email y contrasena para continuar.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="correo@ejemplo.com"
                    />

                    <label htmlFor="password">Contrasena</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="********"
                    />

                    {error ? <p className="auth-error">{error}</p> : null}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    No tienes cuenta? <Link to="/registro">Registrate</Link>
                </p>
            </section>
        </div>
    );
}

export default Login;
```

---

## 19. Frontend: register.jsx

Crea el archivo `front/src/register.jsx`:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from './services/api';
import './auth.css';

// Estado inicial del formulario de registro
const initialState = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
};

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await registerUser(formData);
            setSuccess('Registro completado. Ahora puedes iniciar sesion.');
            setFormData(initialState);
            // Redirige al login despues de 900ms
            setTimeout(() => navigate('/login'), 900);
        } catch (apiError) {
            const responseData = apiError.response?.data;
            if (responseData && typeof responseData === 'object') {
                const readableErrors = Object.values(responseData)
                    .flat()
                    .join(' ');
                setError(readableErrors || 'No fue posible completar el registro.');
            } else {
                setError('No fue posible completar el registro.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-1" />
            <div className="auth-background-shape auth-shape-2" />

            <section className="auth-card">
                <h1 className="auth-title">Crear cuenta</h1>
                <p className="auth-subtitle">Registra tus datos para usar la plataforma.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                    />

                    <label htmlFor="apellido_paterno">Apellido paterno</label>
                    <input
                        id="apellido_paterno"
                        name="apellido_paterno"
                        type="text"
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        required
                        placeholder="Apellido paterno"
                    />

                    <label htmlFor="apellido_materno">Apellido materno</label>
                    <input
                        id="apellido_materno"
                        name="apellido_materno"
                        type="text"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        placeholder="Apellido materno (opcional)"
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="correo@ejemplo.com"
                    />

                    <label htmlFor="password">Contrasena</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="********"
                    />

                    {error ? <p className="auth-error">{error}</p> : null}
                    {success ? <p className="auth-success">{success}</p> : null}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
                </p>
            </section>
        </div>
    );
}

export default Register;
```

---

## 20. Frontend: App.jsx

Crea el archivo `front/src/App.jsx` con todas las rutas del proyecto:

```jsx
// Punto de entrada del router de la aplicacion
// Define todas las rutas disponibles en el frontend
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './login';
import Register from './register';
import HistoriasApp from './HistoriasApp';
import RecursosApp from './RecursosApp';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas publicas de autenticacion */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />

                {/* Rutas protegidas del sistema (requieren token JWT valido) */}
                <Route path="/historias" element={<HistoriasApp />} />
                <Route path="/recursos" element={<RecursosApp />} />

                {/* Redireccion por defecto al login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

---

## 21. Frontend: HistoriasApp.jsx

CRUD completo de historias. Sigue exactamente el patron de ProductosApp.jsx.

Crea el archivo `front/src/HistoriasApp.jsx`:

```jsx
import { useState, useEffect } from 'react';
import {
    readHistorias,
    createHistoria,
    updateHistoria,
    deleteHistoria,
    readUsuarios,
    readNodos,
} from './services/api';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

export default function HistoriasApp() {
    const [historias, setHistorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [nodos, setNodos] = useState([]);

    // Estado inicial centralizado para limpiar facilmente el formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        publicada: false,
        id_creador: '',
        id_nodo_inicio: '',
    });

    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargandoTabla, setCargandoTabla] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [erroresBackend, setErroresBackend] = useState({});

    useEffect(() => {
        cargarHistorias();
        cargarUsuarios();
        cargarNodos();
    }, []);

    const cargarHistorias = async () => {
        setCargandoTabla(true);
        try {
            const respuesta = await readHistorias();
            setHistorias(respuesta.data);
        } catch (error) {
            console.error('Error al cargar historias:', error);
            toast.error('Error al obtener los datos del servidor');
        } finally {
            setCargandoTabla(false);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const respuesta = await readUsuarios();
            setUsuarios(respuesta.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const cargarNodos = async () => {
        try {
            const respuesta = await readNodos();
            setNodos(respuesta.data);
        } catch (error) {
            console.error('Error al cargar nodos:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Los checkboxes usan checked en lugar de value
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErroresBackend({});

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('FormData antes de enviar:', formData);

        // Construimos el objeto a enviar (JSON, no FormData, porque no hay archivos)
        const dataToSend = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            publicada: formData.publicada,
            id_creador: formData.id_creador || null,
            id_nodo_inicio: formData.id_nodo_inicio || null,
        };

        try {
            if (editandoId) {
                await updateHistoria(editandoId, dataToSend);
                toast.success('Historia actualizada correctamente');
            } else {
                await createHistoria(dataToSend);
                toast.success('Historia registrada exitosamente');
            }

            // Limpiamos el formulario despues de guardar
            setFormData({
                titulo: '',
                descripcion: '',
                publicada: false,
                id_creador: '',
                id_nodo_inicio: '',
            });
            setEditandoId(null);
            cargarHistorias();
        } catch (error) {
            console.error('Error al guardar:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            if (error.response && error.response.data) {
                setErroresBackend(error.response.data);
                toast.error('Por favor, corrige los errores en el formulario');
            } else {
                toast.error('Hubo un error de conexion con el servidor');
            }
        } finally {
            setCargandoGuardar(false);
        }
    };

    const prepararEdicion = (historia) => {
        setFormData({
            titulo: historia.titulo,
            descripcion: historia.descripcion,
            publicada: historia.publicada,
            id_creador: historia.id_creador || '',
            id_nodo_inicio: historia.id_nodo_inicio || '',
        });
        setEditandoId(historia.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        if (window.confirm('Seguro que deseas eliminar esta historia?')) {
            const toastId = toast.loading('Eliminando historia...');
            try {
                await deleteHistoria(id);
                toast.success('Historia eliminada', { id: toastId });
                cargarHistorias();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar la historia', { id: toastId });
            }
        }
    };

    // Filtro por titulo o estado de publicacion
    const historiasFiltradas = historias.filter(
        (historia) =>
            historia.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
            (historia.publicada ? 'publicada' : 'borrador').includes(filtro.toLowerCase())
    );

    const barraDeBusqueda = (
        <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
            <input
                type="text"
                className="form-control"
                placeholder="Buscar titulo o estado..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />
            {filtro && (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setFiltro('')}
                >
                    X
                </button>
            )}
        </div>
    );

    const SpinnerTabla = () => (
        <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando registros...</p>
        </div>
    );

    const columnas = [
        { name: 'ID', selector: (row) => row.id, sortable: true, width: '70px' },
        { name: 'Titulo', selector: (row) => row.titulo, sortable: true },
        {
            name: 'Estado',
            selector: (row) => row.publicada,
            sortable: true,
            cell: (row) =>
                row.publicada ? (
                    <span className="badge bg-success">Publicada</span>
                ) : (
                    <span className="badge bg-secondary">Borrador</span>
                ),
        },
        {
            name: 'Creador (ID)',
            selector: (row) => row.id_creador,
            sortable: true,
        },
        {
            name: 'Nodo inicio (ID)',
            selector: (row) => row.id_nodo_inicio || '—',
            sortable: true,
        },
        {
            name: 'Fecha creacion',
            selector: (row) => new Date(row.fecha_creacion).toLocaleDateString('es-MX'),
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => prepararEdicion(row)}
                        disabled={cargandoTabla}
                    >
                        Editar
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(row.id)}
                        disabled={cargandoTabla}
                    >
                        Eliminar
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '160px',
        },
    ];

    return (
        <div className="container mt-5">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="row">
                {/* Columna del formulario */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                {editandoId ? 'Editar Historia' : 'Nueva Historia'}
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                {/* Campo: titulo */}
                                <div className="mb-3">
                                    <label className="form-label">Titulo</label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        className={`form-control ${erroresBackend.titulo ? 'is-invalid' : ''}`}
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        required
                                        disabled={cargandoGuardar}
                                        placeholder="Titulo de la historia"
                                    />
                                    {erroresBackend.titulo && (
                                        <div className="invalid-feedback">
                                            {erroresBackend.titulo.join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Campo: descripcion */}
                                <div className="mb-3">
                                    <label className="form-label">Descripcion</label>
                                    <textarea
                                        name="descripcion"
                                        className={`form-control ${erroresBackend.descripcion ? 'is-invalid' : ''}`}
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        disabled={cargandoGuardar}
                                        placeholder="Sinopsis de la historia"
                                    />
                                    {erroresBackend.descripcion && (
                                        <div className="invalid-feedback">
                                            {erroresBackend.descripcion.join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Campo: id_creador */}
                                <div className="mb-3">
                                    <label className="form-label">Creador</label>
                                    <select
                                        name="id_creador"
                                        className={`form-select ${erroresBackend.id_creador ? 'is-invalid' : ''}`}
                                        value={formData.id_creador}
                                        onChange={handleChange}
                                        required
                                        disabled={cargandoGuardar}
                                    >
                                        <option value="">-- Selecciona un usuario --</option>
                                        {usuarios.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre} {u.apellido_paterno} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                    {erroresBackend.id_creador && (
                                        <div className="invalid-feedback">
                                            {erroresBackend.id_creador.join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Campo: id_nodo_inicio */}
                                <div className="mb-3">
                                    <label className="form-label">Nodo de inicio (opcional)</label>
                                    <select
                                        name="id_nodo_inicio"
                                        className={`form-select ${erroresBackend.id_nodo_inicio ? 'is-invalid' : ''}`}
                                        value={formData.id_nodo_inicio}
                                        onChange={handleChange}
                                        disabled={cargandoGuardar}
                                    >
                                        <option value="">-- Sin nodo de inicio --</option>
                                        {nodos.map((n) => (
                                            <option key={n.id} value={n.id}>
                                                {n.titulo_nodo} (ID: {n.id})
                                            </option>
                                        ))}
                                    </select>
                                    {erroresBackend.id_nodo_inicio && (
                                        <div className="invalid-feedback">
                                            {erroresBackend.id_nodo_inicio.join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Campo: publicada (checkbox) */}
                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        name="publicada"
                                        className="form-check-input"
                                        id="publicada"
                                        checked={formData.publicada}
                                        onChange={handleChange}
                                        disabled={cargandoGuardar}
                                    />
                                    <label className="form-check-label" htmlFor="publicada">
                                        Publicada
                                    </label>
                                </div>

                                {/* Botones de accion */}
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={cargandoGuardar}
                                    >
                                        {cargandoGuardar ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Guardando...
                                            </>
                                        ) : editandoId ? (
                                            'Actualizar'
                                        ) : (
                                            'Guardar'
                                        )}
                                    </button>
                                    {editandoId && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditandoId(null);
                                                setFormData({
                                                    titulo: '',
                                                    descripcion: '',
                                                    publicada: false,
                                                    id_creador: '',
                                                    id_nodo_inicio: '',
                                                });
                                                setErroresBackend({});
                                            }}
                                            disabled={cargandoGuardar}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Columna de la tabla */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-body p-0 pt-3">
                            <DataTable
                                title="Lista de Historias"
                                columns={columnas}
                                data={historiasFiltradas}
                                pagination
                                paginationPerPage={5}
                                highlightOnHover
                                responsive
                                subHeader
                                subHeaderComponent={barraDeBusqueda}
                                subHeaderAlign="right"
                                noDataComponent="No hay historias que coincidan con la busqueda"
                                progressPending={cargandoTabla}
                                progressComponent={<SpinnerTabla />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

---

## 22. Frontend: RecursosApp.jsx

CRUD completo para Imagenes y Audios con cambio de pestanas. Sigue el mismo patron que HistoriasApp.jsx pero con tabs para separar los dos modelos.

Crea el archivo `front/src/RecursosApp.jsx`:

```jsx
import { useState, useEffect } from 'react';
import {
    readImagenes,
    createImagen,
    updateImagen,
    deleteImagen,
    readAudios,
    createAudio,
    updateAudio,
    deleteAudio,
} from './services/api';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

// -----------------------------------------------------------
// Subcomponente: CRUD de Imagenes
// -----------------------------------------------------------
function ImagenesPanel() {
    const [imagenes, setImagenes] = useState([]);

    // Estado inicial centralizado para el formulario de imagen
    const [formData, setFormData] = useState({
        tipo: 'escenario',
        descripcion: '',
        url: null,
        imagen_para_binario: null,
    });

    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargandoTabla, setCargandoTabla] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [erroresBackend, setErroresBackend] = useState({});

    useEffect(() => {
        cargarImagenes();
    }, []);

    const cargarImagenes = async () => {
        setCargandoTabla(true);
        try {
            const respuesta = await readImagenes();
            setImagenes(respuesta.data);
        } catch (error) {
            console.error('Error al cargar imagenes:', error);
            toast.error('Error al obtener las imagenes del servidor');
        } finally {
            setCargandoTabla(false);
        }
    };

    const handleChange = (e) => {
        // Si es un input de tipo file guardamos el objeto File
        if (e.target.type === 'file') {
            setFormData({
                ...formData,
                [e.target.name]: e.target.files[0],
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErroresBackend({});

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('FormData antes de enviar:', formData);

        // Construimos el FormData para enviar archivos
        const dataToSend = new FormData();
        dataToSend.append('tipo', formData.tipo);
        dataToSend.append('descripcion', formData.descripcion);

        if (formData.url instanceof File) {
            dataToSend.append('url', formData.url);
        }
        if (formData.imagen_para_binario instanceof File) {
            dataToSend.append('imagen_para_binario', formData.imagen_para_binario);
        }

        // Log de lo que se enviara
        for (let pair of dataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            if (editandoId) {
                await updateImagen(editandoId, dataToSend);
                toast.success('Imagen actualizada correctamente');
            } else {
                await createImagen(dataToSend);
                toast.success('Imagen registrada exitosamente');
            }

            // Limpiamos el formulario
            setFormData({
                tipo: 'escenario',
                descripcion: '',
                url: null,
                imagen_para_binario: null,
            });
            setEditandoId(null);
            cargarImagenes();
        } catch (error) {
            console.error('Error al guardar:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            if (error.response && error.response.data) {
                setErroresBackend(error.response.data);
                toast.error('Por favor, corrige los errores en el formulario');
            } else {
                toast.error('Hubo un error de conexion con el servidor');
            }
        } finally {
            setCargandoGuardar(false);
        }
    };

    const prepararEdicion = (imagen) => {
        setFormData({
            tipo: imagen.tipo,
            descripcion: imagen.descripcion,
            url: null,
            imagen_para_binario: null,
        });
        setEditandoId(imagen.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        if (window.confirm('Seguro que deseas eliminar esta imagen?')) {
            const toastId = toast.loading('Eliminando imagen...');
            try {
                await deleteImagen(id);
                toast.success('Imagen eliminada', { id: toastId });
                cargarImagenes();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar la imagen', { id: toastId });
            }
        }
    };

    // Filtro por tipo o descripcion
    const imagenesFiltradas = imagenes.filter(
        (img) =>
            img.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
            (img.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    const barraDeBusqueda = (
        <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
            <input
                type="text"
                className="form-control"
                placeholder="Buscar tipo o descripcion..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />
            {filtro && (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setFiltro('')}
                >
                    X
                </button>
            )}
        </div>
    );

    const SpinnerTabla = () => (
        <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando registros...</p>
        </div>
    );

    const columnas = [
        { name: 'ID', selector: (row) => row.id, sortable: true, width: '70px' },
        { name: 'Tipo', selector: (row) => row.tipo, sortable: true },
        { name: 'Descripcion', selector: (row) => row.descripcion || '—', sortable: true },
        {
            name: 'Imagen (Backend)',
            cell: (row) =>
                row.url ? (
                    <img
                        src={row.url.startsWith('http') ? row.url : `http://localhost:8000${row.url}`}
                        alt={row.descripcion}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                ) : (
                    <span className="text-muted">Sin imagen</span>
                ),
        },
        {
            name: 'Imagen Binaria',
            cell: (row) =>
                row.imagen_base64_display ? (
                    <img
                        src={`data:image/jpeg;base64,${row.imagen_base64_display}`}
                        alt={row.descripcion}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                ) : (
                    <span className="text-muted">Sin imagen</span>
                ),
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => prepararEdicion(row)}
                        disabled={cargandoTabla}
                    >
                        Editar
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(row.id)}
                        disabled={cargandoTabla}
                    >
                        Eliminar
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '160px',
        },
    ];

    return (
        <div className="row">
            {/* Formulario */}
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                            {editandoId ? 'Editar Imagen' : 'Nueva Imagen'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* Campo: tipo */}
                            <div className="mb-3">
                                <label className="form-label">Tipo</label>
                                <select
                                    name="tipo"
                                    className={`form-select ${erroresBackend.tipo ? 'is-invalid' : ''}`}
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                    disabled={cargandoGuardar}
                                >
                                    <option value="escenario">Escenario</option>
                                    <option value="personaje">Personaje</option>
                                    <option value="portada">Portada</option>
                                </select>
                                {erroresBackend.tipo && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.tipo.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Campo: descripcion */}
                            <div className="mb-3">
                                <label className="form-label">Descripcion</label>
                                <input
                                    type="text"
                                    name="descripcion"
                                    className={`form-control ${erroresBackend.descripcion ? 'is-invalid' : ''}`}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    disabled={cargandoGuardar}
                                    placeholder="Descripcion de la imagen"
                                />
                                {erroresBackend.descripcion && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.descripcion.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Campo: url (imagen en servidor) */}
                            <div className="mb-3">
                                <label className="form-label">Imagen (Backend)</label>
                                <input
                                    type="file"
                                    name="url"
                                    className={`form-control ${erroresBackend.url ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    accept="image/*"
                                    disabled={cargandoGuardar}
                                />
                                {erroresBackend.url && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.url.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Campo: imagen_para_binario (imagen en BD) */}
                            <div className="mb-3">
                                <label className="form-label">Imagen Binaria (Base de Datos)</label>
                                <input
                                    type="file"
                                    name="imagen_para_binario"
                                    className={`form-control ${erroresBackend.imagen_para_binario ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    accept="image/*"
                                    disabled={cargandoGuardar}
                                />
                                {erroresBackend.imagen_para_binario && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.imagen_para_binario.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={cargandoGuardar}
                                >
                                    {cargandoGuardar ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Guardando...
                                        </>
                                    ) : editandoId ? (
                                        'Actualizar'
                                    ) : (
                                        'Guardar'
                                    )}
                                </button>
                                {editandoId && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setEditandoId(null);
                                            setFormData({
                                                tipo: 'escenario',
                                                descripcion: '',
                                                url: null,
                                                imagen_para_binario: null,
                                            });
                                            setErroresBackend({});
                                        }}
                                        disabled={cargandoGuardar}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body p-0 pt-3">
                        <DataTable
                            title="Lista de Imagenes"
                            columns={columnas}
                            data={imagenesFiltradas}
                            pagination
                            paginationPerPage={5}
                            highlightOnHover
                            responsive
                            subHeader
                            subHeaderComponent={barraDeBusqueda}
                            subHeaderAlign="right"
                            noDataComponent="No hay imagenes que coincidan con la busqueda"
                            progressPending={cargandoTabla}
                            progressComponent={<SpinnerTabla />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// Subcomponente: CRUD de Audios
// -----------------------------------------------------------
function AudiosPanel() {
    const [audios, setAudios] = useState([]);

    // Estado inicial centralizado para el formulario de audio
    const [formData, setFormData] = useState({
        descripcion: '',
        archivo: null,
    });

    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargandoTabla, setCargandoTabla] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [erroresBackend, setErroresBackend] = useState({});

    useEffect(() => {
        cargarAudios();
    }, []);

    const cargarAudios = async () => {
        setCargandoTabla(true);
        try {
            const respuesta = await readAudios();
            setAudios(respuesta.data);
        } catch (error) {
            console.error('Error al cargar audios:', error);
            toast.error('Error al obtener los audios del servidor');
        } finally {
            setCargandoTabla(false);
        }
    };

    const handleChange = (e) => {
        // Si es un input de tipo file guardamos el objeto File
        if (e.target.type === 'file') {
            setFormData({
                ...formData,
                [e.target.name]: e.target.files[0],
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErroresBackend({});

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('FormData antes de enviar:', formData);

        // Construimos el FormData para enviar el archivo de audio
        const dataToSend = new FormData();
        dataToSend.append('descripcion', formData.descripcion);

        if (formData.archivo instanceof File) {
            dataToSend.append('archivo', formData.archivo);
        }

        // Log de lo que se enviara
        for (let pair of dataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            if (editandoId) {
                await updateAudio(editandoId, dataToSend);
                toast.success('Audio actualizado correctamente');
            } else {
                await createAudio(dataToSend);
                toast.success('Audio registrado exitosamente');
            }

            // Limpiamos el formulario
            setFormData({ descripcion: '', archivo: null });
            setEditandoId(null);
            cargarAudios();
        } catch (error) {
            console.error('Error al guardar:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            if (error.response && error.response.data) {
                setErroresBackend(error.response.data);
                toast.error('Por favor, corrige los errores en el formulario');
            } else {
                toast.error('Hubo un error de conexion con el servidor');
            }
        } finally {
            setCargandoGuardar(false);
        }
    };

    const prepararEdicion = (audio) => {
        setFormData({
            descripcion: audio.descripcion,
            archivo: null,
        });
        setEditandoId(audio.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEliminar = async (id) => {
        if (window.confirm('Seguro que deseas eliminar este audio?')) {
            const toastId = toast.loading('Eliminando audio...');
            try {
                await deleteAudio(id);
                toast.success('Audio eliminado', { id: toastId });
                cargarAudios();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar el audio', { id: toastId });
            }
        }
    };

    // Filtro por descripcion
    const audiosFiltrados = audios.filter((audio) =>
        (audio.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    const barraDeBusqueda = (
        <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
            <input
                type="text"
                className="form-control"
                placeholder="Buscar descripcion..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />
            {filtro && (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setFiltro('')}
                >
                    X
                </button>
            )}
        </div>
    );

    const SpinnerTabla = () => (
        <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando registros...</p>
        </div>
    );

    const columnas = [
        { name: 'ID', selector: (row) => row.id, sortable: true, width: '70px' },
        { name: 'Descripcion', selector: (row) => row.descripcion || '—', sortable: true },
        {
            name: 'Archivo',
            cell: (row) =>
                row.archivo ? (
                    <audio controls style={{ height: '30px' }}>
                        <source
                            src={row.archivo.startsWith('http') ? row.archivo : `http://localhost:8000${row.archivo}`}
                        />
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                ) : (
                    <span className="text-muted">Sin archivo</span>
                ),
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => prepararEdicion(row)}
                        disabled={cargandoTabla}
                    >
                        Editar
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(row.id)}
                        disabled={cargandoTabla}
                    >
                        Eliminar
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '160px',
        },
    ];

    return (
        <div className="row">
            {/* Formulario */}
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">
                            {editandoId ? 'Editar Audio' : 'Nuevo Audio'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            {/* Campo: descripcion */}
                            <div className="mb-3">
                                <label className="form-label">Descripcion</label>
                                <input
                                    type="text"
                                    name="descripcion"
                                    className={`form-control ${erroresBackend.descripcion ? 'is-invalid' : ''}`}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    disabled={cargandoGuardar}
                                    placeholder="Nombre o descripcion del audio"
                                />
                                {erroresBackend.descripcion && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.descripcion.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Campo: archivo de audio */}
                            <div className="mb-3">
                                <label className="form-label">Archivo de audio</label>
                                <input
                                    type="file"
                                    name="archivo"
                                    className={`form-control ${erroresBackend.archivo ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    accept="audio/*"
                                    disabled={cargandoGuardar}
                                />
                                {erroresBackend.archivo && (
                                    <div className="invalid-feedback">
                                        {erroresBackend.archivo.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={cargandoGuardar}
                                >
                                    {cargandoGuardar ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Guardando...
                                        </>
                                    ) : editandoId ? (
                                        'Actualizar'
                                    ) : (
                                        'Guardar'
                                    )}
                                </button>
                                {editandoId && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setEditandoId(null);
                                            setFormData({ descripcion: '', archivo: null });
                                            setErroresBackend({});
                                        }}
                                        disabled={cargandoGuardar}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body p-0 pt-3">
                        <DataTable
                            title="Lista de Audios"
                            columns={columnas}
                            data={audiosFiltrados}
                            pagination
                            paginationPerPage={5}
                            highlightOnHover
                            responsive
                            subHeader
                            subHeaderComponent={barraDeBusqueda}
                            subHeaderAlign="right"
                            noDataComponent="No hay audios que coincidan con la busqueda"
                            progressPending={cargandoTabla}
                            progressComponent={<SpinnerTabla />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// Componente principal con tabs para cambiar entre Imagenes y Audios
// -----------------------------------------------------------
export default function RecursosApp() {
    // Tab activo: 'imagenes' o 'audios'
    const [tabActivo, setTabActivo] = useState('imagenes');

    return (
        <div className="container mt-5">
            <Toaster position="top-right" reverseOrder={false} />

            <h2 className="mb-4">Gestion de Recursos Multimedia</h2>

            {/* Tabs de navegacion */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActivo === 'imagenes' ? 'active' : ''}`}
                        onClick={() => setTabActivo('imagenes')}
                    >
                        Imagenes
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${tabActivo === 'audios' ? 'active' : ''}`}
                        onClick={() => setTabActivo('audios')}
                    >
                        Audios
                    </button>
                </li>
            </ul>

            {/* Panel activo segun el tab seleccionado */}
            {tabActivo === 'imagenes' ? <ImagenesPanel /> : <AudiosPanel />}
        </div>
    );
}
```

---

## 23. Levantar el proyecto

### Backend Django

Abre una terminal en la raiz del proyecto (donde esta `manage.py`) y ejecuta:

```bash
# Verificar que no hay errores de configuracion
python manage.py check

# Aplicar migraciones (si aun no lo hiciste)
python manage.py migrate

# Levantar el servidor de desarrollo
python manage.py runserver
```

El backend estara disponible en [http://localhost:8000](http://localhost:8000)

Endpoints disponibles:
- `POST /api/login/` — Obtener tokens JWT
- `POST /api/token/refresh/` — Refrescar access token
- `POST /api/registro/` — Registro de usuario
- `GET/POST /api/historias/` — CRUD de historias
- `GET/POST /api/nodos/` — CRUD de nodos
- `GET/POST /api/opciones/` — CRUD de opciones
- `GET/POST /api/personajes/` — CRUD de personajes
- `GET/POST /api/nodo-personajes/` — CRUD de tabla pivote
- `GET/POST /api/imagenes/` — CRUD de imagenes
- `GET/POST /api/audios/` — CRUD de audios
- `GET/POST /api/progresos/` — CRUD de progresos (filtrado por usuario)
- `GET/POST /api/roles/` — CRUD de roles
- `GET/POST /api/usuarios/` — CRUD de usuarios

### Frontend React

Abre una segunda terminal en la carpeta `front/` y ejecuta:

```bash
# Instalar dependencias (si aun no lo hiciste)
npm install

# Levantar el servidor de desarrollo
npm run dev
```

El frontend estara disponible en [http://localhost:5173](http://localhost:5173)

### Flujo de uso basico

1. Abre [http://localhost:5173/registro](http://localhost:5173/registro) para crear un usuario.
2. Inicia sesion en [http://localhost:5173/login](http://localhost:5173/login).
3. Seras redirigido a `/historias` donde puedes crear y gestionar historias.
4. Navega a `/recursos` para subir imagenes y audios.

### Consejos de desarrollo

- Si modificas modelos Python, recuerda ejecutar `python manage.py makemigrations` y `python manage.py migrate`.
- Si el token expira (5 minutos), el interceptor de axios lo renovara automaticamente usando el refresh token.
- Si el refresh token tambien expira (1 dia), el usuario sera redirigido al login automaticamente.
- Puedes acceder al admin de Django en [http://localhost:8000/admin/](http://localhost:8000/admin/) con el superusuario que creaste.
- Para ver todos los endpoints disponibles en modo DEBUG, abre [http://localhost:8000/api/](http://localhost:8000/api/).

---

*Guia generada el 1 de abril de 2026 para el proyecto Novelas Visuales.*
*Stack: Django 4.2 + DRF + SimpleJWT + MySQL + React 19 + Vite 7 + Bootstrap 5*
