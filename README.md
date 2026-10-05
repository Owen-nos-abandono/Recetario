# Recetario

Aplicación full-stack para gestionar recetas de cocina, con registro e inicio de
sesión por correo y contraseña.

- **Backend**: Python + FastAPI (entorno virtual)
- **Frontend**: Angular + PrimeNG

## Estructura

```
recetario-app/
  backend/    -> API REST (FastAPI)
  frontend/   -> Interfaz web (Angular + PrimeNG)
```

## 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edita .env:
#  - SECRET_KEY: genera una con  python -c "import secrets; print(secrets.token_hex(32))"

uvicorn app.main:app --reload --port 8000
```

La API queda en `http://localhost:8000`. Documentación interactiva en
`http://localhost:8000/docs` (solo en modo development).

## 2. Frontend (Angular + PrimeNG)

```bash
cd frontend/recetario-frontend
npm install
npm start        # equivalente a: ng serve
```

Abre `http://localhost:4200`. Por defecto apunta a la API en
`http://localhost:8000` (ver `src/environments/environment.ts`).

## Flujo de uso

1. **Registro** (`/register`): correo, nombre y contraseña (mínimo 8
   caracteres, con mayúscula, minúscula, número y símbolo). Al registrarte entras
   directo a la app.
2. **Inicio de sesión** (`/login`): correo + contraseña.
3. **Recetas** (`/recipes`): al entrar se listan las recetas de **todos**
   los usuarios (con el nombre del autor). Cualquier usuario puede crear, editar y dar de baja (baja lógica, no se
   borran de la base de datos) o reactivar.

## Seguridad implementada

- Contraseñas con hash **bcrypt** (nunca texto plano)
- Autenticación por **JWT** (access + refresh token)
- Bloqueo temporal de cuenta tras 5 intentos fallidos de login
- **Rate limiting** en endpoints sensibles (registro y login)
- CORS restringido a orígenes explícitos
- Cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`,
  `Strict-Transport-Security` en producción, etc.)
- Mensajes de error genéricos para no filtrar si un correo existe o no
  (mitiga enumeración de usuarios)
- Secretos leídos de variables de entorno, nunca hardcodeados
- Baja lógica (soft delete) de recetas: no se pierden datos por error

## Notas para producción

- Cambia `ENVIRONMENT=production` en `.env` (desactiva `/docs` y activa HSTS).
- Usa una base de datos real (`DATABASE_URL=postgresql://...`) en vez de SQLite.
- Sirve el backend detrás de HTTPS (nginx/Caddy + certificado TLS).
- Ajusta `ALLOWED_ORIGINS` al dominio real del frontend.
- Considera usar Alembic para migraciones en vez de `create_all`.
