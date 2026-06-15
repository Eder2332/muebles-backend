# Artillery (pruebas)

## Requisitos
- Tener tu app corriendo en local (`http://localhost:3000`) o en Render (URL `https://...onrender.com`)
- Tener Artillery instalado (global o con npx).

## Archivos de prueba
- `00-products-1000-5000.yml`: carga “segura” (solo GET products paginado). Sirve para llegar a 1000–5000 requests.
- `01-mix-pagination.yml`: mezcla products + categories (paginados) y category/:id.
- `02-login-checkout.yml`: login + checkout (NO masivo, porque actualiza stock).

## Cómo correr (local)
```bash
artillery run load-tests/00-products-1000-5000.yml
```

Si no tienes Artillery en PATH:
```bash
npx artillery run load-tests/00-products-1000-5000.yml
```

## Cómo correr (Render)
Ya está configurado para Render por defecto (`https://muebles-backend-73jr.onrender.com`).
Si quieres volver a local, cambia `target` a `http://localhost:3000`.

## Nota para la prueba de checkout
En `02-login-checkout.yml` reemplaza:
- `email`
- `password`
por un usuario real existente.
