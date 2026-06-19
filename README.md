# MaterialPro

Aplicacion movil para registrar ventas, gastos, materiales, clientes, historial y reportes semanales de un negocio de venta de materiales.

## Estructura

- `backend/`: Node.js, Express, PostgreSQL, JWT, bcryptjs, CORS, dotenv y multer.
- `backend/database.sql`: tablas, vistas y datos iniciales.
- `frontend/`: React Native con Expo para Android.

## Base de datos

Crear la base y ejecutar el script:

```bash
createdb materialpro
psql -d materialpro -f backend/database.sql
```

Si ya tienes la base creada de una version anterior, aplica la migracion:

```bash
psql -d materialpro -f backend/migrations/001_modulos_oro_equipo_config.sql
psql -d materialpro -f backend/migrations/002_auth_gmail_verification.sql
```

Configurar `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=materialpro
DB_USER=postgres
DB_PASSWORD=contrasena_postgres
JWT_SECRET=materialpro_secret_key_2026
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

## Ejecutar frontend web

La primera version esta pensada para navegador web. El frontend usa `http://localhost:3000/api` cuando corre en web.

```bash
cd frontend
npm install
npm run web
```

Para generar build web:

```bash
cd frontend
npx expo export --platform web
```

El build queda en `frontend/dist`.

## Ejecutar backend

Backend:

```bash
cd backend
npm install
npm run dev
```

## Ejecutar Android despues

```bash
cd frontend
npm install
npm run android
```

La app usa `http://10.0.2.2:3000/api` para el emulador Android. En telefono fisico, cambiar `API_URL` en `frontend/src/services/api.ts` por la IP LAN de la PC.

## Probar endpoints

Registrar:

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"nombre\":\"Sergio Ticona\",\"email\":\"sergio@gmail.com\",\"password\":\"123456\",\"confirmarPassword\":\"123456\"}"
```

Verificar Gmail:

```bash
curl -X POST http://localhost:3000/api/auth/verificar-email -H "Content-Type: application/json" -d "{\"email\":\"sergio@gmail.com\",\"codigo\":\"482913\"}"
```

Reenviar codigo:

```bash
curl -X POST http://localhost:3000/api/auth/reenviar-codigo -H "Content-Type: application/json" -d "{\"email\":\"sergio@gmail.com\"}"
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"sergio@gmail.com\",\"password\":\"123456\"}"
```

Guardar el token y enviarlo asi:

```bash
curl http://localhost:3000/api/auth/perfil -H "Authorization: Bearer TOKEN"
```

Rutas protegidas principales:

- `GET|POST /api/materiales`, `GET|PUT|DELETE /api/materiales/:id`
- `GET|POST /api/tipos-gasto`, `GET|PUT|DELETE /api/tipos-gasto/:id`
- `GET|POST /api/clientes`, `GET|PUT|DELETE /api/clientes/:id`
- `GET|POST /api/ventas`, `GET|PUT|DELETE /api/ventas/:id`
- `GET|POST /api/gastos`, `GET|PUT|DELETE /api/gastos/:id`
- `GET /api/historial?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=Venta&buscar=arena`
- `GET|PUT /api/configuracion`
- `GET /api/reportes/semanal?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- `POST /api/reportes/semanal`
- `GET /api/reportes/semanales`
- `GET|POST /api/oro`, `GET|PUT|DELETE /api/oro/:id`
- `GET /api/oro/resumen/semanal?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- `GET|POST /api/equipo`, `GET|PUT|DELETE /api/equipo/:id`

Para subir imagenes, enviar `multipart/form-data` con el campo `imagen`. El backend devuelve `imagen_url`.

## Modulos nuevos

- Oro encontrado: registra gramos manuales por fecha, lugar, imagen y observacion.
- Equipo: integrantes con nombre, celular, cargo, foto, observacion y estado.
- Ventas: el cliente ahora puede enviarse como texto opcional en `cliente_nombre`.
- Configuracion: incluye datos del negocio, opciones de oro, reportes y seguridad.
