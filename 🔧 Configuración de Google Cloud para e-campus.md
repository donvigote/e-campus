# 🔧 Configuración de Google Cloud para e-campus

Esta guía te llevará paso a paso para configurar Google Cloud Console y obtener las credenciales necesarias para que e-campus funcione correctamente.

## 📋 Prerrequisitos

- Una cuenta de Google (Gmail)
- Acceso a Google Classroom (como profesor o administrador)
- Navegador web actualizado

## 🚀 Paso 1: Crear Proyecto en Google Cloud

### 1.1 Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, acepta los términos de servicio

### 1.2 Crear Nuevo Proyecto

1. En la parte superior, haz clic en el selector de proyectos
2. Haz clic en **"Proyecto nuevo"**
3. Configura el proyecto:
   - **Nombre del proyecto:** `e-campus-semillero`
   - **ID del proyecto:** Se genera automáticamente (puedes cambiarlo)
   - **Organización:** Deja en blanco si no tienes una
4. Haz clic en **"Crear"**

![Crear Proyecto](https://via.placeholder.com/600x300?text=Crear+Proyecto+en+Google+Cloud)

## 🔌 Paso 2: Habilitar APIs Necesarias

### 2.1 Acceder a la Biblioteca de APIs

1. En el menú de navegación (☰), ve a **"APIs y servicios"** → **"Biblioteca"**
2. O usa este enlace directo: [API Library](https://console.cloud.google.com/apis/library)

### 2.2 Habilitar Google Classroom API

1. En la barra de búsqueda, escribe: `Google Classroom API`
2. Haz clic en **"Google Classroom API"**
3. Haz clic en **"HABILITAR"**
4. Espera a que se habilite (puede tomar unos segundos)

### 2.3 Habilitar Google People API

1. Busca: `Google People API`
2. Haz clic en **"Google People API"**
3. Haz clic en **"HABILITAR"**

### ✅ Verificación

Deberías ver ambas APIs en **"APIs y servicios"** → **"APIs y servicios habilitados"**

## 🔐 Paso 3: Configurar Pantalla de Consentimiento OAuth

### 3.1 Acceder a la Configuración OAuth

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. O usa este enlace: [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

### 3.2 Configurar Tipo de Usuario

1. Selecciona **"Externo"** (a menos que tengas Google Workspace)
2. Haz clic en **"CREAR"**

### 3.3 Información de la Aplicación

Completa los campos obligatorios:

```
Nombre de la aplicación: e-campus
Correo electrónico de asistencia del usuario: tu-email@gmail.com
Logotipo de la aplicación: (opcional)
Dominios de aplicación:
  - Página principal de la aplicación: http://localhost:3000
  - Política de privacidad: http://localhost:3000/privacy (opcional)
  - Condiciones del servicio: http://localhost:3000/terms (opcional)
Dominios autorizados: localhost
Información de contacto del desarrollador: tu-email@gmail.com
```

3. Haz clic en **"GUARDAR Y CONTINUAR"**

### 3.4 Permisos (Scopes)

1. En la sección "Permisos", haz clic en **"AÑADIR O QUITAR PERMISOS"**
2. Busca y añade estos permisos:
   - `../auth/classroom.courses.readonly`
   - `../auth/classroom.rosters.readonly`
   - `../auth/classroom.coursework.students.readonly`
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
3. Haz clic en **"ACTUALIZAR"**
4. Haz clic en **"GUARDAR Y CONTINUAR"**

### 3.5 Usuarios de Prueba

1. En "Usuarios de prueba", haz clic en **"+ AÑADIR USUARIOS"**
2. Añade tu email y el de otros usuarios que probarán la aplicación
3. Haz clic en **"AÑADIR"**
4. Haz clic en **"GUARDAR Y CONTINUAR"**

### 3.6 Resumen

Revisa la configuración y haz clic en **"VOLVER AL PANEL"**

## 🔑 Paso 4: Crear Credenciales OAuth

### 4.1 Crear ID de Cliente OAuth

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**

### 4.2 Configurar el Cliente Web

1. **Tipo de aplicación:** Selecciona **"Aplicación web"**
2. **Nombre:** `e-campus Web Client`
3. **URI de JavaScript autorizados:** (déjalo vacío por ahora)
4. **URI de redireccionamiento autorizados:**
   - Para desarrollo: `http://localhost:8000/api/auth/google/callback/`
   - Para producción: `https://tu-dominio.com/api/auth/google/callback/`

### 4.3 Obtener Credenciales

1. Haz clic en **"CREAR"**
2. Aparecerá una ventana con tus credenciales:
   - **ID de cliente:** `123456789-abcdefg.apps.googleusercontent.com`
   - **Secreto de cliente:** `GOCSPX-abcdefghijklmnop`
3. **¡IMPORTANTE!** Copia y guarda estas credenciales de forma segura
4. Haz clic en **"ACEPTAR"**

## 📝 Paso 5: Configurar e-campus

### 5.1 Actualizar Variables de Entorno

Edita el archivo `.env` en tu proyecto e-campus:

```env
# Google OAuth2 - REEMPLAZA CON TUS VALORES REALES
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/
```

### 5.2 Para Producción

Si vas a desplegar en producción, actualiza también:

```env
# Producción
GOOGLE_REDIRECT_URI=https://tu-dominio.com/api/auth/google/callback/
```

Y añade el URI de producción en Google Cloud Console.

## 🧪 Paso 6: Probar la Configuración

### 6.1 Ejecutar e-campus

```bash
cd e-campus
./deploy.sh development
```

### 6.2 Probar Autenticación

1. Ve a http://localhost:3000
2. Haz clic en **"Iniciar Sesión con Google"**
3. Deberías ser redirigido a Google
4. Autoriza los permisos
5. Deberías volver al dashboard de e-campus

### 6.3 Verificar Sincronización

1. En el dashboard, haz clic en **"Sincronizar"**
2. Deberías ver tus cursos de Google Classroom
3. Los datos de estudiantes y tareas deberían aparecer

## 🚨 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** El URI de redirección no coincide con el configurado en Google Cloud.

**Solución:**
1. Verifica que el URI en `.env` sea exactamente: `http://localhost:8000/api/auth/google/callback/`
2. Verifica que el URI en Google Cloud Console sea el mismo
3. Asegúrate de que no haya espacios extra o caracteres especiales

### Error: "access_denied"

**Causa:** El usuario no está en la lista de usuarios de prueba.

**Solución:**
1. Ve a la pantalla de consentimiento OAuth en Google Cloud
2. Añade el email del usuario a "Usuarios de prueba"
3. O publica la aplicación (no recomendado para desarrollo)

### Error: "invalid_client"

**Causa:** Las credenciales OAuth son incorrectas.

**Solución:**
1. Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
2. Regenera las credenciales si es necesario
3. Asegúrate de que no haya espacios extra en el archivo `.env`

### Error: "insufficient_permissions"

**Causa:** Faltan permisos en la configuración OAuth.

**Solución:**
1. Ve a la pantalla de consentimiento OAuth
2. Verifica que todos los scopes necesarios estén añadidos
3. Revoca el acceso en tu cuenta Google y vuelve a autorizar

## 🔒 Consideraciones de Seguridad

### Para Desarrollo

- ✅ Usa `http://localhost` para pruebas locales
- ✅ Mantén las credenciales en `.env` (no en Git)
- ✅ Usa usuarios de prueba limitados

### Para Producción

- ✅ Usa **HTTPS** obligatoriamente
- ✅ Configura dominios específicos
- ✅ Publica la aplicación OAuth después de las pruebas
- ✅ Usa variables de entorno seguras en el servidor
- ✅ Configura CORS apropiadamente

## 📚 Recursos Adicionales

- [Documentación de Google Classroom API](https://developers.google.com/classroom)
- [Guía de OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)
- [Consola de APIs de Google](https://console.developers.google.com/)

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con la configuración:

1. **Revisa** cada paso cuidadosamente
2. **Verifica** que las APIs estén habilitadas
3. **Comprueba** que las credenciales sean correctas
4. **Consulta** los logs de e-campus para errores específicos

---

**¡Listo!** 🎉 Ahora e-campus debería poder conectarse con Google Classroom y sincronizar todos los datos académicos.
