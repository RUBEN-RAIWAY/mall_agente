import os
os.environ.setdefault("GRPC_VERBOSITY", "ERROR")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.tools_router import router as tools_router
from routers.clients_router import router as clients_router
from routers.agent_router import router as agent_router
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="Centro Comercial Bot API",
    description="Agente de recomendaciones para centro comercial con LangChain + OpenAI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tools_router)
app.include_router(clients_router)
app.include_router(agent_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
