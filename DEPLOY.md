# Deploy: Vercel (frontend) + Render (backend)

## 1) Preparar repositorio
- No subas tu `.env` (ya está en `.gitignore`).
- Usa `.env.example` como plantilla.

## 2) Backend en Render
1. Sube tu proyecto a GitHub.
2. En Render: **New → Web Service** → conecta tu repo.
3. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. En **Environment** agrega:
   - `DATABASE_URL` (Supabase)
   - `JWT_SECRET`
5. Deploy y copia la URL que te da Render (ejemplo: `https://muebles-backend.onrender.com`)

## 3) Frontend en Vercel (solo `src/public`)
1. En Vercel: **Add New → Project** → importa tu repo.
2. En **Root Directory** selecciona: `src/public`
3. Deploy.
4. Cuando tengas la URL final de Render, edita el archivo:
   - `src/public/vercel.json`
   y reemplaza:
   - `https://TU_BACKEND_RENDER.onrender.com`
   por tu URL real de Render.
5. Vuelve a desplegar en Vercel.

### ¿Para qué sirve `vercel.json`?
Hace un proxy/rewrite para que tus llamadas `fetch('/api/...')` funcionen desde Vercel sin cambiar tu código.

