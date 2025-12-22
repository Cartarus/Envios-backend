# Documentación de la API con Swagger

## Acceso a la Documentación

Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api-docs
```

## Características de Swagger UI

### Interfaz Interactiva
- **Explorar endpoints**: Navega por todos los endpoints disponibles organizados por tags
- **Probar APIs**: Ejecuta peticiones directamente desde la interfaz
- **Ver schemas**: Consulta los modelos de datos y sus propiedades
- **Autenticación**: Configura el token JWT para endpoints protegidos

### Cómo Usar

#### 1. Autenticación con Token JWT

Para usar endpoints protegidos:

1. Primero, registra un usuario en `/api/auth/register` o inicia sesión en `/api/auth/login`
2. Copia el token JWT de la respuesta
3. Haz clic en el botón **"Authorize"** en la parte superior derecha
4. Ingresa el token en el formato: `Bearer <tu-token>`
5. Haz clic en "Authorize"

Ahora todos tus requests incluirán automáticamente el header de autorización.

#### 2. Probar Endpoints

1. Expande el endpoint que deseas probar
2. Haz clic en **"Try it out"**
3. Completa los parámetros requeridos
4. Haz clic en **"Execute"**
5. Revisa la respuesta en la sección de resultados

## Endpoints Disponibles

### Auth (Autenticación)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Locations (Ubicaciones)
- `GET /api/location` - Obtener todas las ubicaciones 🔒

### Rates (Tarifas)
- `POST /api/rate` - Calcular cotización de envío 🔒

### Shipments (Envíos)
- `POST /api/shipment` - Crear nuevo envío 🔒
- `GET /api/shipment` - Listar envíos del usuario 🔒
- `GET /api/shipment/{shipmentId}` - Obtener envío por ID 🔒

### Shipment Status (Estado de Envíos)
- `POST /api/shipment-status` - Agregar estado a envío 🔒
- `GET /api/shipment-status/{shipmentId}` - Obtener historial de seguimiento 🔒

🔒 = Requiere autenticación JWT

## Acceso al JSON de Swagger

También puedes acceder a la especificación OpenAPI en formato JSON:

```
http://localhost:3000/api-docs.json
```

Este archivo se puede importar en otras herramientas como Postman, Insomnia, o generadores de código cliente.

## Ejemplo de Flujo Completo

1. **Registrar usuario**
   ```
   POST /api/auth/register
   {
     "name": "Juan Pérez",
     "email": "juan@example.com",
     "password": "password123"
   }
   ```

2. **Iniciar sesión**
   ```
   POST /api/auth/login
   {
     "email": "juan@example.com",
     "password": "password123"
   }
   ```

3. **Configurar autorización** con el token recibido

4. **Obtener ubicaciones**
   ```
   GET /api/location
   ```

5. **Calcular tarifa**
   ```
   POST /api/rate
   {
     "originId": "origin-uuid",
     "destinationId": "destination-uuid",
     "weight": 5.5
   }
   ```

6. **Crear envío**
   ```
   POST /api/shipment
   {
     "originId": "origin-uuid",
     "destinationId": "destination-uuid",
     "weight": 5.5
   }
   ```

7. **Consultar envíos**
   ```
   GET /api/shipment
   ```

8. **Ver seguimiento**
   ```
   GET /api/shipment-status/{shipmentId}
   ```

## Personalización

La configuración de Swagger se encuentra en:
```
src/infrastructure/config/swagger.ts
```

Las anotaciones JSDoc están en los archivos de rutas:
```
src/interface/routes/*.ts
```

Para agregar documentación a nuevos endpoints, usa comentarios JSDoc con anotaciones de Swagger antes de cada ruta.
