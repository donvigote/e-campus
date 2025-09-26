#!/bin/bash

# Script de despliegue para e-campus
# Uso: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}

echo "🚀 Iniciando despliegue de e-campus en modo: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar archivo de variables de entorno
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE=".env.prod"
else
    ENV_FILE=".env"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_error "Archivo $ENV_FILE no encontrado."
    print_warning "Copia $ENV_FILE.example a $ENV_FILE y configura las variables necesarias."
    exit 1
fi

# Verificar variables críticas
print_status "Verificando configuración..."

if [ "$ENVIRONMENT" = "production" ]; then
    REQUIRED_VARS=("GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "SECRET_KEY" "SQL_PASSWORD")
else
    REQUIRED_VARS=("GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")
fi

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE" || grep -q "^$var=$" "$ENV_FILE" || grep -q "^$var=TU_" "$ENV_FILE"; then
        print_error "Variable $var no está configurada en $ENV_FILE"
        exit 1
    fi
done

print_success "Configuración verificada"

# Función para despliegue en desarrollo
deploy_development() {
    print_status "Desplegando en modo desarrollo..."
    
    # Detener contenedores existentes
    print_status "Deteniendo contenedores existentes..."
    docker-compose down
    
    # Construir y ejecutar
    print_status "Construyendo y ejecutando contenedores..."
    docker-compose up --build -d
    
    # Esperar a que la base de datos esté lista
    print_status "Esperando a que la base de datos esté lista..."
    sleep 10
    
    # Ejecutar migraciones
    print_status "Ejecutando migraciones..."
    docker-compose exec -T backend python manage.py migrate
    
    # Crear superusuario si no existe
    print_status "Verificando superusuario..."
    docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Superusuario ya existe')
"
    
    print_success "Despliegue en desarrollo completado"
    print_status "Aplicación disponible en:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend API: http://localhost:8000"
    print_status "  Admin Django: http://localhost:8000/admin"
}

# Función para despliegue en producción
deploy_production() {
    print_status "Desplegando en modo producción..."
    
    # Verificar archivos adicionales para producción
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "Archivo docker-compose.prod.yml no encontrado"
        exit 1
    fi
    
    # Backup de base de datos si existe
    if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
        print_status "Creando backup de base de datos..."
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $SQL_USER $SQL_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
        print_success "Backup creado"
    fi
    
    # Detener contenedores existentes
    print_status "Deteniendo contenedores existentes..."
    docker-compose -f docker-compose.prod.yml down
    
    # Construir imágenes
    print_status "Construyendo imágenes de producción..."
    docker-compose -f docker-compose.prod.yml build
    
    # Ejecutar contenedores
    print_status "Ejecutando contenedores de producción..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 20
    
    # Ejecutar migraciones
    print_status "Ejecutando migraciones..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
    
    # Recopilar archivos estáticos
    print_status "Recopilando archivos estáticos..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
    
    print_success "Despliegue en producción completado"
    print_status "Aplicación disponible en el dominio configurado"
}

# Función para mostrar logs
show_logs() {
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Función para mostrar estado
show_status() {
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# Ejecutar despliegue según el entorno
case $ENVIRONMENT in
    "development")
        deploy_development
        ;;
    "production")
        deploy_production
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    *)
        print_error "Entorno no válido: $ENVIRONMENT"
        print_status "Uso: $0 [development|production|logs|status]"
        exit 1
        ;;
esac

print_success "¡Despliegue completado exitosamente! 🎉"

# Mostrar estado final
print_status "Estado de los contenedores:"
show_status
