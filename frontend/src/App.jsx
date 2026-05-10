import { useState } from 'react'
import ClientSelector from './components/ClientSelector'
import ChatView from './components/ChatView'

export default function App() {
  const [selectedClient, setSelectedClient] = useState(null)

  if (!selectedClient) {
    return <ClientSelector onSelect={setSelectedClient} />
  }

  return (
    <ChatView
      client={selectedClient}
      onBack={() => setSelectedClient(null)}
    />
  )
}
