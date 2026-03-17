import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../network/socket"; 
import cave from "../assets/lobbybg.png"; 

export default function Map() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"code" | "username">("code");
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("room_created", (data) => {
      setLoading(false);
      navigate("/lobby", { state: { roomData: data } });
    });

    socket.on("lobby_updated", (data) => {
      if (loading) {
        setLoading(false);
        navigate("/lobby", { state: { roomData: data } });
      }
    });

    socket.on("error", (err) => {
      setLoading(false);
      alert(err.message || "Something went wrong");
    });

    return () => {
      socket.off("room_created");
      socket.off("lobby_updated");
      socket.off("error");
    };
  }, [loading, navigate]);

  const handleNextStep = () => {
    if (step === "code" && roomCode.trim() !== "") {
      setStep("username");
    } 
    else if (step === "username" && username.trim() !== "") {
      setLoading(true);
      if (isCreating) {
        socket.emit("create_room", { nickname: username });
      } else {
        socket.emit("join_room", { pin: roomCode, nickname: username });
      }
    }
  };

  const handleCreateTrigger = () => {
    setIsCreating(true);
    setStep("username");
  };

  return (
    <div 
      className="relative w-screen h-screen bg-cover bg-center flex flex-col items-center justify-center font-sans"
      style={{ backgroundImage: `url(${cave})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-fit px-12">
        
        <h1 className="text-white text-6xl font-bold mb-5 tracking-tight text-center whitespace-nowrap">
          {loading ? "connecting..." : (step === "code" ? "Join a room" : "enter your username...")}
        </h1>

        <div className="bg-white w-full rounded-[40px] p-12 shadow-2xl flex flex-col gap-4">
          
          <input
            type="text"
            autoFocus
            disabled={loading}
            placeholder={step === "code" ? "room code!" : "username..."}
            value={step === "code" ? roomCode : username}
            onChange={(e) => step === "code" ? setRoomCode(e.target.value) : setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
            // Using ! to force the text size without changing box height
            className="w-full border-2 border-gray-100 rounded-2xl py-5 px-8 text-center text-gray-400 !text-3xl font-semibold placeholder-gray-200 outline-none focus:border-gray-200 transition-colors disabled:opacity-50"
          />

          <button
            onClick={handleNextStep}
            disabled={loading}
            // !text-4xl forces the font size while py-6 keeps the box height original
            className="w-full bg-[#111] text-white rounded-2xl py-6 !text-3xl font-bold hover:bg-black active:scale-[0.98] transition-all disabled:bg-gray-400 h-20"
          >
            {loading ? "loading..." : "enter"}
          </button>
        </div>

        {step === "code" && !loading && (
          <p className="mt-4 text-white text-xl font-medium">
            or <span onClick={handleCreateTrigger} className="underline cursor-pointer hover:text-gray-200 transition-colors">create</span> one...
          </p>
        )}
      </div>
    </div>
  );
}