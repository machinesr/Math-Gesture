import { BrowserRouter, Routes, Route } from "react-router-dom"

import Battle from "../pages/battle"
import LandingPage from "../pages/landingpage"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/Battle" element={<Battle />} />
        <Route path="/LandingPage" element={<LandingPage />} />

  

      </Routes>
    </BrowserRouter>
  )
}
