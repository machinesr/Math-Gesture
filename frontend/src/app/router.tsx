import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import ConnectPage from "../features/connect/ConnectPage"
import LobbyPage from "../features/lobby/LobbyPage"
import StageMapPage from "../features/stageMap/StageMapPage"
import BattlePage from "../features/battle/BattlePage"
import ResultsPage from "../features/results/ResultsPage"
import { useRoom } from "./RoomProvider"

// Bounces everyone back to / when the room is cleared (e.g. host left).
function RoomLifecycle() {
  const { roomData, notice } = useRoom()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!roomData && notice && location.pathname !== "/") {
      navigate("/", { replace: true })
    }
  }, [roomData, notice, location.pathname, navigate])

  return null
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RoomLifecycle />
      <Routes>
        <Route path="/"        element={<ConnectPage />} />
        <Route path="/lobby"   element={<LobbyPage />} />
        <Route path="/stage"   element={<StageMapPage />} />
        <Route path="/battle"  element={<BattlePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
