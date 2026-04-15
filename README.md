# UruWhy Discord Oficial

Aplicacion web para visualizar y organizar usuarios de una comunidad de Discord por departamento de Uruguay.

## Stack

- Frontend: Astro + TailwindCSS
- Backend: externo (Vercel) con OAuth de Discord y API

## Funcionalidades implementadas

- Mapa interactivo de Uruguay con 19 departamentos clickeables.
- Hover sobre departamento mostrando cantidad de usuarios.
- Panel lateral con lista de usuarios del departamento seleccionado.
- Buscador por username o ID de Discord.
- Filtro por departamento.
- Contadores globales (usuarios totales y departamentos activos).
- UI responsive con animaciones suaves.

## Estructura principal

```text
tasty-telescope/
├── src/
│   ├── components/
│   │   ├── CommunityExplorer.astro
│   │   ├── UruguayMap.astro
│   │   └── UserDirectoryPanel.astro
│   ├── data/
│   │   ├── mockUsers.js
│   │   └── uruguayDepartments.js
│   ├── lib/api.js
│   ├── layouts/Layout.astro
│   └── pages/index.astro
└── package.json
```

## Instalacion

Desde la raiz del proyecto:

```bash
npm install
```

## Scripts

Desarrollo frontend:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview frontend:

```bash
npm run preview
```

## API backend (mock)

Base URL por defecto: `http://localhost:4000`

- `GET /api/health`
- `GET /api/departments`
- `GET /api/users`
- `GET /api/users?department=montevideo`
- `GET /api/users?q=mate`

## Variables de entorno

Frontend opcional:

- `PUBLIC_API_URL` (recomendado)
- `PUBLIC_API_BASE_URL` (alias)
- `URL_BACKEND` (compatibilidad)

## Login Discord OAuth2

Este frontend reutiliza OAuth de un backend externo ya existente.

Ejemplo configurado:

- `PUBLIC_API_URL=https://uruwhy-penca-backend.vercel.app`
- `URL_BACKEND=https://uruwhy-penca-backend.vercel.app`

La barra de sesion usa estos endpoints del backend externo:

- `GET /auth/discord`
- `GET /auth/me`
- `GET /auth/logout`

No es necesario implementar OAuth local en este repositorio si ya usas ese backend.
