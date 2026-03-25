const TopBar = ({ 
  roomId, 
  onLeave, 
  onToggleUsers, 
  onToggleChat, 
  timer, 
  currentRound,
  totalRounds,
  currentDrawer,
  isDrawer,
  username,
  gameStatus,
  currentWord, 
  isAdmin,      // New prop to check if user is admin
  onStartGame   // New function prop to trigger backend start logic
}) => {

  const drawerName = currentDrawer || "-";
  const roleText =
    gameStatus !== "playing"
      ? "Waiting"
      : isDrawer
        ? "You are Drawing"
        : "You are Guessing";

  const displayName =
    username && currentDrawer && username.toLowerCase() === currentDrawer.toLowerCase()
      ? "You"
      : drawerName;

  
  return (
    <div className="h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-start gap-0">
          <h2 className="text-xl font-black tracking-tight text-slate-800">
            Draw<span className="text-indigo-600 italic">Dash</span>
          </h2>
          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">ROOM: {roomId}</span>
        </div>
      </div>

      {/* GAME STATUS CENTER */}
      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-6">
          {/* Timer Badge */}
          <div className="bg-slate-900 text-white px-4 py-1.5 rounded-2xl font-mono font-bold text-lg shadow-xl shadow-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            {timer ?? "00"}s
          </div>

          {/* Round Display */}
          <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl text-sm font-black uppercase tracking-wider border border-emerald-100">
            Round {currentRound ?? 1}/{totalRounds ?? 5}
          </div>

          <div className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-2xl text-sm font-black uppercase tracking-wider border border-amber-100">
            Drawing: <span className="text-amber-900">{displayName}</span>
          </div>

          <div className="bg-sky-50 text-sky-700 px-4 py-1.5 rounded-2xl text-sm font-black uppercase tracking-wider border border-sky-100">
            {roleText}
          </div>

          {/* Word Display */}
          <div className="text-2xl font-black tracking-[0.4em] uppercase text-slate-700 bg-slate-50 px-6 py-1.5 rounded-2xl border border-slate-100">
            {currentWord ?? "_ _ _ _ _"}
          </div>

          {/* Admin Action: Start Game Button */}
          {isAdmin && !currentWord && (
            <button
              onClick={onStartGame}
              className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              Start Game
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop Hint */}
        <div className="hidden lg:block text-right mr-4">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Artist Mode</p>
           <p className="text-xs font-bold text-slate-500 italic">Active</p>
        </div>

        <button onClick={onToggleUsers} className="md:hidden px-4 py-2 text-xs font-bold uppercase bg-slate-50 text-slate-600 rounded-xl border border-slate-100">Artists</button>
        <button onClick={onToggleChat} className="md:hidden px-4 py-2 text-xs font-bold uppercase bg-slate-50 text-slate-600 rounded-xl border border-slate-100">Chat</button>
        <button onClick={onLeave} className="ml-2 px-5 py-2 text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm">Exit</button>
      </div>
    </div>
  );
};

export default TopBar;