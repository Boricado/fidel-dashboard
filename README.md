# Fidel Dashboard

Dashboard personal construido con Next.js 16 y conectado a Supabase.

## Integraciones preparadas

- Supabase: cliente configurado en `src/lib/supabase.js`
- Backend Next.js: acceso servidor en `src/lib/dashboard-api.js`
- Vercel: configuracion base en [`vercel.json`](/C:/Users/fidel/Documents/fidel-dashboard/vercel.json)
- Render: servicio web definido en [`render.yaml`](/C:/Users/fidel/Documents/fidel-dashboard/render.yaml)

## Variables de entorno

Usa `.env.example` como referencia:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-opcional
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-opcional
SUPABASE_JWT_SECRET=tu-jwt-secret-opcional
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Supabase

1. Crea o abre tu proyecto en Supabase.
2. Copia la `Project URL`.
3. Copia la `publishable key`.
4. Crea un archivo `.env.local` con esos valores.

La app ahora muestra una pantalla de configuracion si faltan esas variables, en vez de fallar al iniciar.

## Backend

El dashboard ya no consulta Supabase directo desde el navegador para las operaciones principales.

- `GET /api/dashboard`: carga los datos del panel
- `PATCH /api/licitaciones/:id`: actualiza `user_accion`
- `PATCH /api/tareas/:id`: actualiza `estado`

Estas rutas ahora esperan una sesion valida de Supabase en el cliente y reciben el token por `Authorization: Bearer ...`.

Si luego quieres permisos servidor mas fuertes, agrega `SUPABASE_SERVICE_ROLE_KEY` en Vercel. Si no la agregas, el backend usa la clave publica configurada.

## Login

El proyecto ahora usa login por correo y clave con Supabase desde la portada.

Si al iniciar sesion aparece `Email not confirmed`, tienes dos caminos:

1. Confirmar el correo desde el email enviado por Supabase.
2. Desactivar `Confirm email` en `Supabase > Authentication > Providers > Email`.

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Environment Variables.
3. Despliega.

## Despliegue en Render

1. Crea un nuevo `Blueprint` o `Web Service` desde este repositorio.
2. Render detectara `render.yaml`.
3. Completa las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Usa `/api/health` como health check.
