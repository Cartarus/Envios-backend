# 🔐 Guía: Cómo Usar Autenticación en Swagger UI

## Paso a Paso para Hacer Peticiones Autenticadas

### 1️⃣ Inicia el Servidor

```bash
npm run dev
```

### 2️⃣ Abre Swagger UI

Ve a: **http://localhost:3000/api-docs**

### 3️⃣ Obtén un Token JWT

Primero necesitas obtener un token. Hay dos formas:

#### Opción A: Registrar un Nuevo Usuario

1. Busca el endpoint **POST /api/auth/register** (tag "Auth")
2. Haz clic en el endpoint para expandirlo
3. Clic en **"Try it out"**
4. Completa el JSON:
   ```json
   {
     "name": "Juan Pérez",
     "email": "juan@example.com",
     "password": "Password123"
   }
   ```
5. Clic en **"Execute"**
6. Si todo está bien, recibirás un status 201

#### Opción B: Iniciar Sesión (si ya tienes usuario)

1. Busca el endpoint **POST /api/auth/login** (tag "Auth")
2. Haz clic en el endpoint para expandirlo
3. Clic en **"Try it out"**
4. Completa el JSON:
   ```json
   {
     "email": "juan@example.com",
     "password": "Password123"
   }
   ```
5. Clic en **"Execute"**
6. En la respuesta (Response body), verás algo como:
   ```json
   {
     "status": "success",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...",
       "user": {
         "id": "...",
         "name": "Juan Pérez",
         "email": "juan@example.com"
       }
     }
   }
   ```

### 4️⃣ Copia el Token

Copia **SOLO** el valor del token (el texto largo después de "token":)

**NO copies** las comillas ni el `"token":` - solo el valor:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...
```

### 5️⃣ Autoriza en Swagger UI

1. En la parte **superior derecha** de la página, verás un botón verde que dice **"Authorize"** con un candado 🔓
2. Haz clic en ese botón
3. Se abrirá un modal con un campo de texto que dice **"bearerAuth (http, Bearer)"**
4. Pega el token en el campo de texto (solo el token, sin "Bearer" al inicio)
5. Haz clic en **"Authorize"**
6. Haz clic en **"Close"**

### 6️⃣ Usa los Endpoints Protegidos

Ahora todos los endpoints que tienen el candado 🔒 se pueden usar:

#### Ejemplo: Obtener Ubicaciones

1. Busca **GET /api/location** (tag "Locations")
2. Verás un candado 🔒 al lado del título
3. Haz clic en el endpoint
4. Clic en **"Try it out"**
5. Clic en **"Execute"**
6. ¡Listo! Verás las ubicaciones en la respuesta

#### Ejemplo: Calcular Cotización

1. Busca **POST /api/rate** (tag "Rates")
2. Verás el candado 🔒
3. Haz clic en el endpoint
4. Clic en **"Try it out"**
5. Completa los datos (necesitarás IDs reales de ubicaciones):
   ```json
   {
     "originId": "id-de-ubicacion-origen",
     "destinationId": "id-de-ubicacion-destino",
     "weight": 5.5
   }
   ```
6. Clic en **"Execute"**
7. Verás la tarifa calculada

#### Ejemplo: Crear Envío

1. Busca **POST /api/shipment** (tag "Shipments")
2. Verás el candado 🔒
3. Haz clic en el endpoint
4. Clic en **"Try it out"**
5. Completa los datos:
   ```json
   {
     "originId": "id-de-ubicacion-origen",
     "destinationId": "id-de-ubicacion-destino",
     "weight": 5.5
   }
   ```
6. Clic en **"Execute"**
7. Recibirás los datos del envío creado

## 🔍 Identificar Endpoints Protegidos

En Swagger UI, los endpoints protegidos se identifican por:

- **Candado cerrado 🔒** al lado derecho del nombre del endpoint
- En la documentación del endpoint, verás una sección que dice "Authorization: bearerAuth"

Los endpoints **públicos** (sin autenticación):
- ❌ POST /api/auth/register
- ❌ POST /api/auth/login
- ❌ GET /health

Los endpoints **protegidos** (requieren token):
- ✅ GET /api/location
- ✅ POST /api/rate
- ✅ POST /api/shipment
- ✅ GET /api/shipment
- ✅ GET /api/shipment/{shipmentId}
- ✅ POST /api/shipment-status
- ✅ GET /api/shipment-status/{shipmentId}

## 🔄 Cerrar Sesión / Cambiar Token

Si necesitas usar otro token:

1. Haz clic nuevamente en el botón **"Authorize"**
2. Verás el token actual (parcialmente oculto)
3. Haz clic en **"Logout"** para quitar el token actual
4. Ingresa el nuevo token
5. Haz clic en **"Authorize"**

## ⚠️ Problemas Comunes

### Error 401: Unauthorized

**Causa**: Token inválido, expirado o no configurado

**Solución**:
1. Verifica que hayas copiado el token completo
2. Asegúrate de haber hecho clic en "Authorize"
3. Genera un nuevo token haciendo login nuevamente

### Error 403: Forbidden

**Causa**: Token válido pero sin permisos

**Solución**:
- Verifica que el usuario tenga los permisos necesarios

### El botón "Authorize" no aparece

**Causa**: La configuración de seguridad no se cargó correctamente

**Solución**:
1. Refresca la página
2. Verifica que el servidor esté corriendo
3. Revisa la consola del navegador por errores

## 📝 Notas Importantes

- **El token NO lleva "Bearer" al inicio** - Swagger lo agrega automáticamente
- **Los tokens pueden expirar** - Si obtienes errores 401, genera un nuevo token
- **El token es por sesión de Swagger** - Si cierras el navegador, tendrás que autorizar de nuevo
- **Un token funciona para todos los endpoints protegidos** - No necesitas autorizarte por separado para cada endpoint

## 🎯 Flujo Completo de Ejemplo

```
1. Abrir http://localhost:3000/api-docs
2. POST /api/auth/login → Obtener token
3. Copiar el token
4. Clic en "Authorize" (botón verde)
5. Pegar token
6. Clic en "Authorize" y luego "Close"
7. Ahora puedes usar:
   - GET /api/location → Ver ubicaciones disponibles
   - POST /api/rate → Calcular precio
   - POST /api/shipment → Crear envío
   - GET /api/shipment → Ver tus envíos
   - GET /api/shipment/{id} → Ver detalle de envío
   - POST /api/shipment-status → Actualizar estado
   - GET /api/shipment-status/{id} → Ver seguimiento
```

¡Listo! Ahora puedes probar toda tu API desde Swagger UI con autenticación JWT. 🚀
