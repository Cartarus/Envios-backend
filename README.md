# 📦 API de Gestión de Envíos

Sistema backend para gestión de envíos que permite a los usuarios crear, rastrear y administrar envíos con cotizaciones basadas en peso y ubicación.

## 🚀 Características

- ✅ Autenticación JWT con tokens seguros
- ✅ Sistema de cotización basado en origen, destino,peso y dimensiones
- ✅ Historial completo de estados de envíos
- ✅ Cache con Redis para optimización de consultas
- ✅ Documentación interactiva con Swagger UI
- ✅ Arquitectura limpia (Clean Architecture)
- ✅ Testing con Jest
- ✅ Base de datos PostgreSQL
- ✅ Docker para desarrollo

## 🛠️ Tecnologías

- **Node.js** v23+ con TypeScript
- **Express** v5 - Framework web
- **PostgreSQL** 16 - Base de datos
- **Redis** - Sistema de caché
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Swagger** - Documentación de API
- **Jest** - Testing
- **Docker** - Contenedorización
- **Joi** - Validación de schemas


## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Cartarus/Envios-backend.git
cd Envios-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=envios_db

# PgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin123
PGADMIN_PORT=5050

# JWT Configuration
JWT_SECRET=tu-secreto-seguro-aqui

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

>  **Importante**: Cambia el `JWT_SECRET` a un valor único y seguro en producción.

### 4. Inicializar Docker

Levanta los servicios de base de datos y Redis:

```bash
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en el puerto `5432`
- **Redis** en el puerto `6379`
- **PgAdmin** en el puerto `5050` (opcional, para gestión de BD)

Para verificar que los contenedores estén corriendo:

```bash
docker-compose ps
```

### 5. Ejecutar migraciones

Crea las tablas en la base de datos:

```bash
npm run migrate
```

Esto ejecutará las migraciones en el siguiente orden:
1. Tabla de usuarios
2. Tabla de ubicaciones
3. Tabla de tarifas
4. Tabla de envíos
5. Tabla de historial de estados

### 6. Ejecutar la aplicación

#### Modo desarrollo (con hot-reload):

```bash
npm run dev
```


La API estará disponible en: **http://localhost:3000**

## 📚 Documentación de la API

### Swagger UI

Una vez que el servidor esté corriendo, accede a la documentación interactiva:

**URL**: http://localhost:3000/api-docs

Aquí podrás:
-  Ver todos los endpoints disponibles
-  Probar las APIs directamente desde el navegador
-  Autenticarte con JWT
-  Ver ejemplos de requests y responses



## 🔑 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Flujo de Autenticación

1. **Registrarse**: `POST /api/auth/register`
   ```json
   {
     "name": "Juan Pérez",
     "email": "juan@example.com",
     "password": "Password123"
   }
   ```

2. **Iniciar sesión**: `POST /api/auth/login`
   ```json
   {
     "email": "juan@example.com",
     "password": "Password123"
   }
   ```

3. **Usar el token**: Incluye el token en el header de tus peticiones
   ```
   Authorization: Bearer <tu-token-jwt>
   ```

## 🗺️ Endpoints Principales

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Ubicaciones 🔒
- `GET /api/location` - Listar ubicaciones

### Tarifas 🔒
- `POST /api/rate` - Calcular cotización

### Envíos 🔒
- `POST /api/shipment` - Crear envío
- `GET /api/shipment` - Listar envíos del usuario
- `GET /api/shipment/:id` - Obtener detalle de envío

### Estado de Envíos 🔒
- `POST /api/shipment-status` - Agregar estado
- `GET /api/shipment-status/:id` - Obtener seguimiento

🔒 = Requiere autenticación JWT

## 🧪 Testing

### Ejecutar todos los tests

```bash
npm test
```



### Generar reporte de cobertura

```bash
npm run test:coverage
```

Los tests incluyen:
-  Unit tests de casos de uso
-  Integration tests con base de datos en memoria
-  Tests de repositorios
-  Tests de validación



## 📦 Scripts Disponibles

```bash
npm run dev          # Inicia en modo desarrollo con hot-reload
npm start            # Inicia en modo producción
npm run migrate      # Ejecuta migraciones de base de datos
npm test             # Ejecuta tests
npm run test:watch   # Ejecuta tests en modo watch
npm run test:coverage # Genera reporte de cobertura
```
