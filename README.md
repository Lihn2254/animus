# Animus

**Animus** es un analizador demográfico de salud mental que recopila y procesa publicaciones de Reddit de comunidades de tecnología y ciencias de la computación para rastrear indicadores de salud mental como niveles de estrés, ansiedad, sentimientos y temas en tendencia. Proporciona información útil para investigación, educación y toma de decisiones en políticas públicas.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Backend](#backend)
  - [Arquitectura](#arquitectura)
  - [Modelos](#modelos)
  - [Endpoints de la API](#endpoints-de-la-api)
  - [Configuración del backend](#configuración-del-backend)
- [Frontend](#frontend)
  - [Páginas](#páginas)
  - [Configuración del frontend](#configuración-del-frontend)

---

## Descripción general

Animus extrae publicaciones de Reddit de comunidades relacionadas con desarrollo de software, operaciones de TI y temas de carrera profesional. Cada publicación se almacena y analiza para generar métricas que incluyen:

- **Nivel de estrés** (puntuación normalizada 0–1)
- **Nivel de ansiedad** (puntuación normalizada 0–1)
- **Sentimiento** (positivo / negativo / neutral)
- **Palabras clave** extraídas del contenido de la publicación

El panel de control presenta estas métricas en tarjetas KPI, gráficos de barras, desglose de sentimientos, temas principales y tablas de actividad por subreddit.

---

## Stack tecnológico

| Capa          | Tecnología                          |
|---------------|-------------------------------------|
| Backend       | Python 3, Flask, Flask-SQLAlchemy   |
| Base de datos | PostgreSQL 15 (vía Docker)          |
| ORM           | SQLAlchemy 2                        |
| Frontend      | Next.js 16, React 19, TypeScript    |
| Estilos       | Tailwind CSS v4                     |
| Formularios   | react-hook-form + Zod               |
| Contenedor    | Docker, Docker Compose              |

---

## Estructura del proyecto

```
animus/
├── backend/
│   ├── app.py                  # Punto de entrada de la aplicación
│   ├── init_db.py              # Script de inicialización de la base de datos
│   ├── insert_mock_data.py     # Script para poblar la base de datos con datos de prueba
│   ├── requirements.txt
│   ├── docker-compose.yml      # Definición del contenedor PostgreSQL
│   ├── .env                    # Variables de entorno (no se incluye en el repositorio)
│   ├── controllers/            # Lógica de negocio y manejo de solicitudes
│   │   ├── account_controller.py
│   │   ├── analysis_controller.py
│   │   ├── auth_controller.py
│   │   ├── home_controller.py
│   │   └── subreddit_controller.py
│   ├── infrastructure/         # Fábrica de la app, configuración e instancia de la BD
│   │   ├── app_factory.py
│   │   ├── config.py
│   │   └── db.py
│   ├── models/                 # Modelos ORM de SQLAlchemy
│   │   ├── analysis_result.py
│   │   ├── post.py
│   │   ├── subreddit.py
│   │   └── user.py
│   ├── routes/                 # Blueprints de Flask
│   │   ├── account_routes.py
│   │   ├── analysis_routes.py
│   │   ├── auth_routes.py
│   │   ├── home_routes.py
│   │   └── subreddit_routes.py
│   └── schemas/
│       └── user_schema.py
└── frontend/
    ├── next.config.ts
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── app/
            ├── globals.css
            ├── Header.tsx
            ├── (auth)/             # Páginas de inicio de sesión y registro
            │   ├── layout.tsx
            │   ├── login/
            │   │   └── page.tsx
            │   └── signup/
            │       └── page.tsx
            ├── (dashboard)/        # Panel de control principal
            │   ├── layout.tsx
            │   └── page.tsx
            └── components/
                └── Footer.tsx
```

---

## Backend

### Arquitectura

El backend sigue una arquitectura en capas utilizando el patrón de fábrica de aplicaciones de Flask:

- **`app.py`** — Crea la aplicación Flask mediante `create_app()` e inicia el servidor en el puerto `5000`.
- **`infrastructure/app_factory.py`** — Inicializa Flask, carga la configuración, enlaza la base de datos y registra los blueprints.
- **`infrastructure/config.py`** — Lee `DATABASE_URL` y `SECRET_KEY` desde el archivo `.env`.
- **`routes/`** — Blueprints de Flask que mapean métodos HTTP y rutas a funciones del controlador.
- **`controllers/`** — Maneja el análisis de solicitudes, validación y formato de respuestas.
- **`models/`** — Modelos ORM de SQLAlchemy que se mapean a tablas de PostgreSQL.

### Modelos

| Modelo           | Tabla              | Descripción                                                          |
|------------------|--------------------|----------------------------------------------------------------------|
| `User`           | `users`            | Usuarios de la aplicación con contraseñas hasheadas                  |
| `Subreddit`      | `subreddits`       | Subreddits monitoreados con categoría y metadatos de extracción      |
| `Post`           | `posts`            | Publicaciones de Reddit con título, contenido, autor y fechas        |
| `AnalysisResult` | `analysis_results` | Puntuaciones de análisis NLP (estrés, ansiedad, sentimiento, palabras clave) |

### Endpoints de la API

| Método | Ruta                       | Descripción                                                        |
|--------|----------------------------|--------------------------------------------------------------------|
| GET    | `/`                        | Estado de la API y listado de endpoints                            |
| POST   | `/api/register`            | Crear una nueva cuenta de usuario                                  |
| POST   | `/api/login`               | Autenticar a un usuario                                            |
| PUT    | `/api/account/<user_id>`   | Actualizar nombre de usuario, email o contraseña                   |
| DELETE | `/api/account/<user_id>`   | Eliminar una cuenta de usuario                                     |
| GET    | `/api/subreddits`          | Listar subreddits (filtrar por `category`, `is_active`, rango de fechas) |
| POST   | `/api/subreddits`          | Registrar un nuevo subreddit                                       |
| GET    | `/api/analysis`            | Obtener resultados de análisis (filtrar por `keywords`, `sentiment`, rango de fechas) |
| POST   | `/api/analysis/run`        | Ejecutar un nuevo análisis                                         |

### Configuración del backend

**Requisitos previos:** Python 3.10+, Docker Desktop

**1. Iniciar la base de datos PostgreSQL**

```bash
cd backend
docker compose up -d
```

Esto inicia un contenedor PostgreSQL 15 llamado `animus_postgres` en el puerto `5432`.

**2. Crear y activar un entorno virtual**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

**3. Instalar dependencias**

```bash
pip install -r requirements.txt
```

**4. Configurar las variables de entorno**

Crear un archivo `.env` en el directorio `backend/`:

```env
DATABASE_URL=postgresql://admin:Eva01@localhost:5432/animus_db
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
```

**5. Inicializar la base de datos**

```bash
python init_db.py
```

Esto crea todas las tablas (`users`, `subreddits`, `posts`, `analysis_results`).

**6. (Opcional) Poblar con datos de prueba**

```bash
python insert_mock_data.py
```

Inserta usuarios, subreddits y publicaciones de ejemplo para desarrollo y pruebas.

**7. Iniciar el servidor de desarrollo**

```bash
python app.py
```

La API estará disponible en `http://localhost:5000`.

---

## Frontend

### Páginas

| Ruta        | Descripción                                                                              |
|-------------|------------------------------------------------------------------------------------------|
| `/login`    | Formulario de inicio de sesión con email, contraseña y "recuérdame" — validado con Zod  |
| `/signup`   | Formulario de registro con nombre completo, email y confirmación de contraseña           |
| `/`         | Panel de control principal con tarjetas KPI, gráficos de actividad, desglose de sentimientos y tabla de subreddits |

### Configuración del frontend

**Requisitos previos:** Node.js 20+

**1. Instalar dependencias**

```bash
cd frontend
npm install
```

**2. Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

**Otros scripts**

| Comando         | Descripción                         |
|-----------------|-------------------------------------|
| `npm run build` | Crear una compilación de producción |
| `npm run start` | Iniciar el servidor de producción   |
| `npm run lint`  | Ejecutar ESLint                     |
