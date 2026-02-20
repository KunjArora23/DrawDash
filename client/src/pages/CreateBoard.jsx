import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/webSocketProvider';
import api from '../api/api';

function CreateBoard() {
  const navigate = useNavigate()
  const { username, setUsername } = useWebSocket()

  const generateRoomId = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";

    let id = "";

    // 2 letters
    id += letters[Math.floor(Math.random() * letters.length)];
    id += letters[Math.floor(Math.random() * letters.length)];

    // 3 numbers
    id += numbers[Math.floor(Math.random() * numbers.length)];
    id += numbers[Math.floor(Math.random() * numbers.length)];
    id += numbers[Math.floor(Math.random() * numbers.length)];

    return id;
  };

  const createRoom = async() => {
    // Basic validation to make it feel more "human-built"
    if (!username.trim()) {
      alert("Enter a cool artist name first!");
      return;
    }


    const roomId = generateRoomId()

    try {
      const res =await api.post(`/api/v1/create_room`, {
        room_id: roomId,
        creator: username
      })

      console.log(res)

    } catch (error) {
      console.error("Error occured while creating room ", error)
    }




    navigate(`/room/${roomId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] px-4 font-sans relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header for consistency */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Draw<span className="text-indigo-600">Dash</span>
            </h2>
          </Link>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
              Start a Game
            </h1>
            <p className="text-slate-400 font-medium">Set your stage and invite your friends.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                Artist Name
              </label>
              <input
                placeholder="e.g. Picasso_23"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button
              onClick={createRoom}
              className="group w-full bg-slate-900 hover:bg-indigo-600 active:scale-[0.98] py-4 rounded-2xl font-bold text-white shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Private Room</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Already have a code?</span>
            <Link to="/join" className="text-indigo-600 font-bold hover:underline decoration-2 underline-offset-4">
              Join instead
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
          Step into the studio.
        </p>
      </div>
    </div>
  );
}

export default CreateBoard;