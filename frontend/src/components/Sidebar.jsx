export default function Sidebar({ open, conversations, currentConvoId, onSelect, onNew, onDelete, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-72 bg-gray-900 border-r border-gray-800
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-300">Conversaciones</h3>
          <button
            onClick={onNew}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
          >
            + Nueva
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">Sin conversaciones</p>
          )}

          {conversations.map((convo) => (
            <div
              key={convo.conversation_id}
              className={`group rounded-lg px-3 py-2.5 cursor-pointer transition
                ${convo.conversation_id === currentConvoId
                  ? 'bg-purple-600/20 border border-purple-500/30'
                  : 'hover:bg-gray-800 border border-transparent'
                }`}
              onClick={() => onSelect(convo.conversation_id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-300 truncate flex-1">
                  {convo.last_message || 'Conversación vacía'}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(convo.conversation_id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400
                             transition text-xs shrink-0"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                {convo.message_count} mensajes
              </p>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
