# Caso de Uso — Centro Comercial Bot

## Descripción general

Centro Comercial Bot es un asistente conversacional inteligente diseñado para operar dentro de un centro comercial. Su función principal es interactuar con clientes de forma personalizada, comprender sus gustos, comportamientos de compra y preferencias, para generar recomendaciones relevantes y nuevas oportunidades de venta de servicios y productos disponibles en el mall.

---

## Problema que resuelve

Los centros comerciales atienden a miles de clientes con perfiles muy distintos: familias, jóvenes, profesionales, adultos mayores. Sin un sistema inteligente, los empleados no pueden recordar las preferencias individuales de cada visitante ni ofrecer experiencias verdaderamente personalizadas.

**Centro Comercial Bot** actúa como un asistente que:
- Recuerda cada conversación previa con el cliente
- Conoce sus gustos, tallas, comida favorita, horarios de visita y comportamiento histórico
- Busca información actualizada en tiempo real (precios, estrenos, promociones)
- Genera recomendaciones adaptadas al perfil exacto del cliente

---

## Actores del sistema

| Actor | Rol |
|---|---|
| **Operador del mall** | Administra los perfiles de clientes y accede al sistema |
| **Agente IA** | Conversa con el cliente, consulta su perfil y busca información en tiempo real |
| **Cliente** | Persona registrada en el sistema con un perfil completo |
| **Firebase Firestore** | Almacena perfiles de clientes e historial de conversaciones |
| **OpenAI GPT-4.1** | Motor de razonamiento y generación de respuestas |
| **Tavily Search** | Proveedor de búsqueda web en tiempo real |

---

## Flujo principal del sistema

```
Operador selecciona cliente
        ↓
Sistema carga perfil 360° del cliente desde Firebase
        ↓
Agente IA recibe contexto: nombre, gustos, historial, tallas, comportamiento
        ↓
Cliente hace una consulta (texto libre)
        ↓
¿Requiere información en tiempo real?
   ├── SÍ → Tavily busca en web (Perú primero) → resultado incorporado a respuesta
   └── NO → Agente responde con contexto del perfil
        ↓
Respuesta personalizada via streaming (SSE)
        ↓
Conversación guardada en Firebase con timestamp
        ↓
Historial disponible para próximas sesiones
```

---

## Casos de uso específicos

### CU-01: Recomendación de tiendas según perfil

**Actor:** Operador / Cliente  
**Precondición:** El cliente tiene un perfil registrado con categorías de preferencia  
**Flujo:**
1. El operador selecciona el cliente (ej. Carlos Pérez — Ropa deportiva, Cine)
2. El cliente pregunta: *"¿Qué tiendas de ropa deportiva hay?"*
3. El agente responde con recomendaciones específicas personalizadas según su talla (32, calzado 41) y preferencias de color (amarillo, azul, marrón)

**Resultado:** Recomendación personalizada sin necesidad de que el cliente repita sus preferencias

---

### CU-02: Consulta de estrenos y programación de cine

**Actor:** Carlos Alberto Pérez Gómez (cliente_001)  
**Precondición:** El agente sabe que Carlos va al cine los sábados con sus hijos  
**Flujo:**
1. Carlos pregunta: *"¿Qué películas están en cartelera este fin de semana?"*
2. El agente activa la herramienta de búsqueda (Tavily) con contexto: Perú, cines
3. Obtiene estrenos actualizados en tiempo real
4. Responde considerando que Carlos suele ir con sus hijos y le gusta tomar pisco sour

**Resultado:** Recomendación de cartelera actualizada y contextualizada al perfil familiar del cliente

---

### CU-03: Sugerencias gastronómicas personalizadas

**Actor:** Lucía Mendiola Castillo (client_004)  
**Precondición:** Lucía prefiere comida gourmet y sushi, visita el mall entre semana  
**Flujo:**
1. Lucía pregunta: *"¿Dónde puedo almorzar algo rico hoy?"*
2. El agente, sabiendo que es miércoles a las 17:00 (horario habitual de Lucía) y que prefiere gourmet y sushi, recomienda restaurantes específicos
3. Menciona que puede acompañarlo con un café largo mientras lee (su hábito conocido)

**Resultado:** Sugerencia gastronómica que se siente como si viniera de alguien que la conoce personalmente

---

### CU-04: Información bancaria y de pagos

**Actor:** Roberto Carlos Fernández Ruiz (client_005)  
**Precondición:** Roberto paga en efectivo y opera con BanBif y BCP  
**Flujo:**
1. Roberto pregunta: *"¿El banco BCP está abierto ahora?"*
2. El agente busca el horario actualizado del BCP en el mall
3. Responde considerando que Roberto visita los sábados por la mañana

**Resultado:** Información práctica adaptada al comportamiento real del cliente

---

### CU-05: Continuidad entre sesiones

**Actor:** María Fernanda López Silva (client_002)  
**Flujo:**
1. En una sesión anterior María preguntó por ollas de cocina
2. En una nueva sesión pregunta: *"¿Ya llegaron los nuevos productos de cocina que mencionaste?"*
3. El agente recupera el historial de Firebase y retoma la conversación con contexto completo

**Resultado:** Experiencia continua y coherente entre visitas al mall

---

## Perfil de cliente (estructura de datos)

Cada cliente en el sistema contiene:

```json
{
  "client_id": "client_001",
  "nombres": "Carlos Alberto Pérez Gómez",
  "genero": "M",
  "estado_civil": "Soltero",
  "fecha_nacimiento": "1992-05-14",
  "talla_ropa": "32",
  "talla_calzado": "41",
  "contacto": {
    "email": "carlos.perez@email.com",
    "telefono": "+51987654321"
  },
  "preferencias": {
    "categorias": ["ropa_deportiva", "cine", "discotecas"],
    "comida": ["Hamburguesas", "Parrillas"],
    "colores": ["Amarillo", "Azul", "Marrón"],
    "musica": ["Rock", "Salsa", "Balada"]
  },
  "comportamiento": {
    "dias_visita": ["Viernes", "Sábado"],
    "horario": "18:00 - 23:00",
    "usa_estacionamiento": true,
    "ticket_promedio": 45.50,
    "metodo_pago": "Crédito",
    "bancos": ["BCP", "Interbank"]
  },
  "resumen_historia": "Por lo general los sábados va al cine con sus hijos..."
}
```

---

## Capacidades del agente IA

| Capacidad | Descripción |
|---|---|
| **Memoria de sesión** | Mantiene el contexto dentro de una conversación |
| **Memoria histórica** | Recupera conversaciones anteriores desde Firebase |
| **Búsqueda en tiempo real** | Consulta precios, estrenos y promociones actuales vía Tavily |
| **Personalización profunda** | Adapta respuestas al perfil completo del cliente |
| **Streaming de respuestas** | Entrega la respuesta token a token vía SSE para mejor UX |
| **Multiconversación** | Gestiona múltiples conversaciones independientes por cliente |

---

## Limitaciones actuales

- El sistema opera en español exclusivamente
- Las búsquedas en tiempo real priorizan resultados de Perú
- La gestión de clientes es manual (no hay panel de administración de alta/baja de clientes)
- No incluye autenticación de usuarios ni roles

---

## Posibles extensiones futuras

- Panel de administración para gestionar clientes desde la UI
- Autenticación con roles (administrador, operador)
- Notificaciones proactivas al cliente (promociones personalizadas)
- Integración con sistema de punto de venta del mall
- Dashboard de analytics por cliente (ticket promedio, frecuencia de visita)
- Soporte multiidioma
