import { useState, useEffect } from 'react'
import { fetchClients } from '../api'

const GENERO_ICON = {
  M: '👨',
  F: '👩',
}

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

export default function ClientSelector({ onSelect }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
            Centro Comercial Bot
          </h1>
          <p className="text-gray-400 mt-2">Selecciona un cliente para comenzar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <button
              key={client.client_id}
              onClick={() => onSelect(client)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left
                         hover:border-purple-500/50 hover:bg-gray-900/80 transition-all
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{GENERO_ICON[client.genero] || '🧑'}</span>
                <div>
                  <h3 className="font-semibold text-white">{client.nombres}</h3>
                  <p className="text-xs text-gray-500">{client.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1.5">Preferencias</p>
              <div className="flex flex-wrap gap-1.5">
                {client.categorias.map((cat) => (
                  <span
                    key={cat}
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${CATEGORIA_COLORS[cat] || 'bg-gray-700'}`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
