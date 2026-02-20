import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/webSocketProvider";

export default function JoinBoard() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const { username, setUsername } = useWebSocket();

  const joinRoom = () => {
    if (!username.trim()) {
      alert("Introduce yourself first! What's your artist name?");
      return;
    }
    if (!roomId.trim()) {
      alert("You need a Room ID to join the fun.");
      return;
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] px-4 font-sans relative overflow-hidden">
      {/* Soft Background Glows */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-rose-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-[10%] right-[0%] w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Navigation back to Home */}
        <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-all shadow-lg shadow-indigo-100">
                    <span className="text-white font-bold text-lg">D</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                    Draw<span className="text-indigo-600">Dash</span>
                </h2>
            </Link>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 italic">
              Jump In!
            </h1>
            <p className="text-slate-400 font-medium italic">Enter a room code to start guessing.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                Your Alias
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="The Doodle Master"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                Room Code
              </label>
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. ab123"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 transition-all font-mono font-bold text-lg tracking-wider"
              />
            </div>

            <button
              onClick={joinRoom}
              className="w-full mt-4 bg-indigo-600 hover:bg-slate-900 active:scale-[0.98] py-4 rounded-2xl font-bold text-white shadow-xl shadow-indigo-100 hover:shadow-slate-200 transition-all duration-300"
            >
              Enter Studio
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
             <Link to="/create" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                Wait, I want to host my own room
             </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
           Collaborative Art Engine v1.0
        </p>
      </div>
    </div>
  );
}