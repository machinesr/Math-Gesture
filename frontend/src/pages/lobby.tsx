import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../network/socket";
import PlayerCharacter from "../components/playermodelleft";
import ReadyButton from "../components/ReadyButton";


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
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(() => {})
  }, [])

  useEffect(() => {
    socket.on("lobby_updated", (data) => {
      setRoomData(data);
    });

   
    const handleStartSequence = (data: any) => {

      setIsStarting(true);
      
  
      setTimeout(() => {
   
        navigate("/Map", { state: { roomData: data || roomData } }); 
      }, 3000);
    };

    
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
        className={`absolute top-[18%] left-1/2 -translate-x-1/2 backdrop-blur-md border border-white/10 rounded-[40px] py-[clamp(1.5rem,4vh,5rem)] flex flex-col items-center w-[90vw] max-w-5xl shadow-2xl z-20 transition-all duration-700 ${
          isStarting ? "bg-green-500/30 border-green-400/40 scale-105" : "bg-black/40"
        }`}
      >
        <h1 className="text-white text-[clamp(1.5rem,4.5vw,5.5rem)] font-bold tracking-tight mb-[clamp(0.5rem,1.5vh,1.5rem)] text-center w-full px-4">
          {isStarting ? "Starting Game..." : "waiting for everyone to ready up..."}
        </h1>
        <p className="text-white/80 text-[clamp(0.875rem,1.75vw,2rem)] font-medium">
          {isStarting ? "Get ready!" : `code : ${roomData?.pin || "----"}`}
        </p>
      </div>

      {/* Player Grid */}
      <div className="absolute bottom-[clamp(1.5rem,4vh,5rem)] w-full px-[clamp(1rem,2.5vw,2.5rem)] flex justify-center gap-[clamp(1rem,2.5vw,3.5rem)]">
        {[0, 1, 2, 3].map((index) => {
          const p: any = players[index];
          const isOccupied = !!p;
          const isReady = isOccupied && p.is_ready;

          return (
            <div key={index} className="flex flex-col items-center w-[clamp(8rem,14vw,20rem)]">
              <div className="bg-black/30 backdrop-blur-sm px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.25rem,0.75vh,0.75rem)] rounded-xl mb-[clamp(0.75rem,2vh,1.5rem)] w-full text-center border border-white/5">
                <p
                  className={`text-[clamp(0.75rem,1.25vw,1.5rem)] font-semibold truncate transition-colors duration-300 ${
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