function SplashScreen() {
  return (
    <div className="h-screen flex flex-col justify-center items-center
    bg-gradient-to-br from-slate-950 via-blue-950 to-black relative overflow-hidden">

      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-wider z-10">
        AI Resume Analyzer
      </h1>

      <p className="text-gray-400 mt-4 text-lg z-10">
        ATS • NLP • LLM • Career Intelligence
      </p>

      {/* PROGRESS BAR */}
      <div className="w-80 md:w-96 h-2 bg-white/10 rounded-full mt-8 overflow-hidden backdrop-blur-sm z-10">
        <div className="progress-bar bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full"></div>
      </div>

      <p className="text-cyan-300 tracking-[10px] mt-8 text-sm font-semibold animate-pulse z-10">
        INITIALIZING AI CORE...
      </p>

    </div>
  );
}

export default SplashScreen;