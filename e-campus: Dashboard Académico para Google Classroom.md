# e-campus: Dashboard Académico para Google Classroom

**e-campus** es una aplicación web moderna que integra con Google Classroom para proporcionar dashboards intuitivos y reportes avanzados del progreso académico. Diseñada específicamente para Semillero Digital, centraliza toda la información de cursos, estudiantes y entregas en una interfaz elegante y funcional.

## 🚀 Características Principales

### ✨ Dashboard Inteligente
- **Visualización en tiempo real** del progreso de estudiantes
- **Estadísticas detalladas** de entregas y completitud
- **Gráficos interactivos** con tendencias y análisis
- **Filtros avanzados** por cohorte, curso, profesor y estado

### 🔐 Autenticación Segura
- **OAuth 2.0 con Google** para inicio de sesión sin contraseñas
- **Sincronización automática** con Google Classroom
- **Gestión de roles** (estudiante, profesor, coordinador)

### 📊 Reportes y Analíticas
- **Exportación de datos** en múltiples formatos
- **Métricas de rendimiento** por curso y estudiante
- **Alertas de entregas tardías** y pendientes
- **Tendencias semanales** de progreso

### 🎨 Interfaz Moderna
- **Diseño responsive** que funciona en todos los dispositivos
- **Componentes interactivos** con animaciones suaves
- **Tema claro/oscuro** adaptable
- **Navegación intuitiva** con tabs y filtros

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18** con hooks modernos
- **Tailwind CSS** para estilos responsivos
- **shadcn/ui** para componentes de alta calidad
- **Recharts** para visualizaciones de datos
- **Axios** para comunicación con API

### Backend
- **Django 4.2** con Django REST Framework
- **PostgreSQL** como base de datos principal
- **Google APIs** para integración con Classroom
- **OAuth 2.0** para autenticación segura

### Despliegue
- **Docker & Docker Compose** para desarrollo local
- **Configuración lista para producción**
- **Variables de entorno** para configuración segura

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.11+**
- **Node.js 18+** y **pnpm**
- **Docker** y **Docker Compose** (opcional, recomendado)
- **Git** para control de versiones

## ⚙️ Configuración de Google Cloud

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "e-campus-app"

### 2. Habilitar APIs Necesarias

En el menú de navegación, ve a `APIs y servicios > Biblioteca` y habilita:

- **Google Classroom API**
- **Google People API**

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a `APIs y servicios > Pantalla de consentimiento de OAuth`
2. Selecciona **"Externo"** y haz clic en "Crear"
3. Completa la información:
   - **Nombre de la aplicación:** `e-campus`
   - **Correo electrónico de asistencia:** Tu correo
   - **Dominios autorizados:** `localhost` (para desarrollo)
   - **Información de contacto:** Tu correo
4. En "Usuarios de prueba", añade tu correo de Google

### 4. Crear Credenciales OAuth

1. Ve a `APIs y servicios > Credenciales`
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**
3. Configura:
   - **Tipo de aplicación:** `Aplicación web`
   - **Nombre:** `Cliente Web de e-campus`
   - **URI de redireccionamiento:** `http://localhost:8000/api/auth/google/callback/`
4. **¡IMPORTANTE!** Guarda el **ID de cliente** y **Secreto de cliente**

## 🛠️ Instalación y Configuración

### Opción 1: Instalación con Docker (Recomendada)

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd e-campus

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Google

# 3. Construir y ejecutar con Docker
docker-compose up --build

# 4. En otra terminal, ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 5. Crear superusuario (opcional)
docker-compose exec backend python manage.py createsuperuser
```

### Opción 2: Instalación Manual

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd e-campus

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 3. Configurar Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

# 4. En otra terminal, configurar Frontend
cd frontend
pnpm install
pnpm run dev
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales:

```env
# Django
SECRET_KEY=tu-clave-secreta-django-aqui
DEBUG=1

# PostgreSQL (si usas Docker)
SQL_DATABASE=ecampus_db
SQL_USER=ecampus_user
SQL_PASSWORD=ecampus_password
SQL_HOST=db
SQL_PORT=5432

# Google OAuth2 - REEMPLAZA CON TUS VALORES
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/
```

## 🚀 Uso de la Aplicación

### 1. Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin

### 2. Primer Inicio de Sesión

1. Ve a http://localhost:3000
2. Haz clic en "Iniciar Sesión con Google"
3. Autoriza los permisos de Google Classroom
4. Serás redirigido al dashboard

### 3. Sincronizar Datos

1. En el dashboard, haz clic en "Sincronizar"
2. La aplicación obtendrá automáticamente:
   - Cursos de Google Classroom
   - Lista de estudiantes y profesores
   - Tareas y entregas
   - Estados de progreso

### 4. Explorar Funcionalidades

- **Filtros:** Usa los filtros para segmentar datos por cohorte, curso o estado
- **Gráficos:** Explora las visualizaciones en la pestaña "Analíticas"
- **Exportar:** Descarga reportes en formato JSON
- **Roles:** La interfaz se adapta según tu rol (estudiante/profesor/coordinador)

## 📁 Estructura del Proyecto

```
e-campus/
├── backend/                 # Aplicación Django
│   ├── ecampus_project/    # Configuración principal
│   ├── core/               # Aplicación principal
│   │   ├── models.py       # Modelos de datos
│   │   ├── views.py        # Lógica de API
│   │   ├── serializers.py  # Serialización de datos
│   │   └── urls.py         # Rutas de API
│   ├── requirements.txt    # Dependencias Python
│   └── Dockerfile         # Configuración Docker
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Login.jsx   # Página de inicio de sesión
│   │   │   ├── Dashboard.jsx # Dashboard principal
│   │   │   ├── Filters.jsx # Componente de filtros
│   │   │   └── Charts.jsx  # Gráficos y visualizaciones
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Punto de entrada
│   ├── package.json        # Dependencias Node.js
│   └── Dockerfile         # Configuración Docker
├── docker-compose.yml      # Orquestación de servicios
├── .env.example           # Plantilla de variables de entorno
├── .gitignore            # Archivos ignorados por Git
└── README.md             # Este archivo
```

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Reiniciar servicios
docker-compose restart

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Acceder al shell de Django
docker-compose exec backend python manage.py shell

# Instalar nuevas dependencias en frontend
docker-compose exec frontend pnpm add <paquete>
```

### Producción

```bash
# Construir para producción
docker-compose -f docker-compose.prod.yml up --build

# Recopilar archivos estáticos
docker-compose exec backend python manage.py collectstatic

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser
```

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con el servidor"

**Causa:** El backend no está ejecutándose o hay problemas de CORS.

**Solución:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/api/auth/google/login/

# Reiniciar servicios
docker-compose restart backend
```

### Error: "Error configurando OAuth"

**Causa:** Las credenciales de Google no están configuradas correctamente.

**Solución:**
1. Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén en `.env`
2. Confirma que el URI de redirección en Google Cloud sea exacto
3. Asegúrate de que las APIs estén habilitadas

### Error: "No hay credenciales disponibles"

**Causa:** La sesión expiró o no se completó el flujo OAuth.

**Solución:**
1. Cierra el navegador y vuelve a iniciar sesión
2. Verifica que las cookies estén habilitadas
3. Limpia el caché del navegador

### Base de datos no conecta

**Causa:** PostgreSQL no está ejecutándose o la configuración es incorrecta.

**Solución:**
```bash
# Verificar estado de la base de datos
docker-compose ps db

# Reiniciar base de datos
docker-compose restart db

# Ver logs de la base de datos
docker-compose logs db
```

## 🚀 Despliegue en Producción

### Variables de Entorno para Producción

```env
# Django
SECRET_KEY=clave-super-secreta-para-produccion
DEBUG=0
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com

# Base de datos (usar PostgreSQL en producción)
SQL_DATABASE=ecampus_prod
SQL_USER=ecampus_prod_user
SQL_PASSWORD=password-super-seguro
SQL_HOST=tu-servidor-db.com
SQL_PORT=5432

# Google OAuth2
GOOGLE_CLIENT_ID=tu-client-id-produccion.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-produccion
GOOGLE_REDIRECT_URI=https://tu-dominio.com/api/auth/google/callback/
```

### Consideraciones de Seguridad

1. **Nunca** subas el archivo `.env` a Git
2. Usa **HTTPS** en producción
3. Configura **CORS** apropiadamente
4. Usa una **base de datos externa** (no SQLite)
5. Configura **backups automáticos**

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Estándares de Código

- **Python:** Sigue PEP 8
- **JavaScript:** Usa ESLint y Prettier
- **Commits:** Usa mensajes descriptivos en español
- **Documentación:** Actualiza README si es necesario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. **Revisa** la sección de solución de problemas
2. **Busca** en los issues existentes
3. **Crea** un nuevo issue con detalles específicos
4. **Incluye** logs y capturas de pantalla si es posible

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] **Notificaciones push** para entregas tardías
- [ ] **Integración con Google Calendar** para fechas de entrega
- [ ] **Reportes PDF** automatizados
- [ ] **Dashboard para móviles** con app nativa
- [ ] **Integración con Slack/Discord** para notificaciones
- [ ] **Sistema de badges** y gamificación
- [ ] **Análisis predictivo** con machine learning

### Mejoras Técnicas

- [ ] **Tests automatizados** (frontend y backend)
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Monitoreo** con Sentry
- [ ] **Cache** con Redis
- [ ] **API GraphQL** como alternativa a REST

---

**Desarrollado con ❤️ para Semillero Digital**

*¿Tienes ideas para mejorar e-campus? ¡Nos encantaría escucharlas!*
