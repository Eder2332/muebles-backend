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

---

# Envío de correos (Gmail) al comprar

Tu backend puede enviar un correo al usuario cuando se registra una compra (`POST /api/orders/checkout`).

## Variables de entorno (Render o .env local)
- `EMAIL_ENABLED=true`
- `EMAIL_FROM_NAME=UrbanMuebles`
- `GMAIL_SENDER=tu_cuenta@gmail.com` (la cuenta que enviará los correos)
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `GOOGLE_REFRESH_TOKEN=...`

## Pasos en Google (Gmail API)
1) Ve a **Google Cloud Console** y crea un proyecto.
2) En **APIs & Services → Library** habilita **Gmail API**.
3) En **APIs & Services → OAuth consent screen** configura el consentimiento (External).
4) En **APIs & Services → Credentials** crea **OAuth Client ID** (tipo Desktop App).
5) Genera un **Refresh Token** para tu cuenta `GMAIL_SENDER`:
   - Usa OAuth Playground (recomendado) y autoriza la cuenta.
   - Scope recomendado: `https://www.googleapis.com/auth/gmail.send`
   - Intercambia el código y copia el `refresh_token`.
6) Pega las variables en Render (Environment) o en tu `.env` local.

## Nota
- Esto envía correos desde **tu cuenta Gmail** (GMAIL_SENDER) hacia el Gmail del usuario.
- No valida si el correo del usuario existe; si es falso, el correo simplemente no llegará.
