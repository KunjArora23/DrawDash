import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/webSocketProvider";

import UsersSidebar from "../components/Sidebar/UsersSidebar";
import ChatMessages from "../components/Chat/ChatMessages";
import ChatInput from "../components/Chat/ChatInput";
import TopBar from "../components/Layout/TopBar";
import CanvasBoard from "../components/Canvas/CanvasBoard";
import VideoOverlay from "../components/Video/VideoOverlay";
import CanvasToolbar from "../components/Canvas/CanvasToolbar";


const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState("");

  const [showUsers, setShowUsers] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const timer = 60



  const {
    username,
    users,
    connect,
    leaveRoom,
    messages,
    sendChat,
    usersData,
    startGame,
    gameState
  } = useWebSocket();


  console.log("Room data in room.jsx", usersData)

  useEffect(() => {
    if (!username) {
      // Redirect if they try to access the room without a name
      navigate("/create");
      return;
    };
    console.log("Room Id in room file ", roomId, "username", username)
    connect(roomId, username)

  }, [username, navigate, roomId, connect]);

  const leaveRoomHandler = () => {
    // if(window.confirm("Are you sure you want to leave the gallery?")) {
    leaveRoom();
    navigate("/create");
    // }
  };

  const sendMessageHandler = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    sendChat(currentMessage);
    setCurrentMessage("");
  };

  const startGameHandler = () => {
    startGame()
  }

  const currentWord = gameState?.currentWord || ""
  const isAdmin =
    username &&
    usersData?.admin &&
    username.toLowerCase() === usersData.admin.toLowerCase();

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] text-slate-900 font-sans">
      {/* Top Bar - Elevated & Slim */}
      <div className="relative z-30 shadow-sm">
        <TopBar
          roomId={roomId}
          onLeave={leaveRoomHandler}
          onToggleUsers={() => setShowUsers(true)}
          onToggleChat={() => setShowChat(true)}
          timer={timer}
          currentWord={currentWord}
          isAdmin={isAdmin}
          onStartGame={startGameHandler}
        />
      </div>

      {/* Main Game Arena */}
      <div className="flex flex-1 relative overflow-hidden p-3 gap-3">

        {/* Left Sidebar: Scoreboard/Users (Desktop) */}
        <div className="hidden lg:block w-72 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Artists</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <UsersSidebar usersData={usersData} />
            </div>
          </div>
        </div>

        {/* Center: The Canvas (The Star of the Show) */}
        <main className="flex-1 relative bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-indigo-100/20 overflow-hidden flex flex-col">
          {/* Subtle Canvas Header */}


          <div className="flex-1 relative">
            <CanvasBoard />
            <CanvasToolbar />
            <VideoOverlay />
          </div>
        </main>

        {/* Right Sidebar: Chat & Guesses (Desktop) */}
        <aside className="hidden md:flex w-80 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Live Chat</h3>
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatMessages messages={messages} />
            <div className="p-4 bg-slate-50/50">
              <ChatInput
                value={currentMessage}
                onChange={setCurrentMessage}
                onSend={sendMessageHandler}
              />
            </div>
          </div>
        </aside>

        {/* ================= MOBILE DRAWERS (Redesigned) ================= */}

        {/* Mobile Users Drawer */}
        {showUsers && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowUsers(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-right flex flex-col rounded-r-[2rem]">
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <span className="font-bold text-slate-400">Scores</span>
                <button onClick={() => setShowUsers(false)} className="text-slate-300 hover:text-slate-900">✕</button>
              </div>
              <UsersSidebar users={users} />
            </div>
          </div>
        )}

        {/* Mobile Chat Drawer */}
        {showChat && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowChat(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-[85%] bg-white shadow-2xl animate-slide-left flex flex-col rounded-l-[2rem]">
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <span className="font-bold text-slate-400">The Guessing Box</span>
                <button onClick={() => setShowChat(false)} className="text-slate-300 hover:text-slate-900">✕</button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <ChatMessages messages={messages} />
                <div className="p-4 border-t border-slate-50">
                  <ChatInput
                    value={currentMessage}
                    onChange={setCurrentMessage}
                    onSend={sendMessageHandler}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;