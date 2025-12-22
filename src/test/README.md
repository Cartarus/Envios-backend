# Configuración de Tests con Jest y pg-mem

## Descripción

Este proyecto usa **Jest** como framework de testing y **pg-mem** como base de datos PostgreSQL en memoria para las pruebas.

## Archivos de Configuración

### `jest.config.js`
Configuración principal de Jest con soporte para TypeScript y ES Modules.

### `src/test/setup.ts`
Archivo de configuración que:
- Crea una instancia de base de datos en memoria con pg-mem
- Ejecuta las migraciones reales desde `src/infrastructure/migrations/*.sql`
- Limpia los datos entre cada test (NO carga datos de prueba por defecto)
- Exporta el `pool` de conexión y la función `seedData` para usar en los tests

### `src/test/testMigrations.ts`
Contiene las funciones para:
- `runMigrations(pool, skipSeed)`: Ejecuta las migraciones SQL reales
- `seedData(pool)`: Carga datos de prueba (ubicaciones y tarifas)
- `cleanDatabase(pool)`: Limpia todas las tablas

### Archivos de ejemplo
- `src/test/example.test.ts`: Test básico que verifica la configuración
- `src/test/seedData.test.ts`: Test que usa datos de prueba (seed)

## Uso de tus Migraciones Reales

✅ **Sí, puedes usar tu script de migraciones con pg-mem**. La configuración actual:

1. Lee tus archivos `.sql` reales desde `src/infrastructure/migrations/`
2. Convierte automáticamente `UUID` a `VARCHAR(36)` (pg-mem no soporta UUID nativo)
3. Ejecuta las migraciones en orden
4. Opcionalmente carga los datos de prueba que ya tienes definidos

## Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al hacer cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Cómo Escribir Tests

### Estructura básica

```typescript
import { pool } from './setup';

describe('Mi Funcionalidad', () => {
  it('debe hacer algo', async () => {
    // Arrange: Preparar datos de prueba
    await pool.query(`
      INSERT INTO users (id, name, email, password)
      VALUES ('1', 'Test User', 'test@example.com', 'hashedpassword')
    `);

    // Act: Ejecutar la funcionalidad a probar
    const result = await pool.query('SELECT * FROM users WHERE id = $1', ['1']);

    // Assert: Verificar el resultado
    expect(result.rows[0].name).toBe('Test User');
  });
});
```

### Testing de Repositorios

```typescript
import { pool } from './setup';
import { PostgresUserRepository } from '../infrastructure/repositories/PostgresUserRepository';

describe('PostgresUserRepository', () => {
  let userRepository: PostgresUserRepository;

  beforeEach(() => {
    userRepository = new PostgresUserRepository(pool);
  });

  it('debe crear un usuario', async () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password'
    };

    await userRepository.create(user);
    
    const found = await userRepository.findById('1');
    expect(found?.name).toBe('John Doe');
  });
});
```

## Notas Importantes

1. **pg-mem tiene limitaciones**: No soporta todas las características de PostgreSQL. Por ejemplo, `DECIMAL(10,2)` se simplifica a `DECIMAL`.

2. **Los datos se limpian automáticamente**: El hook `afterEach` en `setup.ts` limpia todas las tablas después de cada test, por lo que cada test comienza con una base de datos limpia.

3. **No es necesario levantar PostgreSQL**: pg-mem simula PostgreSQL en memoria, por lo que no necesitas tener PostgreSQL instalado ni corriendo para ejecutar los tests.

4. **Usar el pool exportado**: Siempre importa `pool` desde `./setup` en tus tests para usar la conexión de base de datos configurada.

## Próximos Pasos

- Escribir tests para tus repositorios
- Escribir tests para tus use cases
- Escribir tests para tus controladores (usando supertest si es necesario)
