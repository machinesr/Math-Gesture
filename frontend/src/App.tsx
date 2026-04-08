import AppRouter from "./app/router"
import { RoomProvider } from "./app/RoomProvider"
import { CameraProvider } from "./app/CameraProvider"

function App() {
  return (
    <RoomProvider>
      <CameraProvider>
        <AppRouter />
      </CameraProvider>
    </RoomProvider>
  )
}

export default App
