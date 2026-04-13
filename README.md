# Fidel Dashboard

Dashboard personal construido con Next.js 16 y conectado a Supabase.

## Integraciones preparadas

- Supabase: cliente configurado en [`src/lib/supabase.ts`](/C:/Users/fidel/Documents/fidel-dashboard/src/lib/supabase.ts)
- Backend Next.js: acceso servidor en [`src/lib/dashboard-api.ts`](/C:/Users/fidel/Documents/fidel-dashboard/src/lib/dashboard-api.ts)
- Vercel: configuracion base en [`vercel.json`](/C:/Users/fidel/Documents/fidel-dashboard/vercel.json)
- Render: servicio web definido en [`render.yaml`](/C:/Users/fidel/Documents/fidel-dashboard/render.yaml)

## Variables de entorno

Usa [`\.env.example`](/C:/Users/fidel/Documents/fidel-dashboard/.env.example) como referencia:

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

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Environment Variables.
3. Despliega.

## Despliegue en Render

1. Crea un nuevo `Blueprint` o `Web Service` desde este repositorio.
2. Render detectara [`render.yaml`](/C:/Users/fidel/Documents/fidel-dashboard/render.yaml).
3. Completa las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Usa `/api/health` como health check.
