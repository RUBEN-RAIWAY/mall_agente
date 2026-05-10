from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_classic.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from agent.tools_langchain import search_new_releases
from config import get_settings

SYSTEM_TEMPLATE = """Eres EntertainBot, un asistente experto en entretenimiento y streaming.

CLIENTE: {nombres} {fecha_nacimiento}
TALLA: {talla_ropa} {talla_calzado}
GUSTOS FAVORITOS: {comida}
CATEGORIAS FAVORITOS: {categorias}
CINE FAVORITOS: {cine}
HISTORIAL: {resumen_historia}

REGLAS:
- Responde solo en español.
- Solo recomienda contenido disponible en las plataformas activas del cliente.
- Cuando pregunten por precios, contenido nuevo, modelos, o cualquier información que requiera datos actualizados, SIEMPRE usa la herramienta de búsqueda ANTES de responder. No digas que no tienes acceso a información en tiempo real.
- No inventes fechas o precios.
- Personaliza según los gustos del cliente.
- Sé conversacional, usa el nombre del cliente cuando sea natural.
- Cualquier busqueda solo realizarlo primero en Peru.
- Si el cliente pregunta por algo fuera de sus plataformas, PRIMERO busca la información solicitada con la herramienta, y luego menciona que no tiene esa suscripción activa y sugiere alternativas en sus plataformas."""

def build_system_prompt(client: dict) -> str:
    prefs = client.get("preferencias", {})

    return SYSTEM_TEMPLATE.format(
        nombres=client.get("nombres", "Usuario"),
        fecha_nacimiento=client.get("fecha_nacimiento", ""),
        talla_ropa=client.get("talla_ropa", ""),
        talla_calzado=client.get("talla_calzado", ""),
        comida=", ".join(prefs.get("comida", [])),
        categorias=", ".join(prefs.get("categorias", [])),
        cine=", ".join(prefs.get("cine", [])),
        resumen_historia=client.get("resumen_historia", "Sin historial"),
    )


def build_chat_history(messages: list[dict]) -> list:
    history = []
    for msg in messages:
        if msg["role"] == "human":
            history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            history.append(AIMessage(content=msg["content"]))
    return history


def create_agent(client: dict):
    settings = get_settings()
    llm = ChatOpenAI(
        model="gpt-4.1",
        api_key=settings.openai_api_key,
        temperature=0.7,
        streaming=True,
    )

    tools = [search_new_releases]
    system_prompt = build_system_prompt(client)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_openai_tools_agent(llm, tools, prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=5,
    )
    return executor
