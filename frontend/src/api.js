const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`)
  if (!res.ok) throw new Error('Failed to fetch clients')
  return res.json()
}

export async function fetchClientProfile(clientId) {
  const res = await fetch(`${API_BASE}/clients/${clientId}`)
  if (!res.ok) throw new Error('Failed to fetch client profile')
  return res.json()
}

export async function fetchConversations(clientId) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/conversations`)
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function deleteConversation(clientId, conversationId) {
  const res = await fetch(
    `${API_BASE}/clients/${clientId}/conversations/${conversationId}`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error('Failed to delete conversation')
  return res.json()
}

export async function sendChatMessage(clientId, message, conversationId) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      message,
      conversation_id: conversationId || undefined,
    }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export function streamChat(clientId, message, conversationId, callbacks) {
  const params = new URLSearchParams({
    client_id: clientId,
    message,
  })
  if (conversationId) params.set('conversation_id', conversationId)

  const eventSource = new EventSource(`${API_BASE}/agent/stream?${params}`)

  eventSource.addEventListener('token', (e) => {
    const data = JSON.parse(e.data)
    callbacks.onToken?.(data.content)
  })

  eventSource.addEventListener('tool_call', (e) => {
    const data = JSON.parse(e.data)
    callbacks.onToolCall?.(data)
  })

  eventSource.addEventListener('tool_result', (e) => {
    const data = JSON.parse(e.data)
    callbacks.onToolResult?.(data)
  })

  eventSource.addEventListener('done', (e) => {
    const data = JSON.parse(e.data)
    callbacks.onDone?.(data)
    eventSource.close()
  })

  eventSource.addEventListener('error', (e) => {
    if (e.data) {
      const data = JSON.parse(e.data)
      callbacks.onError?.(data.error)
    } else {
      callbacks.onError?.('Connection lost')
    }
    eventSource.close()
  })

  eventSource.onerror = () => {
    eventSource.close()
  }

  return eventSource
}
