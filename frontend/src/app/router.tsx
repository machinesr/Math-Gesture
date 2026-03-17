import { BrowserRouter, Routes, Route } from "react-router-dom"

import Battle from "../pages/battle"
import LandingPage from "../pages/landingpage"
import Lobby from "../pages/lobby"
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/Battle" element={<Battle />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/Lobby" element={<Lobby />} />
  

      </Routes>
    </BrowserRouter>
  )
}
