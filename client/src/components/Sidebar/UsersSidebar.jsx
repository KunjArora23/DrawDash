const UsersSidebar = ({
  usersData,
  scores = {},
  currentDrawer = "",
  currentUsername = "",
  gameStatus = "waiting",
}) => {

  if (!usersData || !usersData.users || usersData.users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
        No players yet
      </div>
    );
  }

  const { users, admin } = usersData;

  return (
    <div className="h-full w-full flex flex-col bg-white">
      
      <div className="p-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex justify-between">
        <span>Players</span>
        <span>{users.length} Online</span>
      </div>

      <ul className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {users.map((user, index) => {

          const isAdmin = user === admin;
          const isDrawing =
            gameStatus === "playing" &&
            currentDrawer &&
            user.toLowerCase() === currentDrawer.toLowerCase();
          const isCurrentUser =
            currentUsername &&
            user.toLowerCase() === currentUsername.toLowerCase();
          const roleLabel =
            gameStatus !== "playing"
              ? "Waiting"
              : isDrawing
                ? "Drawing"
                : "Guessing";

          return (
            <li
              key={index}
              className={`group flex items-center justify-between p-3 rounded-2xl border shadow-sm transition
              ${isDrawing
                ? "bg-amber-50 border-amber-200"
                : isCurrentUser
                  ? "bg-sky-50 border-sky-200"
                  : isAdmin
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50/50 border-slate-100"}
              `}
            >
              <div className="flex items-center gap-3">
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white
                  ${isDrawing
                    ? "bg-amber-500"
                    : isCurrentUser
                      ? "bg-sky-500"
                      : isAdmin
                        ? "bg-emerald-500"
                        : "bg-indigo-500"}
                `}>
                  {user.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${
                    isDrawing
                      ? "text-amber-700"
                      : isCurrentUser
                        ? "text-sky-700"
                        : "text-slate-700"
                  }`}>
                    {isCurrentUser ? `${user} (You)` : user}
                  </span>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      gameStatus !== "playing"
                        ? "text-slate-500"
                        : isDrawing
                          ? "text-amber-600"
                          : "text-sky-600"
                    }`}>
                      {roleLabel}
                    </span>
                  </div>
                </div>

              </div>

              <span className="text-sm font-black text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 min-w-12 text-center">
                {scores[user] ?? 0}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UsersSidebar;