import { useState } from "react";
import { Link } from "react-router-dom";

export const Home = () => {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="min-h-screen bg-[#fdfcfb] text-slate-900 font-sans selection:bg-indigo-100">
            {/* Artistic Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-rose-50 rounded-full blur-[100px] opacity-50" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-10 py-6 bg-white/40 backdrop-blur-md border-b border-slate-100">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Draw<span className="text-indigo-600">Dash</span>
                    </h1>
                </Link>

                <Link
                    to="/create"
                    className="rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                    Get Started
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-24">
                <div className="max-w-4xl">
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-900">
                        SKETCH. GUESS. <br />
                        <span className="text-indigo-600 italic">REPEAT.</span>
                    </h2>

                    <p className="mt-8 max-w-xl mx-auto text-slate-500 text-lg md:text-xl font-medium">
                        The premium real-time drawing game. A shared space to 
                        showcase your inner artist—or your hilarious fails.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
                        <Link
                            to="/create"
                            className="rounded-2xl bg-indigo-600 px-10 py-4 font-bold text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            Create Board
                        </Link>

                        <Link
                            to="/join"
                            className="rounded-2xl border border-slate-200 bg-white px-10 py-4 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            Join Board
                        </Link>
                    </div>

                    {/* Simple conditional message from your original code */}
                    <div
                        className={`mt-8 transition-all duration-500 ${
                            hovered
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2"
                        }`}
                    >
                        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">
                            No sign-up. Just pure art.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features - Matching your original data array */}
            <section className="relative z-10 mt-32 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-20">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="group rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-xl mb-6 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                           <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">
                            {f.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            {f.desc}
                        </p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer className="mt-10 py-12 text-center border-t border-slate-50">
                <p className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em]">
                    Designed for artists, not dashboards.
                </p>
            </footer>
        </div>
    );
};

// Kept your original feature content but updated descriptions slightly for the game vibe
const features = [
    {
        title: "Artistic Canvas",
        desc: "A fluid, responsive drawing engine designed for masterpieces and quick doodles.",
    },
    {
        title: "Real-time Guessing",
        desc: "Watch ideas come to life and compete with friends in real-time speed rounds.",
    },
    {
        title: "Creative Focus",
        desc: "A minimal, sleek interface that keeps the focus on the brush strokes.",
    },
];