# Centro Comercial Bot

Aplicación completa (FastAPI + React) que actúa como asistente inteligente personalizado para clientes de un centro comercial. El agente conversa con cada cliente, recuerda sus conversaciones previas, conoce sus gustos y perfil completo, y genera recomendaciones de servicios, tiendas, restaurantes, cines, discotecas y más — con búsqueda en tiempo real.

## Demo en producción

| Servicio | URL |
|---|---|
| Frontend | https://mallbot-production.up.railway.app |
| Backend API | https://mallagente-production.up.railway.app |
| API Docs | https://mallagente-production.up.railway.app/docs |

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | FastAPI + LangChain + OpenAI GPT-4.1 |
| Búsqueda en tiempo real | Tavily Search API |
| Persistencia | Firebase Firestore |
| Streaming | Server-Sent Events (SSE) |
| Frontend | React 19 + Vite + Tailwind CSS |
| Deploy | Railway (Docker) |

## Requisitos previos (desarrollo local)

- Python 3.11+
- Node.js 18+
- Proyecto Firebase con Firestore habilitado
- API keys: OpenAI, Tavily

## Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea o selecciona un proyecto
3. Habilita **Cloud Firestore** en modo nativo
4. Ve a **Project Settings > Service accounts > Generate new private key**
5. Guarda el JSON como `backend/firebase-service-account.json`

### Índice compuesto requerido

Colección `conversations` con los campos:

| Campo | Orden |
|---|---|
| `client_id` | Ascending |
| `updated_at` | Descending |

Se crea automáticamente al ejecutar la primera query (Firebase muestra el enlace en los logs).

## Setup Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus claves

# Cargar clientes de prueba
python seed.py

# Limpiar y recargar
python seed.py --clean

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

Backend disponible en `http://localhost:8000` · Docs en `http://localhost:8000/docs`

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`. El proxy de Vite redirige `/api/*` al backend local.

## Variables de entorno

### Backend — `backend/.env`

```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
FIREBASE_PROJECT_ID=tu-proyecto
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Solo en producción (reemplaza al archivo JSON)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# CORS (separar con comas)
ALLOWED_ORIGINS=http://localhost:5173,https://tu-frontend.up.railway.app
```

### Frontend — variable de build

```env
VITE_API_URL=https://tu-backend.up.railway.app   # solo producción
```

En desarrollo local no se necesita — Vite hace el proxy automáticamente.

## Endpoints del API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/clients` | Lista de clientes |
| GET | `/clients/{id}` | Perfil completo del cliente |
| GET | `/clients/{id}/conversations` | Historial de conversaciones |
| GET | `/clients/{id}/conversations/{cid}` | Detalle de una conversación |
| DELETE | `/clients/{id}/conversations/{cid}` | Eliminar conversación |
| POST | `/agent/chat` | Chat síncrono |
| GET | `/agent/stream` | Chat con streaming SSE |
| POST | `/tools/search` | Búsqueda directa con Tavily |

## Deploy en Railway

El proyecto incluye un `Dockerfile` en la raíz para el backend y `railway.toml` para configuración de healthcheck.

Variables requeridas en Railway:

**Backend:**
```
OPENAI_API_KEY
TAVILY_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT_JSON   ← contenido del JSON en una línea
ALLOWED_ORIGINS                 ← URL del frontend en Railway
PORT=8000
```

**Frontend:**
```
VITE_API_URL   ← URL del backend en Railway
```

## Clientes de prueba

| ID | Nombre | Perfil |
|---|---|---|
| client_001 | Carlos Alberto Pérez Gómez | Masculino · Ropa deportiva, Cine, Discotecas |
| client_002 | María Fernanda López Silva | Femenino · Ropa casual, Supermercado, Hogar |
| client_003 | Jorge Luis Ramírez Vargas | Masculino · Tecnología, Zapatillas, Fast Food |
| client_004 | Lucía Mendiola Castillo | Femenino · Ropa elegante, Joyería, Cafeterías |
| client_005 | Roberto Carlos Fernández Ruiz | Masculino · Ferretería, Bancos, Ropa de vestir |
| client_006 | Camila Andrea Torres Mendoza | Femenino · Maquillaje, Discotecas, Accesorios |

Ver perfil completo de cada cliente en `backend/data/seed_clients.json`.
