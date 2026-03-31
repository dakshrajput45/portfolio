/* eslint-disable react-hooks/purity */
"use client";

export default function Home() {

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow opacity-30">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 h-[200%] w-[200%] animate-spin-reverse opacity-30">
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-3xl"></div>
        </div>
      </div>

      {/* Profile Photo - Top Right */}
      <div className="absolute top-8 right-8 animate-fade-in-scale z-20 hidden md:block" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="profile-frame-top">
          <div className="profile-image-container-top">
            <img
              src="/dp.jpeg"
              alt="Daksh Rajput"
              width={250}
              height={250}
              className="profile-image"
            />
          </div>
          <div className="profile-badge">
            <p className="text-base font-bold text-white">Daksh Rajput</p>
          </div>
        </div>
      </div>

      {/* Profile Photo - Mobile (Top Center) */}
      <div className="absolute top-6 left-3/4 -translate-x-1/2 animate-fade-in-scale z-20 md:hidden" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="profile-frame-mobile-round">
          <div className="profile-image-container-mobile-round">
            <img
              src="/dp.jpeg"
              alt="Daksh Rajput"
              width={100}
              height={100}
              className="profile-image"
            />
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            // eslint-disable-next-line react-hooks/purity
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        >
          <div 
            className="h-2 w-2 rounded-full bg-white"
            style={{
              transform: `scale(${0.5 + Math.random()})`,
            }}
          ></div>
        </div>
      ))}

      {/* Main Content - Centered */}
      <div className="relative z-10 flex items-center justify-center text-center px-4 w-full h-full">
        {/* Rotating Ring */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="h-[300px] w-[300px] md:h-[500px] md:w-[500px] animate-spin-slow rounded-full border-4 border-dashed border-pink-300/30"></div>
        </div>
        
        {/* Pulsing Ring */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="h-[240px] w-[240px] md:h-[400px] md:w-[400px] animate-pulse-slow rounded-full border-2 border-purple-300/20"></div>
        </div>

        {/* Hi Cutie with Emoji - Hover Animation - Absolutely Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in-scale group cursor-pointer">
          <h1 className="font-sans text-4xl sm:text-7xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text flex items-center gap-3 md:gap-4 transition-transform duration-300 group-hover:scale-110 whitespace-nowrap">
            Hi cutie 💖
          </h1>
        </div>
      </div>

      {/* Bottom Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-pink-500/30 animate-wave"
          ></path>
        </svg>
      </div>

      {/* Bottom Footer Links */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 px-4">
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="text-sm md:text-base font-light text-gray-400 italic">Building at 4 AM ☕</p>
        </div>

        <div className="animate-fade-in-scale" style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="text-xs md:text-sm text-gray-300 text-center">
            Meanwhile, check out my{" "}
            <a 
              href="https://www.linkedin.com/in/dakshr264/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
