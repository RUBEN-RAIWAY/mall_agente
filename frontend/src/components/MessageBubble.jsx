export default function MessageBubble({ message }) {
  const isHuman = message.role === 'human'

  return (
    <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isHuman
            ? 'bg-purple-600 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-100 rounded-bl-md'
        }`}
      >
        {!isHuman && (
          <p className="text-[10px] text-purple-400 font-medium mb-1">Centro Comercial Bot</p>
        )}
        <div className="markdown-content text-sm whitespace-pre-wrap break-words">
          {formatContent(message.content)}
        </div>
        {message.streaming && (
          <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
        )}
        {message.metadata?.tool_used && (
          <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Se usaron herramientas de búsqueda
          </p>
        )}
      </div>
    </div>
  )
}

function formatContent(text) {
  if (!text) return null
  // Simple bold formatting
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}
