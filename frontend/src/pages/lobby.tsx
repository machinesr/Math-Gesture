import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../network/socket";
import PlayerCharacter from "../components/playermodelleft";
import ReadyButton from "../components/ReadyButton";

// Assets
import red from "../assets/red.png";
import blue from "../assets/blue.png";
import purple from "../assets/pink.png"; 
import green from "../assets/green.png";
import lobbyBg from "../assets/lobbybg.png";

export default function Lobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState<any>(location.state?.roomData || null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    socket.on("lobby_updated", (data) => {
      setRoomData(data);
    });

    // Unified Start Logic
    const handleStartSequence = (data: any) => {
      // 1. Update the state to trigger "Starting Game..." text & green glow
      setIsStarting(true);
      
      // 2. Start the 3-second hype timer
      setTimeout(() => {
        // 3. Navigate to /map (passing the latest data)
        navigate("/Map", { state: { roomData: data || roomData } }); 
      }, 3000);
    };

    // Listen for the backend signals
    socket.on("all_players_ready", handleStartSequence);
    socket.on("game_started", handleStartSequence);

    return () => {
      socket.off("lobby_updated");
      socket.off("all_players_ready");
      socket.off("game_started");
    };
  }, [navigate, roomData]);

  const handleReadyToggle = (isReady: boolean) => {
    socket.emit("player_ready", { 
      pin: roomData?.pin, 
      ready: isReady 
    });
  };

  const players = roomData?.players ? Object.values(roomData.players) : [];
  const sprites = [red, blue, purple, green];

  return (
    <div 
      className="relative w-screen h-screen bg-cover bg-center overflow-hidden flex flex-col items-center font-sans"
      style={{ backgroundImage: `url(${lobbyBg})` }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Top Right Ready Action */}
      {!isStarting && <ReadyButton onToggle={handleReadyToggle} />}

      {/* Main Status Header */}
      <div 
        className={`absolute top-[18%] left-1/2 -translate-x-1/2 backdrop-blur-md border border-white/10 rounded-[40px] py-16 flex flex-col items-center w-[1144px] max-w-none shadow-2xl z-20 transition-all duration-700 ${
          isStarting ? "bg-green-500/30 border-green-400/40 scale-105" : "bg-black/40"
        }`}
      >
        <h1 className="text-white text-7xl font-bold tracking-tight mb-4 whitespace-nowrap text-center w-full">
          {isStarting ? "Starting Game..." : "waiting for everyone to ready up..."}
        </h1>
        <p className="text-white/80 text-3xl font-medium">
          {isStarting ? "Get ready!" : `code : ${roomData?.pin || "----"}`}
        </p>
      </div>

      {/* Player Grid */}
      <div className="absolute bottom-20 w-full px-20 flex justify-center gap-10">
        {[0, 1, 2, 3].map((index) => {
          const p: any = players[index];
          const isOccupied = !!p;
          const isReady = isOccupied && p.is_ready;

          return (
            <div key={index} className="flex flex-col items-center w-64">
              <div className="bg-black/30 backdrop-blur-sm px-6 py-2 rounded-xl mb-5 w-full text-center border border-white/5">
                <p 
                  className={`text-2xl font-semibold truncate transition-colors duration-300 ${
                    isReady ? "text-[#71C58E]" : "text-white"
                  }`}
                >
                  {isOccupied ? p.nickname : "waiting..."}
                </p>
              </div>

              <div className={isOccupied ? "opacity-100" : "opacity-40 grayscale-[0.5]"}>
                <PlayerCharacter 
                  name="" 
                  sprite={sprites[index]} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}