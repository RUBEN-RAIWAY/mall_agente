# Asistente Centro comercial Bot - Asistente de para Mall para clientes Personalizado

Aplicación completa (FastAPI + React) que funciona buscando entender al cliente con un perfil 360 grados en un centro comercial, que tiene restaurantes, bancos,tiendas, almacenes, discotecas, cines y demas con una gran variede de ofertas. El agente conversa con clientes, recuerda sus conversaciones previas, conoce sus gustos y descripcion de ellos, trata de entenderlos a fin. de generar nuevas oportunidades de ventas de servicios.

## Stack

- **Backend:** FastAPI + LangChain + OpenAI (gpt-4.1) + Tavily + Firebase Firestore
- **Frontend:** React + Vite + Tailwind CSS
- **Persistencia:** Firebase Firestore
- **Streaming:** Server-Sent Events (SSE)

## Requisitos previos

- Python 3.11+
- Node.js 18+
- Proyecto Firebase con Firestore habilitado
- API keys: OpenAI, Tavily

## Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. Habilita **Cloud Firestore** en modo nativo
4. Ve a **Project Settings > Service accounts**
5. Genera una nueva clave privada (JSON)
6. Guarda el archivo como `firebase-service-account.json` en la carpeta `backend/`

### Crear indices en Firestore

El proyecto usa una query compuesta en la coleccion `conversations`. Crea este indice:

- Coleccion: `conversations`
- Campos: `client_id` (Ascending), `updated_at` (Descending)

Puedes crearlo desde la consola de Firebase o se creara automaticamente al ejecutar la primera query (Firebase te dara un link en los logs).

## Setup Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys y configuracion de Firebase

# Cargar datos iniciales
python seed.py

# Para limpiar y recargar:
# python seed.py --clean

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

El backend estara disponible en `http://localhost:8000`. Documentacion en `http://localhost:8000/docs`.

## Setup Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estara disponible en `http://localhost:5173`. El proxy de Vite redirige las llamadas `/api/*` al backend.

## Uso

1. Abre `http://localhost:5173` en tu navegador
2. Selecciona un cliente de la lista
3. Comienza a chatear - el agente personalizara sus respuestas segun el perfil del cliente
4. Usa el sidebar para navegar entre conversaciones previas o crear nuevas
5. El agente buscara estrenos automaticamente cuando preguntes por contenido nuevo

## Endpoints del API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/tools/search` | Busqueda directa con Tavily |
| GET | `/clients` | Lista de clientes |
| GET | `/clients/{id}` | Perfil completo |
| GET | `/clients/{id}/conversations` | Lista de conversaciones |
| GET | `/clients/{id}/conversations/{cid}` | Detalle de conversacion |
| DELETE | `/clients/{id}/conversations/{cid}` | Eliminar conversacion |
| POST | `/agent/chat` | Chat sincronico |
| GET | `/agent/stream` | Chat con SSE streaming |

## Clientes de prueba
