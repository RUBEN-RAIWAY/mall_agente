import { useState, useEffect, useRef } from 'react'
import { fetchConversations, fetchClientProfile, fetchConversationDetail, deleteConversation, streamChat, sendChatMessage } from '../api'
import Sidebar from './Sidebar'
import MessageBubble from './MessageBubble'

const CATEGORIA_COLORS = {
  ropa_deportiva: 'bg-blue-700',
  ropa_casual: 'bg-teal-700',
  ropa_elegante: 'bg-purple-700',
  ropa_de_vestir: 'bg-indigo-700',
  tecnologia: 'bg-cyan-700',
  zapatillas: 'bg-sky-700',
  maquillaje: 'bg-pink-700',
  joyeria: 'bg-amber-600',
  accesorios: 'bg-rose-700',
  supermercado: 'bg-green-700',
  hogar: 'bg-lime-700',
  ferreteria: 'bg-orange-700',
  cafeterias: 'bg-yellow-700',
  fast_food: 'bg-red-700',
  cine: 'bg-violet-700',
  discotecas: 'bg-fuchsia-700',
  bancos: 'bg-gray-600',
}

export default function ChatView({ client, onBack }) {
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [currentConvoId, setCurrentConvoId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [toolStatus, setToolStatus] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    fetchClientProfile(client.client_id).then(setProfile)
    loadConversations()
  }, [client.client_id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, toolStatus])

  async function loadConversations() {
    const convos = await fetchConversations(client.client_id)
    setConversations(convos)
  }

  async function loadConversation(convoId) {
    setCurrentConvoId(convoId)
    setMessages([])
    try {
      const data = await fetchConversationDetail(client.client_id, convoId)
      setMessages(data.messages || [])
    } catch {
      // Start fresh
    }
  }

  function startNewConversation() {
    setCurrentConvoId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  async function handleDeleteConversation(convoId) {
    await deleteConversation(client.client_id, convoId)
    if (convoId === currentConvoId) {
      setCurrentConvoId(null)
      setMessages([])
    }
    loadConversations()
  }

  async function selectConversation(convoId) {
    setSidebarOpen(false)
    await loadConversation(convoId)
  }

  async function handleSend() {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'human', content: userMessage }])
    setIsStreaming(true)
    setToolStatus(null)

    // Add empty AI message for streaming
    setMessages((prev) => [...prev, { role: 'ai', content: '', streaming: true }])

    try {
      const eventSource = streamChat(
        client.client_id,
        userMessage,
        currentConvoId,
        {
          onToken(content) {
            setMessages((prev) => {
              const updated = [...prev]
              const lastMsg = updated[updated.length - 1]
              if (lastMsg.role === 'ai') {
                updated[updated.length - 1] = {
                  ...lastMsg,
                  content: lastMsg.content + content,
                }
              }
              return updated
            })
          },
          onToolCall(data) {
            setToolStatus(`Buscando: "${data.input?.query || data.input || '...'}"`)
          },
          onToolResult() {
            setToolStatus(null)
          },
          onDone(data) {
            setCurrentConvoId(data.conversation_id)
            setMessages((prev) => {
              const updated = [...prev]
              const lastMsg = updated[updated.length - 1]
              if (lastMsg.role === 'ai') {
                updated[updated.length - 1] = {
                  ...lastMsg,
                  streaming: false,
                  metadata: { tool_used: data.tool_used, sources: data.sources },
                }
              }
              return updated
            })
            setIsStreaming(false)
            setToolStatus(null)
            loadConversations()
          },
          onError(err) {
            console.error('Stream error:', err)
            // Fallback to sync
            fallbackSync(userMessage)
          },
        }
      )
      eventSourceRef.current = eventSource
    } catch {
      fallbackSync(userMessage)
    }
  }

  async function fallbackSync(userMessage) {
    try {
      // Remove the empty streaming message
      setMessages((prev) => prev.filter((m) => !m.streaming))
      const res = await sendChatMessage(client.client_id, userMessage, currentConvoId)
      setCurrentConvoId(res.conversation_id)
      setMessages((prev) => [...prev, { role: 'ai', content: res.message.content, metadata: res.message.metadata }])
      loadConversations()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Error al obtener respuesta. Intenta de nuevo.' },
      ])
    } finally {
      setIsStreaming(false)
      setToolStatus(null)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const categorias = profile
    ? profile.preferencias?.categorias || []
    : client.categorias || []

  return (
    <div className="h-screen flex bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        currentConvoId={currentConvoId}
        onSelect={selectConversation}
        onNew={startNewConversation}
        onDelete={handleDeleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition p-1"
            title="Volver"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition p-1 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">{client.nombres}</h2>
            <div className="flex flex-wrap gap-1 mt-1">
              {categorias.map((cat) => (
                <span
                  key={cat}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${CATEGORIA_COLORS[cat] || 'bg-gray-700'}`}
                >
                  {cat.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-600">
                <p className="text-5xl mb-4">🎬</p>
                <p className="text-lg">Pregunta por recomendaciones,</p>
                <p className="text-lg">estrenos o lo que quieras ver</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {toolStatus && (
            <div className="flex items-center gap-2 text-sm text-purple-400 px-3 py-2 bg-purple-500/10 rounded-lg w-fit">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {toolStatus}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 resize-none
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500
                         disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500
                         text-white px-4 py-2.5 rounded-xl transition font-medium shrink-0"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
