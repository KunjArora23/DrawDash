const ChatMessages = ({ messages }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-[#fafbfc]">
        {messages.map((msg, index) => {
          // Detect if message is a system notification for a correct guess
          const isCorrect = msg.includes("guessed the word") || msg.includes("Correct!");
          
          return (
            <div key={index} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className={`inline-block w-full px-4 py-2 rounded-2xl text-sm font-medium shadow-sm border ${
                isCorrect 
                ? "bg-emerald-500 text-white border-emerald-400" 
                : "bg-white text-slate-600 border-slate-100"
              }`}>
                  {msg}
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default ChatMessages;