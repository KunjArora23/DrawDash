const ChatInput = ({ value, onChange, onSend }) => {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSend(e); }}
      className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your guess here..."
        className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all"
      />
      <button
        type="submit"
        className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:-rotate-6 transition-all active:scale-90 shadow-lg shadow-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
};
export default ChatInput;
