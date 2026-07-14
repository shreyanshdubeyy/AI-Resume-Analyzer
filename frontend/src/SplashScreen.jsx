function SplashScreen() {
  return (
    <div className="
h-screen
flex
flex-col
justify-center
items-center
text-center
bg-gradient-to-br
from-slate-950
via-blue-950
to-black
px-6
overflow-hidden
relative
">

      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <h1 className="
text-4xl
sm:text-5xl
md:text-7xl
font-extrabold
text-white
text-center
leading-tight
z-10
">
  AI Resume
  <br />
  Analyzer
</h1>

      <p className="
text-gray-400
mt-4
text-sm
sm:text-base
md:text-lg
text-center
z-10
">
  ATS • NLP • LLM • Career Intelligence
</p>

      {/* PROGRESS BAR */}
      <div className="
w-[85%]
max-w-md
h-2
bg-white/10
rounded-full
mt-8
overflow-hidden
z-10
">
        <div className="progress-bar bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full"></div>
      </div>

      <p className="
text-cyan-300
tracking-[4px]
sm:tracking-[8px]
mt-8
text-xs
sm:text-sm
text-center
z-10
">
  INITIALIZING AI CORE...
</p>

    </div>
  );
}

export default SplashScreen;