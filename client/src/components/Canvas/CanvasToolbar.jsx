import { useEffect } from "react";
import { useCanvasContext } from "../../context/canvasContext";

const CanvasToolbar = () => {
    const {
        tool,
        setTool,
        color,
        setColor,
        strokeWidth,
        setStrokeWidth,
        clearCanvas
    } = useCanvasContext()

    

    useEffect(() => {
        console.log(tool)
        console.log(color)
        console.log(strokeWidth)
    }, [tool, strokeWidth, color])

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl px-6 py-3">

                {/* Pen */}
                <button
                    className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${tool === "pen" ? "bg-white text-2xl shadow-lg scale-110" : "text-white hover:bg-white/10 text-xl"}`}
                    title="Pen"
                    onClick={() => setTool("pen")}
                >
                    ✏️
                </button>

                {/* Eraser */}
                <button
                    className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${tool === "eraser" ? "bg-white text-2xl shadow-lg scale-110" : "text-white hover:bg-white/10 text-xl"}`}
                    title="Eraser"
                    onClick={() => setTool("eraser")}
                >
                    🧽
                </button>

                <div className="h-8 w-px bg-white/10 mx-1" />

                {/* Stroke size */}
                <div className="flex flex-col items-center gap-1 group">
                    <input
                        type="range"
                        min="1"
                        max="12"
                        value={strokeWidth}
                        className="w-24 accent-indigo-500 cursor-pointer"
                        title="Brush Size"
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Size: {strokeWidth}</span>
                </div>

                <div className="h-8 w-px bg-white/10 mx-1" />

                {/* Colors */}
                <div className="flex items-center gap-2">
                    {["#0f172a", "#ef4444", "#22c55e", "#3b82f6", "#f59e0b"].map((c) => (
                        <button
                            key={c}
                            className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-125 ${color === c ? "border-white ring-2 ring-white/20" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                            title={c}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>

                <div className="h-8 w-px bg-white/10 mx-1" />

                {/* Clear */}
                <button
                    className="h-10 px-4 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                    title="Clear Board"
                    onClick={clearCanvas}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default CanvasToolbar;