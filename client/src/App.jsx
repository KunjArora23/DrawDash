import { useState } from 'react'

import './App.css'
import { Home } from './pages/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CreateBoard from './pages/CreateBoard'
import JoinBoard from './pages/JoinBoard'
import Room from './pages/Room'
import { WebSocketProvider } from './context/webSocketProvider'
import { CanvasContextProvider } from './context/canvasContext'


function App() {
  const [count, setCount] = useState(0)

  return (

    <>


      <Router>
        <CanvasContextProvider>
          <WebSocketProvider>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateBoard />} />
              <Route path="/join" element={<JoinBoard />} />
              <Route path="/room/:roomId" element={<Room />} />
            </Routes>
          </WebSocketProvider>
        </CanvasContextProvider>
      </Router>
    </>
  )
}

export default App
