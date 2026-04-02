export function HeroSection() {
  return (
    <div className="relative text-center mb-16 py-16 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-4 left-1/4 -translate-x-1/2 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 right-1/4 translate-x-1/2 w-64 h-64 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
          ✦ Nơi chia sẻ kiến thức
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          mylink
          <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
            -blog
          </span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Chia sẻ kiến thức, kinh nghiệm và những điều thú vị về công nghệ, cuộc sống
        </p>
      </div>
    </div>
  )
}
