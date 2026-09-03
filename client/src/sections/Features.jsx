import React, { memo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Flame, Camera, Cloud, Bell, LayoutDashboard, FileText, Map, History, Users, ArrowRight, ShieldCheck, MapPin, Navigation } from 'lucide-react';

// ==========================================
// VISUAL COMPONENTS (MINI UI ILLUSTRATIONS)
// ==========================================

const AQIVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center opacity-90 pointer-events-none group-hover:scale-[1.05] group-hover:-translate-y-2 transition-all duration-700 pb-2">
       <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center">
          
          {/* Subtle blue pulse expanding from center */}
          {isInView && (
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0, 0.2, 0] }} 
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute inset-0 bg-primary rounded-full blur-xl transform-gpu" 
            />
          )}

          <svg viewBox="0 0 192 192" className="w-full h-full transform -rotate-90 drop-shadow-xl relative z-10 overflow-visible">
            <defs>
              <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2F80ED" />
                <stop offset="100%" stopColor="#6FC8FF" />
              </linearGradient>
            </defs>
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/80" />
            
            {/* Animated gauge fill with flowing gradient */}
            <motion.circle 
              cx="96" cy="96" r="80" 
              stroke="url(#aqiGrad)" strokeWidth="12" fill="transparent" strokeLinecap="round"
              strokeDasharray={502} 
              initial={{ strokeDashoffset: 502 }}
              animate={isInView ? { strokeDashoffset: 150 } : { strokeDashoffset: 502 }} 
              transition={{ duration: 1.2, ease: "easeOut" }} 
              className="drop-shadow-[0_0_15px_rgba(47,128,237,0.6)]" 
            />
            
            {/* Glowing dot traveling around circumference */}
            <motion.g 
              initial={{ rotate: 0 }}
              animate={isInView ? { rotate: 252.7 } : { rotate: 0 }} 
              style={{ originX: "96px", originY: "96px" }} 
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
               <circle cx="176" cy="96" r="6" fill="#ffffff" className="drop-shadow-[0_0_15px_#ffffff]" />
            </motion.g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 mt-1">
             <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest mb-0.5">Live AQI</span>
             
             <motion.span 
               animate={isInView ? { scale: [1, 1.03, 1] } : { scale: 1 }} 
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} 
               className="text-[36px] font-black text-primary leading-none tracking-tighter"
             >
               42
             </motion.span>
             
             {/* Badge */}
             <motion.span 
               initial={{ opacity: 0, scale: 0.5, y: 10 }}
               animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 10 }} 
               transition={{ duration: 0.4, delay: 0.8, type: "spring", bounce: 0.4 }} 
               className="text-[8px] font-bold text-green-500 uppercase mt-0.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20"
             >
                Good
             </motion.span>
          </div>
       </div>

       {/* Sequentially animating bar chart */}
       <div className="w-full h-8 mt-3 flex items-end gap-1 px-4">
          {[20, 25, 40, 30, 45, 35, 42, 50, 42].map((h, i) => (
             <motion.div 
               key={i} 
               initial={{ height: "10%" }}
               animate={isHovered && isInView ? { height: ["10%", `${h}%`, `${Math.max(10, h-10)}%`, `${h}%`] } : { height: `${h}%` }} 
               transition={isHovered && isInView ? { duration: 2, delay: i * 0.08, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }} 
               className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm" 
             />
          ))}
       </div>
    </div>
  );
});

AQIVisual.displayName = 'AQIVisual';

// Optimized smoke particles (5 well-distributed particles instead of 10)
const smokeOffsets = [
  { x: 0, delay: 0, duration: 3.2 },
  { x: 14, delay: 0.6, duration: 3.4 },
  { x: -16, delay: 1.2, duration: 3.6 },
  { x: 10, delay: 1.8, duration: 3.3 },
  { x: -12, delay: 2.4, duration: 3.5 },
];

const AISmokeVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center opacity-95 pointer-events-none group-hover:scale-[1.05] group-hover:-translate-y-2 transition-all duration-700">
      {/* Container simulating a Live Camera Monitor */}
      <div className="relative w-[95%] h-[95%] bg-gradient-to-t from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50">
        
        {/* Badges on the feed */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30">
          <div className="flex items-center gap-1.5 bg-black/85 px-2 py-1 rounded border border-white/10">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[7px] text-white font-bold tracking-widest uppercase">Live Camera Feed</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-950/85 px-2 py-1 rounded border border-primary/30">
            <Activity className="w-3 h-3 text-primary" />
            <span className="text-[7px] text-primary font-bold tracking-widest uppercase">Monitoring...</span>
          </div>
        </div>

        {/* Modern Vector Industrial Skyline */}
        <div className="absolute bottom-0 w-full h-[65%] flex items-end px-3 gap-[3px] opacity-90">
          
          {/* Building 1 (Left, tall modern factory structure) */}
          <div className="w-[30%] h-[90%] bg-gradient-to-b from-[#1a2235] to-gray-900 border-t border-l border-r border-primary/40 rounded-t-sm relative flex flex-col shadow-[0_0_20px_rgba(47,128,237,0.15)] z-10">
             <div className="absolute top-[-8px] left-[10%] w-[80%] h-[8px] border-t border-l border-r border-primary/30 bg-[#151b2b]"></div>
             <div className="absolute top-[-20px] left-[20%] w-[12px] h-[12px] bg-[#1a2235] border-t border-l border-r border-primary/50"></div>
             <div className="w-full h-full flex flex-col gap-1.5 p-1.5 mt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full flex-1 border-b border-primary/20 flex gap-1.5 justify-center items-center pb-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={`b1-${i}-${j}`} className="w-2 h-3 bg-primary/60 rounded-[1px]" style={{ opacity: 0.2 + ((i + j) % 5) * 0.15 }}></div>
                    ))}
                  </div>
                ))}
             </div>
          </div>

          {/* Building 2 (Main industrial plant with main exhaust stack) */}
          <div className="w-[45%] h-[60%] bg-gradient-to-b from-[#1c2539] to-gray-900 border-t border-l border-r border-primary/40 rounded-t-sm relative flex flex-col shadow-[0_0_20px_rgba(47,128,237,0.15)] z-20">
             {/* Main Chimney where smoke emerges */}
             <div className="absolute top-[-50px] left-[25%] w-[18px] h-[50px] bg-gradient-to-t from-[#1c2539] to-[#252f48] border-t border-l border-r border-primary/50 rounded-t-[2px]">
                <div className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>
             </div>
             <div className="absolute top-[-25px] left-[65%] w-[10px] h-[25px] bg-[#1c2539] border-t border-l border-r border-primary/30"></div>
             
             <div className="absolute top-2 right-2 w-[40%] h-[12px] border border-primary/30 bg-black/30 flex items-center justify-between px-1">
               <div className="w-[2px] h-full bg-primary/30" />
               <div className="w-[2px] h-full bg-primary/30" />
               <div className="w-[2px] h-full bg-primary/30" />
             </div>

             <div className="w-full h-full mt-6 grid grid-cols-4 gap-1 p-2">
                {[...Array(12)].map((_, i) => (
                  <div key={`b2-${i}`} className="w-full h-3.5 bg-primary/50 rounded-[1px]" style={{ opacity: 0.3 + (i % 4) * 0.18 }}></div>
                ))}
             </div>
          </div>

          {/* Building 3 (Right, low-profile facility) */}
          <div className="w-[25%] h-[75%] bg-gradient-to-b from-[#181f30] to-gray-900 border-t border-l border-r border-primary/40 rounded-t-sm relative flex flex-col shadow-[0_0_20px_rgba(47,128,237,0.15)] z-10">
             <div className="absolute top-[-12px] left-0 w-full h-[12px] bg-[#181f30] border-t border-primary/50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 80% 0, 0 0)' }}></div>
             <div className="w-full h-full flex flex-col justify-around p-2 mt-1">
                {[...Array(6)].map((_, i) => (
                  <div key={`b3-${i}`} className="w-full h-[2px] bg-primary/60 rounded-full" style={{ opacity: 0.3 + (i % 3) * 0.25 }}></div>
                ))}
             </div>
          </div>
        </div>
        
        {/* Smoke particles (GPU-accelerated, no mix-blend-screen) */}
        {isInView && smokeOffsets.map((smoke, i) => (
          <motion.div
            key={`smoke-${i}`}
            animate={{ y: [-20, -140], x: [0, smoke.x], opacity: [0, 0.7, 0], scale: [1, 3.5] }}
            transition={{ duration: smoke.duration, repeat: Infinity, delay: smoke.delay }}
            className="absolute top-[25%] left-[40%] w-8 h-8 bg-gradient-to-t from-gray-400/80 to-gray-300/40 rounded-full blur-[6px] transform-gpu pointer-events-none"
          />
        ))}
        
        {/* Blue AI Bounding Box (Aligned to smoke plume) */}
        <motion.div 
          animate={isInView ? { 
            opacity: [0.6, 1, 0.6], 
            scale: [0.99, 1.02, 0.99],
            x: [0, 4, -2, 0],
            y: [0, -3, 2, 0]
          } : { opacity: 0.8 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[33%] w-[100px] h-[140px] border-[1.5px] border-primary bg-primary/10 z-20 shadow-[0_0_15px_rgba(47,128,237,0.2)] transform-gpu"
        >
          {/* Label Attached ABOVE */}
          <div className="absolute -top-[22px] left-[-1.5px] text-[7px] text-primary font-black bg-blue-900 px-2 py-1 flex items-center gap-1.5 border border-primary/50 shadow-md uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Smoke Detected
          </div>

          {/* Localized Scanning Line (GPU translated) */}
          {isInView && (
            <motion.div
              animate={{ y: [0, 138, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-0 w-full h-[1.5px] bg-accent shadow-[0_0_12px_#6FC8FF] transform-gpu"
            />
          )}

          {/* Confidence Badge INSIDE Bottom Right */}
          <div className="absolute bottom-1 right-1 text-[8px] text-white font-black bg-primary px-1.5 py-0.5 rounded-sm shadow-md">
            98% Conf
          </div>

          {/* Bounding box corners */}
          <div className="absolute top-[-2px] left-[-2px] w-3 h-3 border-t-[3px] border-l-[3px] border-primary" />
          <div className="absolute top-[-2px] right-[-2px] w-3 h-3 border-t-[3px] border-r-[3px] border-primary" />
          <div className="absolute bottom-[-2px] left-[-2px] w-3 h-3 border-b-[3px] border-l-[3px] border-primary" />
          <div className="absolute bottom-[-2px] right-[-2px] w-3 h-3 border-b-[3px] border-r-[3px] border-primary" />
        </motion.div>
        
        {/* Tiny AI Processing indicator on the side */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-70">
           <div className="flex gap-0.5">
             <motion.div animate={isInView ? { scaleY: [0.5, 1.2, 0.5] } : { scaleY: 1 }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-3 bg-primary rounded-full origin-bottom transform-gpu" />
             <motion.div animate={isInView ? { scaleY: [0.4, 1.4, 0.4] } : { scaleY: 1 }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-3 bg-primary rounded-full origin-bottom transform-gpu" />
             <motion.div animate={isInView ? { scaleY: [0.5, 1.0, 0.5] } : { scaleY: 1 }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-3 bg-primary rounded-full origin-bottom transform-gpu" />
           </div>
           <span className="text-[6px] text-white font-mono uppercase ml-1">Processing</span>
        </div>
      </div>
    </div>
  );
});

AISmokeVisual.displayName = 'AISmokeVisual';

// Optimized smoke particles (4 well-distributed particles instead of 8)
const evidenceSmokeOffsets = [
  { x: 0, delay: 0, duration: 3.5 },
  { x: 14, delay: 0.8, duration: 3.8 },
  { x: -15, delay: 1.6, duration: 4.0 },
  { x: 12, delay: 2.4, duration: 3.6 },
];

const EvidenceVisual = memo(({ isHovered, isInView = true }) => (
  <div className="relative w-[95%] h-[95%] bg-gray-900 rounded-2xl border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden group-hover:scale-[1.03] group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
    
    {/* Realistic Industrial Scene Background */}
    <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-[#1e293b]">
       {/* Sun / Moon glow */}
       <div className="absolute top-[15%] right-[25%] w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
       
       {/* Distant Mountains / Horizon */}
       <div className="absolute bottom-0 w-full h-[45%] bg-[#0f172a]" style={{ clipPath: 'polygon(0 100%, 0 50%, 15% 40%, 30% 60%, 50% 35%, 75% 55%, 100% 45%, 100% 100%)' }}></div>
       
       {/* Foreground Factory */}
       <div className="absolute bottom-0 left-[20%] w-[35%] h-[55%] bg-gradient-to-t from-[#020617] to-[#1e293b] border-t border-l border-r border-[#334155] rounded-t-sm shadow-2xl">
          <div className="w-full h-full grid grid-cols-5 gap-1.5 p-3 mt-4">
             {[...Array(15)].map((_, i) => <div key={`fac-${i}`} className="bg-yellow-500/20 w-full h-3 rounded-sm"></div>)}
          </div>
          {/* Main Chimney */}
          <div className="absolute top-[-50px] left-[55%] w-[18px] h-[50px] bg-gradient-to-t from-[#1e293b] to-[#334155] border-t border-l border-r border-[#475569]">
             <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
          </div>
       </div>

       {/* Trees / Environment */}
       <div className="absolute bottom-0 right-[15%] w-10 h-20 bg-green-900/30 rounded-t-full blur-[1px]"></div>
       <div className="absolute bottom-0 right-[22%] w-8 h-14 bg-green-900/40 rounded-t-full blur-[1px]"></div>
       
       {/* Animated Smoke (GPU-accelerated, no mix-blend-screen) */}
       {isInView && evidenceSmokeOffsets.map((smoke, i) => (
          <motion.div
            key={`es-${i}`}
            animate={{ y: [-10, -120], x: [0, smoke.x], opacity: [0, 0.7, 0], scale: [1, 4] }}
            transition={{ duration: smoke.duration, repeat: Infinity, delay: smoke.delay }}
            className="absolute top-[40%] left-[34%] w-10 h-10 bg-gradient-to-t from-gray-400/80 to-gray-300/30 rounded-full blur-[6px] transform-gpu pointer-events-none"
          />
       ))}
    </div>

    {/* Camera Flash Overlay */}
    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 group-hover:animate-ping duration-150 transition-opacity z-10" />
    
    {/* HUD Layer (Surveillance UI) */}
    <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between font-mono text-white text-[8px] tracking-wider">
       
       {/* Rule of Thirds Grid */}
       <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-[0.15]">
          <div className="border-r border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div></div>
       </div>

       {/* Corner Framing Guides */}
       <div className="absolute inset-5 pointer-events-none opacity-80">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-sm shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
       </div>

       {/* Center Focus Square */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/40 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
       </div>

       {/* AI Detection Bounding Box */}
       <motion.div 
          animate={isInView ? { opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] } : { opacity: 0.8 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-[20%] left-[25%] w-[150px] h-[130px] border-[2px] border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] z-30 flex flex-col justify-between p-1.5 transform-gpu"
       >
          <div className="flex justify-between items-start">
             <div className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-md">
                <Flame className="w-2.5 h-2.5" />
                Smoke Detected
             </div>
          </div>
          <div className="flex justify-end">
             <div className="bg-black/70 backdrop-blur text-red-400 text-[8px] font-bold px-2 py-0.5 rounded-sm border border-red-500/30">
                Conf: 99.1%
             </div>
          </div>
       </motion.div>

       {/* TOP HUD ELEMENTS */}
       <div className="flex justify-between items-start z-30">
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-2 bg-black/85 px-2.5 py-1.5 rounded shadow-lg border border-white/5">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                <span className="font-bold text-red-500 text-[9px]">REC LIVE</span>
             </div>
             <div className="bg-black/80 px-2 py-1 rounded w-max text-white/90 text-[7px] border border-white/10">
                ESP32-CAM CONNECTED
             </div>
             <div className="flex gap-1 mt-0.5">
                <span className="bg-primary/20 border border-primary/40 text-primary px-1.5 py-0.5 rounded text-[7px] font-bold">1080P</span>
                <span className="bg-white/10 border border-white/20 text-white px-1.5 py-0.5 rounded text-[7px] font-bold">30 FPS</span>
             </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-right bg-black/80 p-2 rounded border border-white/5 shadow-lg">
             <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[8px] font-bold">34.0522° N, 118.2437° W</span>
             </div>
             <div className="text-[7px] text-white/70">
                2026-08-03 | 22:25:44 UTC
             </div>
          </div>
       </div>

       {/* BOTTOM HUD ELEMENTS */}
       <div className="flex justify-between items-end z-30">
          
          {/* Cloud Upload Progress Sequence */}
          <div className="w-36 h-10 bg-black/85 rounded-lg border border-white/10 relative overflow-hidden shadow-xl">
             {/* Uploading State */}
             <motion.div animate={isInView ? { opacity: [1, 1, 0, 0, 1] } : { opacity: 1 }} transition={{ duration: 5, repeat: Infinity }} className="absolute inset-0 p-2 flex flex-col justify-center gap-1.5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary">
                     <Cloud className="w-3.5 h-3.5 animate-pulse" />
                     <span className="font-bold text-[8px]">Uploading...</span>
                  </div>
                  <span className="text-[7px] text-white/80">92%</span>
               </div>
               <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div animate={isInView ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0.92 }} style={{ originX: 0 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-gradient-to-r from-primary to-accent transform-gpu" />
               </div>
             </motion.div>
             
             {/* Upload Complete State */}
             <motion.div animate={isInView ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }} transition={{ duration: 5, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5 bg-green-500/20 border border-green-500/30">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="font-bold text-[9px] text-green-400">Evidence Saved</span>
             </motion.div>
          </div>

          {/* Secure Evidence / Recording Timer */}
          <div className="flex flex-col items-end gap-1.5">
             <div className="text-[16px] font-black text-red-500 drop-shadow-md tracking-widest bg-black/80 px-2 py-0.5 rounded">
                00:04:12
             </div>
             <div className="flex items-center gap-1 bg-emerald-950/80 border border-green-500/40 text-green-400 px-2.5 py-1 rounded font-bold text-[8px] shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                SECURE EVIDENCE
             </div>
          </div>
       </div>

    </div>
  </div>
));

EvidenceVisual.displayName = 'EvidenceVisual';

const AlertVisual = memo(({ isHovered, isInView = true }) => {
  const animateState = isHovered ? "active" : "idle";

  const nodeVariants = {
    idle: { scale: 0.95, opacity: 0.85, borderColor: "rgba(47,128,237,0.4)", backgroundColor: "rgba(255,255,255,0.95)" },
    active: { scale: 1.1, opacity: 1, borderColor: "rgba(47,128,237,1)", backgroundColor: "rgba(255,255,255,1)", transition: { type: "spring", stiffness: 300 } }
  };

  const lineVariants = {
    idle: { pathLength: 0, opacity: 0 },
    active: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "linear" } }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pointer-events-none pb-2 overflow-hidden">
       
       {/* Background pipeline layout */}
       <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[340px] h-[180px]">
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
             {/* MQ135 -> AI */}
             <motion.path d="M 60 80 L 120 80" stroke="#2F80ED" strokeWidth="3" fill="none" variants={lineVariants} initial="idle" animate={animateState} transition={{ delay: 0.2 }} strokeDasharray="4 4" />
             {/* AI -> Alert */}
             <motion.path d="M 120 80 L 180 80" stroke="#2F80ED" strokeWidth="3" fill="none" variants={lineVariants} initial="idle" animate={animateState} transition={{ delay: 0.6 }} />
             {/* Alert Branches */}
             <motion.path d="M 180 80 Q 220 80 220 120" stroke="#2F80ED" strokeWidth="3" fill="none" variants={lineVariants} initial="idle" animate={animateState} transition={{ delay: 1.0 }} />
             <motion.path d="M 180 80 Q 260 80 260 50" stroke="#2F80ED" strokeWidth="3" fill="none" variants={lineVariants} initial="idle" animate={animateState} transition={{ delay: 1.2 }} />
             <motion.path d="M 180 80 Q 300 80 300 100" stroke="#2F80ED" strokeWidth="3" fill="none" variants={lineVariants} initial="idle" animate={animateState} transition={{ delay: 1.4 }} />
          </svg>

          {/* Nodes */}
          <div className="relative w-full h-full">
             
             {/* MQ135 Node */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 0 }} className="absolute top-[65px] left-[35px] w-12 h-12 rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-lg z-10">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-[6px] font-bold text-gray-600 mt-0.5">MQ135</span>
             </motion.div>

             {/* AI Verify Node */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 0.4 }} className="absolute top-[65px] left-[110px] w-12 h-12 rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-lg z-10">
                <Cloud className="w-4 h-4 text-primary" />
                <span className="text-[6px] font-bold text-gray-600 mt-0.5">AI VERIFY</span>
             </motion.div>

             {/* Alert Node (Red) */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 0.8 }} className="absolute top-[60px] left-[175px] w-14 h-14 rounded-full border-2 border-red-500 bg-red-50 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] z-10" style={{ borderColor: isHovered ? 'rgba(239,68,68,1)' : 'rgba(239,68,68,0.5)' }}>
                <Bell className="w-5 h-5 text-red-500" />
                <span className="text-[6px] font-black text-red-600 mt-0.5">ALERT</span>
                {isHovered && isInView && <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full border border-red-500 transform-gpu" />}
             </motion.div>

             {/* Dashboard Node */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 1.0 }} className="absolute top-[120px] left-[195px] w-10 h-10 rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-lg z-10">
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span className="text-[5px] font-bold text-gray-600 mt-0.5">DASH</span>
             </motion.div>

             {/* Email/SMS Node */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 1.2 }} className="absolute top-[35px] left-[245px] w-10 h-10 rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-lg z-10">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="text-[5px] font-bold text-gray-600 mt-0.5">SMS/EMAIL</span>
             </motion.div>

             {/* Authorities Node */}
             <motion.div variants={nodeVariants} initial="idle" animate={animateState} transition={{ delay: 1.4 }} className="absolute top-[90px] left-[285px] w-10 h-10 rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-lg z-10">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-[5px] font-bold text-gray-600 mt-0.5">AGENCY</span>
             </motion.div>
          </div>
       </div>

       {/* Detailed Emergency Notification Card */}
       <motion.div 
         initial={{ y: 150, opacity: 0, rotateX: 20 }}
         animate={isHovered ? { y: 0, opacity: 1, rotateX: 0 } : { y: 150, opacity: 0, rotateX: 20 }}
         transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.8 }}
         className="w-[85%] bg-white/95 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-red-100 p-4 z-20 relative overflow-hidden"
       >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
          
          <div className="flex justify-between items-start mb-3 pl-2">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                   <Bell className="w-3 h-3 text-red-500" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-red-600 tracking-widest uppercase">Authority Alert</h4>
                   <p className="text-[8px] text-gray-500 font-medium tracking-wide">Automated Dispatch</p>
                </div>
             </div>
             <motion.div initial={{ opacity: 0 }} animate={isHovered ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 2.2 }} className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
                <span className="text-[7px] font-bold text-green-600 uppercase tracking-wider">Delivered</span>
             </motion.div>
          </div>

          <div className="pl-2 grid grid-cols-2 gap-3 mb-1">
             <div>
                <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Incident</span>
                <span className="block text-[11px] font-bold text-gray-800 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500"/> Smoke Detected</span>
             </div>
             <div>
                <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Peak AQI</span>
                <span className="block text-[11px] font-bold text-red-600">182 (Hazardous)</span>
             </div>
             <div>
                <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Location</span>
                <span className="block text-[10px] font-bold text-gray-700">Sector 4 Industrial</span>
             </div>
             <div>
                <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Time</span>
                <span className="block text-[10px] font-bold text-gray-700">Just Now</span>
             </div>
          </div>
          
          {/* WebSocket Syncing Indicator */}
          <motion.div initial={{ opacity: 0 }} animate={isHovered ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.6 }} className="pl-2 mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-1.5">
                <motion.div animate={isHovered && isInView ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-[7px] font-bold text-primary uppercase tracking-widest">WebSocket Sync Active</span>
             </div>
             <div className="flex gap-1">
                <div className="w-4 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                   <motion.div animate={isHovered && isInView ? { x: ["-100%", "100%"] } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-primary" />
                </div>
             </div>
          </motion.div>
       </motion.div>
    </div>
  );
});

AlertVisual.displayName = 'AlertVisual';

const GISVisual = memo(({ isHovered, isInView = true }) => (
  <div className="relative w-full h-full overflow-hidden rounded-2xl pointer-events-none">
     
     {/* 3D Map Container */}
     <motion.div 
       animate={isHovered ? { rotateX: 35, rotateZ: -10, scale: 1.25, y: 30 } : { rotateX: 25, rotateZ: -5, scale: 1.1, y: 15 }}
       transition={{ duration: 1.2, ease: "easeOut" }}
       className="absolute inset-[-20%] w-[140%] h-[140%] bg-blue-50/50 border border-primary/20 flex origin-center transform-gpu"
     >
        {/* Terrain / Background map texture (Static low-opacity pattern) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        {/* Water body */}
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[120%] bg-blue-200/40 rounded-full blur-xl transform -rotate-45" />

        {/* Parks */}
        <div className="absolute top-[35%] left-[15%] w-[25%] h-[20%] bg-green-200/40 rounded-full blur-xl" />
        <div className="absolute bottom-[25%] left-[35%] w-[20%] h-[25%] bg-green-200/30 rounded-full blur-xl" />

        {/* Industrial Zone */}
        <div className="absolute top-[15%] left-[60%] w-[30%] h-[30%] bg-gray-300/40 rounded-xl blur-lg" />

        {/* Roads Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
           <defs>
              <pattern id="cityGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                 <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2F80ED" strokeWidth="0.5" />
              </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#cityGrid)" />
           
           {/* Major Highways */}
           <path d="M -100 200 L 800 250" stroke="#2F80ED" strokeWidth="3" fill="none" className="opacity-50" />
           <path d="M 300 -100 L 250 800" stroke="#2F80ED" strokeWidth="3" fill="none" className="opacity-50" />
           <path d="M 0 0 L 800 600" stroke="#2F80ED" strokeWidth="2" fill="none" className="opacity-40" />

           {/* Route Lines connecting sensors to Monitoring Center (42%, 45%) */}
           <line x1="20%" y1="35%" x2="42%" y2="45%" stroke="#2F80ED" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-60" />
           <line x1="35%" y1="70%" x2="42%" y2="45%" stroke="#2F80ED" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-60" />
           <line x1="70%" y1="22%" x2="42%" y2="45%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-80" />
        </svg>

        {/* Data Packets flowing */}
        {isHovered && isInView && (
           <>
              <motion.div animate={{ top: ["35%", "45%"], left: ["20%", "42%"], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#2F80ED] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
              <motion.div animate={{ top: ["70%", "45%"], left: ["35%", "42%"], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.3 }} className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#2F80ED] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
              <motion.div animate={{ top: ["22%", "45%"], left: ["70%", "42%"], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
           </>
        )}

        {/* 3D Buildings Abstraction */}
        <div className="absolute top-[40%] left-[30%] w-12 h-16 bg-white/90 border border-white/50 shadow-[5px_5px_15px_rgba(0,0,0,0.08)] rounded-sm" />
        <div className="absolute top-[48%] left-[45%] w-10 h-24 bg-white/95 border border-white/50 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm" />
        <div className="absolute top-[28%] left-[55%] w-16 h-12 bg-white/85 border border-white/40 shadow-[5px_5px_15px_rgba(0,0,0,0.05)] rounded-sm" />
        <div className="absolute top-[18%] left-[68%] w-20 h-16 bg-gray-100/90 border border-gray-200/50 shadow-[5px_5px_15px_rgba(0,0,0,0.08)] rounded-sm" />
        <div className="absolute top-[25%] left-[75%] w-12 h-20 bg-gray-100/95 border border-gray-200/50 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm" />

        {/* Pollution Heatmap overlay */}
        <motion.div 
          animate={isHovered && isInView ? { opacity: [0, 0.8, 0], scale: [0.9, 1.1, 0.9] } : { opacity: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[55%] w-48 h-48 bg-red-500/30 rounded-full blur-2xl pointer-events-none transform-gpu"
        />

        {/* Sensors */}
        
        {/* Green Sensor */}
        <div className="absolute top-[35%] left-[20%] -translate-x-1/2 -translate-y-1/2">
           {isInView && <motion.div animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-green-500 rounded-full blur-sm transform-gpu" />}
           <div className="relative z-10 w-3 h-3 bg-green-500 border-[1.5px] border-white rounded-full shadow-lg" />
        </div>
        
        {/* Yellow Sensor */}
        <div className="absolute top-[70%] left-[35%] -translate-x-1/2 -translate-y-1/2">
           {isInView && <motion.div animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 bg-yellow-400 rounded-full blur-sm transform-gpu" />}
           <div className="relative z-10 w-3 h-3 bg-yellow-400 border-[1.5px] border-white rounded-full shadow-lg" />
        </div>

        {/* Monitoring Center (Orange-ish) */}
        <div className="absolute top-[45%] left-[42%] -translate-x-1/2 -translate-y-1/2 z-20">
           <div className="relative z-10 w-5 h-5 bg-primary border-[2px] border-white rounded-full shadow-xl flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
           </div>
           {/* Radar Sweep */}
           {isInView && (
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 origin-center rounded-full pointer-events-none transform-gpu"
               style={{ background: 'conic-gradient(from 0deg, transparent 80%, rgba(47,128,237,0.4) 100%)' }}
             />
           )}
        </div>

        {/* Red Hotspot Sensor */}
        <div className="absolute top-[22%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-20">
           {isInView && <motion.div animate={{ scale: [1, 3.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full blur-[2px] transform-gpu" />}
           <div className="relative z-10 w-4 h-4 bg-red-500 border-[2px] border-white rounded-full shadow-[0_0_15px_red]" />
        </div>

     </motion.div>

     {/* Floating UI Elements */}

     {/* Incident Popup */}
     <motion.div 
       initial={{ y: 20, opacity: 0, scale: 0.9 }}
       animate={isHovered ? { y: 0, opacity: 1, scale: 1 } : { y: 20, opacity: 0, scale: 0.9 }}
       transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.6 }}
       className="absolute top-[8%] right-[8%] bg-white/95 border border-red-200 shadow-[0_15px_35px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 z-30 w-44"
     >
        <div className="flex items-center gap-2 mb-2.5 border-b border-gray-100 pb-2.5">
           <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
           <span className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-none mt-0.5">Smoke Detected</span>
        </div>
        <div className="flex justify-between items-center mb-1.5">
           <span className="text-[10px] text-gray-500 font-bold">AQI Level</span>
           <span className="text-[14px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">182</span>
        </div>
        <div className="flex justify-between items-center mb-1">
           <span className="text-[10px] text-gray-500 font-bold">Zone</span>
           <span className="text-[10px] font-bold text-gray-800">Industrial</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
           <span className="text-[9px] text-gray-400 font-bold uppercase">Status</span>
           <span className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-1"><Activity className="w-3 h-3" /> LIVE</span>
        </div>
     </motion.div>

     {/* CPCB Comparison Widget */}
     <motion.div 
       initial={{ x: -30, opacity: 0 }}
       animate={isHovered ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
       transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.8 }}
       className="absolute bottom-[28%] left-[6%] bg-white/95 border border-gray-200 shadow-xl rounded-2xl p-3 z-30 flex items-center gap-4"
     >
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center justify-between gap-5">
              <span className="text-[9px] font-bold text-gray-500 uppercase">AWARE Sensor</span>
              <span className="text-[12px] font-black text-red-500">182</span>
           </div>
           <div className="flex items-center justify-between gap-5">
              <span className="text-[9px] font-bold text-gray-500 uppercase">Gov CPCB</span>
              <span className="text-[12px] font-black text-gray-700">179</span>
           </div>
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex flex-col items-center justify-center text-green-500">
           <ShieldCheck className="w-5 h-5 mb-1" />
           <span className="text-[7px] font-bold uppercase tracking-wider">Verified</span>
        </div>
     </motion.div>

     {/* Live Statistics Badge */}
     <motion.div 
       initial={{ y: 30, opacity: 0 }}
       animate={isHovered ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
       transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.4 }}
       className="absolute bottom-[6%] right-[6%] bg-blue-900/95 border border-blue-700 shadow-2xl rounded-2xl p-2.5 z-30 flex items-center gap-4 text-white"
     >
        <div className="flex items-center gap-2 px-2 border-r border-blue-700/60">
           <Map className="w-4 h-4 text-blue-400" />
           <div className="flex flex-col">
              <span className="text-[13px] font-black leading-none mb-0.5">124</span>
              <span className="text-[7px] font-bold text-blue-300 uppercase tracking-widest">Active Sensors</span>
           </div>
        </div>
        <div className="flex items-center gap-2 px-2">
           <Activity className="w-4 h-4 text-green-400 animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[11px] font-bold text-green-400 leading-none mb-0.5">Online</span>
              <span className="text-[7px] text-blue-300 tracking-wider">Updated Now</span>
           </div>
        </div>
     </motion.div>
     
  </div>
));

GISVisual.displayName = 'GISVisual';

const SatelliteVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl pointer-events-none bg-[#0B1426]">
       
       {/* Realistic Top-Down Satellite Map */}
       <div className="absolute inset-0 opacity-70">
          
          {/* Water body */}
          <svg className="absolute inset-0 w-full h-full opacity-60">
             <path d="M -50 200 Q 150 150 250 300 T 500 400 L 500 600 L -50 600 Z" fill="#1e3a8a" />
          </svg>
          
          {/* Green Areas */}
          <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#064e3b] rounded-full blur-[20px]" />
          <div className="absolute top-[40%] right-[20%] w-[25%] h-[40%] bg-[#064e3b] rounded-full blur-[25px]" />

          {/* Industrial Zone Base */}
          <div className="absolute top-[20%] right-[10%] w-[45%] h-[40%] bg-[#1f2937] rounded-3xl blur-[10px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-[#1f2937] rounded-3xl blur-[10px]" />

          {/* City Grid & Roads */}
          <svg className="absolute inset-0 w-full h-full opacity-40">
             <path d="M 0 100 L 500 150" stroke="#4b5563" strokeWidth="2" fill="none" />
             <path d="M 0 250 L 500 200" stroke="#4b5563" strokeWidth="2" fill="none" />
             <path d="M 150 0 L 250 500" stroke="#4b5563" strokeWidth="2" fill="none" />
             <path d="M 350 0 L 300 500" stroke="#4b5563" strokeWidth="2" fill="none" />
             
             {/* Secondary roads */}
             <path d="M 150 120 L 350 140" stroke="#4b5563" strokeWidth="1" fill="none" strokeDasharray="4 4" />
             <path d="M 200 0 L 220 200" stroke="#4b5563" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          </svg>

          {/* Factory Buildings (Top Down) */}
          <div className="absolute top-[25%] right-[25%] w-10 h-16 bg-[#374151] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-[#4b5563]" />
          <div className="absolute top-[30%] right-[15%] w-12 h-10 bg-[#374151] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-[#4b5563]" />
          <div className="absolute top-[45%] right-[22%] w-8 h-12 bg-[#374151] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-[#4b5563]" />
          
          <div className="absolute bottom-[25%] left-[25%] w-14 h-14 bg-[#374151] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-[#4b5563] rounded-full" />
          <div className="absolute bottom-[35%] left-[35%] w-8 h-8 bg-[#374151] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-[#4b5563] rounded-full" />
       </div>

       {/* Animated Pollution Heatmap Overlay */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={isHovered && isInView ? { opacity: [0, 0.8, 0.6, 0.8] } : { opacity: 0 }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         className="absolute inset-0 z-10 transform-gpu"
       >
          {/* Main Hotspot 1 (Industrial Right) */}
          <div 
             className="absolute top-[30%] right-[20%] w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.55) 25%, rgba(234,179,8,0.35) 50%, rgba(34,197,94,0.1) 75%, transparent 100%)' }}
          />
          {/* Main Hotspot 2 (Industrial Left) */}
          <div 
             className="absolute bottom-[30%] left-[30%] w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.75) 0%, rgba(249,115,22,0.45) 25%, rgba(234,179,8,0.25) 50%, rgba(34,197,94,0.1) 75%, transparent 100%)' }}
          />
          {/* Minor Hotspot */}
          <div 
             className="absolute top-[40%] left-[50%] w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.55) 0%, rgba(34,197,94,0.25) 50%, transparent 100%)' }}
          />
       </motion.div>

       {/* Animated Markers & Glowing Particles */}
       {isHovered && isInView && (
          <div className="absolute inset-0 z-20">
             {/* Hotspot 1 Marker */}
             <div className="absolute top-[30%] right-[20%] -translate-x-1/2 -translate-y-1/2">
                <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full blur-[2px] transform-gpu" />
                <div className="relative w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
             </div>
             
             {/* Hotspot 2 Marker */}
             <div className="absolute bottom-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2">
                <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 bg-orange-500 rounded-full blur-[2px] transform-gpu" />
                <div className="relative w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
             </div>

             {/* Data packets flowing to center */}
             <motion.div animate={{ top: ["30%", "50%"], left: ["80%", "50%"], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
             <motion.div animate={{ top: ["70%", "50%"], left: ["30%", "50%"], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }} className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
          </div>
       )}

       {/* Satellite Scanning Beam Overlay (GPU transformed x instead of left) */}
       {isHovered && isInView && (
          <motion.div 
            animate={{ x: ['-100%', '300%'] }} 
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} 
            className="absolute top-0 left-0 w-[40%] h-full z-20 pointer-events-none transform-gpu"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, rgba(47,128,237,0.4) 98%, transparent 100%)', transform: 'skewX(-20deg)' }}
          >
             <div className="absolute top-0 right-0 w-1 h-full bg-primary/60 blur-[1px]" />
          </motion.div>
       )}

       {/* Floating UI OVERLAYS */}
       
       {/* Small Satellite Icon (Top Left) */}
       <motion.div 
         initial={{ y: -20, opacity: 0 }}
         animate={isHovered ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
         transition={{ type: "spring", delay: 0.2 }}
         className="absolute top-[8%] left-[8%] bg-[#0B1426]/95 border border-primary/30 rounded-xl p-2.5 z-30 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
       >
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/50 relative">
             <Navigation className="w-4 h-4 text-primary" />
             {isHovered && isInView && <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-primary/30 border-t-transparent transform-gpu" />}
          </div>
          <div>
             <div className="text-[7px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SATELLITE CONNECTED
             </div>
             <div className="text-[12px] font-black text-white leading-none mt-0.5">Sentinel-5P</div>
             <div className="text-[7px] text-gray-400 mt-1">Last Updated: <span className="text-white">2 seconds ago</span></div>
          </div>
       </motion.div>

       {/* "Analyzing Satellite Data..." Label */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
         transition={{ delay: 1 }}
         className="absolute top-[8%] right-[8%] bg-black/80 border border-white/10 rounded-full px-3 py-1.5 z-30 flex items-center gap-2"
       >
          <Cloud className="w-3 h-3 text-white/60" />
          <span className="text-[8px] font-bold text-white/80 tracking-widest uppercase">Analyzing Data...</span>
       </motion.div>

       {/* Analytics Widget (Bottom Center) */}
       <motion.div 
         initial={{ y: 50, opacity: 0 }}
         animate={isHovered ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
         transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
         className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[85%] bg-white/95 border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 z-30 flex justify-between items-center"
       >
          {/* Pollution Index */}
          <div className="flex flex-col">
             <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pollution Index</span>
             <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-black text-red-600 leading-none">184</span>
                <span className="text-[10px] font-bold text-red-600">AQI</span>
             </div>
          </div>
          
          <div className="w-px h-10 bg-gray-200" />
          
          {/* Active Hotspots */}
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hotspots</span>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[18px] font-black text-gray-800 leading-none">5</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">Active</span>
             </div>
          </div>

          <div className="w-px h-10 bg-gray-200" />

          {/* Coverage */}
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coverage</span>
             <div className="flex items-baseline gap-0.5 text-primary">
                <span className="text-[20px] font-black leading-none">98</span>
                <span className="text-[12px] font-bold">%</span>
             </div>
             <div className="w-16 h-1 bg-primary/20 rounded-full mt-1.5 overflow-hidden">
                <motion.div initial={{ scaleX: 0 }} animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }} style={{ originX: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full w-full bg-primary transform-gpu" />
             </div>
          </div>
       </motion.div>

    </div>
  );
});

SatelliteVisual.displayName = 'SatelliteVisual';

const DashboardVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="relative w-full h-full bg-white/95 rounded-2xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden group-hover:-translate-y-3 group-hover:-translate-x-1 transition-transform duration-700 pointer-events-none p-4">
       
       {/* TOP COMMAND BAR */}
       <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg border border-primary/20">
                <Cloud className="w-3.5 h-3.5 text-white" />
             </div>
             <span className="text-[11px] font-black text-gray-800 tracking-widest uppercase">AWARE OS</span>
             <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 ml-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                <span className="text-[7px] font-bold text-green-600 uppercase tracking-widest">System Live</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-[8px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">SYNC: JUST NOW</div>
             <div className="text-[8px] font-bold text-gray-400">2026-08-03 22:35 UTC</div>
             <div className="relative">
                <Bell className="w-4 h-4 text-gray-400" />
                {isHovered && isInView && <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white transform-gpu" />}
             </div>
             <div className="w-6 h-6 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full border border-gray-300 shadow-inner flex items-center justify-center">
                <Users className="w-3 h-3 text-gray-400" />
             </div>
          </div>
       </div>

       {/* MAIN CONTENT GRID */}
       <div className="flex-1 grid grid-cols-12 gap-3 h-full">
          
          {/* LEFT PANEL: Summary Cards */}
          <div className="col-span-3 flex flex-col gap-3">
             <motion.div animate={isHovered ? { y: [15, 0], opacity: [0, 1] } : {}} transition={{ delay: 0.1, type: "spring" }} className="flex-1 bg-gradient-to-br from-blue-50/80 to-blue-50/30 rounded-xl border border-blue-100 p-3 flex flex-col justify-between relative overflow-hidden shadow-sm">
                <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                <div className="flex items-center gap-2 text-primary mb-1">
                   <Activity className="w-3.5 h-3.5" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-blue-700">City AQI Avg</span>
                </div>
                <div className="flex items-end gap-2">
                   <span className="text-[28px] font-black text-blue-800 leading-none">38</span>
                   <span className="text-[8px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200 mb-1">GOOD</span>
                </div>
             </motion.div>

             <motion.div animate={isHovered ? { y: [15, 0], opacity: [0, 1] } : {}} transition={{ delay: 0.2, type: "spring" }} className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-3 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <MapPin className="w-3.5 h-3.5" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Active Sensors</span>
                </div>
                <div className="flex items-end gap-2">
                   <span className="text-[22px] font-black text-gray-800 leading-none">24</span>
                   <span className="text-[7px] font-bold text-green-500 uppercase mb-0.5 flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"/>Online</span>
                </div>
             </motion.div>

             <motion.div animate={isHovered ? { y: [15, 0], opacity: [0, 1] } : {}} transition={{ delay: 0.3, type: "spring" }} className="flex-1 bg-red-50/50 rounded-xl border border-red-100 p-3 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
                <div className="flex items-center gap-2 text-red-500 mb-1">
                   <Bell className="w-3.5 h-3.5" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Active Alerts</span>
                </div>
                <div className="flex items-end justify-between">
                   <span className="text-[22px] font-black text-red-600 leading-none">2</span>
                   <span className="text-[7px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 mb-0.5">High Priority</span>
                </div>
             </motion.div>
          </div>

          {/* CENTER PANEL: GIS Map & Weather Widgets */}
          <div className="col-span-6 flex flex-col gap-3">
             {/* Center GIS Map */}
             <div className="flex-1 bg-[#0f172a] rounded-xl border border-gray-200 relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Miniature Map Background Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
                   <defs>
                      <pattern id="dashGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                         <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2F80ED" strokeWidth="0.5" />
                      </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#dashGrid)" />
                   <path d="M 10 50 L 200 60 L 250 150 L 50 120 Z" fill="#334155" />
                   <path d="M 0 80 C 50 80 100 100 250 80" stroke="#3b82f6" strokeWidth="2" fill="none" />
                   <path d="M 100 0 C 120 50 80 150 120 200" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                </svg>

                {/* Pollution Hotspot */}
                {isInView && (
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[30%] left-[60%] w-24 h-24 bg-red-500 rounded-full blur-2xl transform-gpu" />
                )}
                
                {/* Radar Pulse around central station */}
                {isInView && (
                  <motion.div animate={{ scale: [0, 3], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[50%] left-[40%] w-16 h-16 bg-primary rounded-full border border-primary/50 -translate-x-1/2 -translate-y-1/2 transform-gpu" />
                )}
                <div className="absolute top-[50%] left-[40%] w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#2F80ED]" />

                {/* Sensor Pins */}
                <div className="absolute top-[20%] left-[30%]"><div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" /></div>
                <div className="absolute bottom-[30%] right-[20%]"><div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308]" /></div>
                <div className="absolute top-[35%] right-[35%]"><div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse" /></div>

                {/* Data Packets flowing to center */}
                {isHovered && isInView && (
                   <motion.div animate={{ top: ["20%", "50%"], left: ["30%", "40%"], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
                )}
             </div>

             {/* Weather / Extra Micro-Widgets */}
             <div className="h-12 grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                   <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Wind</span>
                   <span className="text-[10px] font-black text-gray-700 mt-0.5">12 km/h</span>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                   <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Temp</span>
                   <span className="text-[10px] font-black text-gray-700 mt-0.5">24°C</span>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                   <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Humid</span>
                   <span className="text-[10px] font-black text-gray-700 mt-0.5">62%</span>
                </div>
                <div className="bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col items-center justify-center shadow-sm">
                   <span className="text-[7px] font-bold text-primary uppercase tracking-widest">PM2.5</span>
                   <span className="text-[10px] font-black text-blue-700 mt-0.5">18 µg/m³</span>
                </div>
             </div>
          </div>

          {/* RIGHT PANEL: Analytics & Incidents */}
          <div className="col-span-3 flex flex-col gap-3">
             
             {/* Live Animated Graph */}
             <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-3 flex flex-col relative overflow-hidden shadow-sm">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 z-10">Live AQI Trend</span>
                <svg className="absolute inset-0 w-full h-full pt-8 opacity-90" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.5" />
                         <stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
                      </linearGradient>
                   </defs>
                   <motion.path 
                     initial={{ pathLength: 0 }} 
                     animate={isHovered && isInView ? { pathLength: 1 } : { pathLength: 0 }} 
                     transition={{ duration: 2, ease: "easeInOut" }} 
                     d="M 0 50 Q 15 40 25 55 T 50 30 T 75 60 T 100 20" 
                     fill="none" stroke="#2F80ED" strokeWidth="2.5" 
                   />
                   <motion.path 
                     initial={{ opacity: 0 }} 
                     animate={isHovered && isInView ? { opacity: 1 } : { opacity: 0 }} 
                     transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }} 
                     d="M 0 50 Q 15 40 25 55 T 50 30 T 75 60 T 100 20 L 100 100 L 0 100 Z" 
                     fill="url(#chartGrad)" 
                   />
                </svg>
             </div>

             {/* Scrolling Incident Feed */}
             <div className="h-20 bg-gray-50 rounded-xl border border-gray-100 p-2 flex flex-col overflow-hidden relative shadow-sm">
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest px-1 mb-1.5 z-10 bg-gray-50">Incident Feed</span>
                <motion.div 
                  animate={isHovered && isInView ? { y: [0, -60] } : { y: 0 }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
                  className="flex flex-col gap-1.5 transform-gpu"
                >
                   <div className="bg-white rounded border border-gray-100 p-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
                      <div className="flex flex-col">
                         <span className="text-[7px] font-bold text-gray-700 leading-none">Smoke Detected</span>
                         <span className="text-[5px] text-gray-400">Sector 4 - High</span>
                      </div>
                   </div>
                   <div className="bg-white rounded border border-gray-100 p-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="flex flex-col">
                         <span className="text-[7px] font-bold text-gray-700 leading-none">AQI Normal</span>
                         <span className="text-[5px] text-gray-400">Sector 1 - Resolved</span>
                      </div>
                   </div>
                   <div className="bg-white rounded border border-gray-100 p-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div className="flex flex-col">
                         <span className="text-[7px] font-bold text-gray-700 leading-none">Dust High</span>
                         <span className="text-[5px] text-gray-400">Highway - Warning</span>
                      </div>
                   </div>
                   {/* Duplicate for seamless scrolling */}
                   <div className="bg-white rounded border border-gray-100 p-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
                      <div className="flex flex-col">
                         <span className="text-[7px] font-bold text-gray-700 leading-none">Smoke Detected</span>
                         <span className="text-[5px] text-gray-400">Sector 4 - High</span>
                      </div>
                   </div>
                </motion.div>
                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
             </div>
          </div>
       </div>
    </div>
  );
});

DashboardVisual.displayName = 'DashboardVisual';

const AnalyticsVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="relative w-full h-full bg-white/95 rounded-2xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden group-hover:-translate-y-3 group-hover:-translate-x-1 transition-transform duration-700 pointer-events-none p-4 z-10">
       
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
       
       {/* Top Row: KPIs */}
       <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex-1 bg-gradient-to-br from-blue-50/80 to-blue-50/30 rounded-xl border border-blue-100 p-2.5 shadow-[0_2px_10px_rgba(47,128,237,0.05)] flex flex-col relative overflow-hidden">
             <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-primary/10 rounded-full blur-xl" />
             <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest mb-1 z-10">Average AQI</span>
             <span className="text-[22px] font-black text-blue-800 leading-none z-10">42</span>
          </div>
          <div className="flex-1 bg-gray-50/80 rounded-xl border border-gray-100 p-2.5 shadow-sm flex flex-col">
             <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Best Month</span>
             <span className="text-[12px] font-black text-gray-800 mt-auto leading-none">January</span>
             <span className="text-[7px] text-green-500 font-bold uppercase mt-1.5 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> AQI 24</span>
          </div>
          <div className="flex-1 bg-gray-50/80 rounded-xl border border-gray-100 p-2.5 shadow-sm flex flex-col">
             <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Worst Month</span>
             <span className="text-[12px] font-black text-gray-800 mt-auto leading-none">May</span>
             <span className="text-[7px] text-red-500 font-bold uppercase mt-1.5 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> AQI 89</span>
          </div>
          <div className="flex-1 bg-gradient-to-br from-green-50/80 to-green-50/30 rounded-xl border border-green-100 p-2.5 shadow-sm flex flex-col relative overflow-hidden">
             <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-green-500/10 rounded-full blur-xl" />
             <span className="text-[7px] font-black text-green-600 uppercase tracking-widest mb-1 z-10">Improvement</span>
             <span className="text-[22px] font-black text-green-700 leading-none z-10">12%</span>
          </div>
       </div>

       {/* Middle Area: Chart & Insights */}
       <div className="flex-1 flex gap-3 relative">
          
          {/* Chart Section */}
          <div className="flex-[2] bg-white rounded-xl border border-gray-100 shadow-[inset_0_2px_15px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col">
             
             {/* Chart Background Zones (Green to Red) */}
             <div className="absolute inset-0 flex flex-col opacity-[0.08] pointer-events-none">
                <div className="flex-[0.5] bg-red-500 w-full" />
                <div className="flex-[1] bg-orange-500 w-full" />
                <div className="flex-[2] bg-yellow-400 w-full" />
                <div className="flex-[3] bg-green-500 w-full" />
             </div>
             
             {/* Chart SVG */}
             <svg className="absolute inset-0 w-full h-full pt-4 pb-6 px-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* AI Prediction Line */}
                <motion.path 
                  initial={{ opacity: 0 }} 
                  animate={isHovered && isInView ? { opacity: 0.6 } : { opacity: 0 }} 
                  transition={{ delay: 1, duration: 1 }} 
                  d="M 0 50 Q 20 40 40 45 T 80 30 T 100 20" 
                  fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" 
                />

                {/* Main Historical Data Line */}
                <motion.path 
                  initial={{ pathLength: 0 }} 
                  animate={isHovered && isInView ? { pathLength: 1 } : { pathLength: 0 }} 
                  transition={{ duration: 2, ease: "easeOut" }} 
                  d="M 0 70 C 15 70, 20 40, 30 35 C 40 30, 45 80, 50 85 C 60 90, 70 50, 80 45 C 90 40, 95 65, 100 70" 
                  fill="none" stroke="#2F80ED" strokeWidth="2.5" 
                  className="drop-shadow-[0_4px_8px_rgba(47,128,237,0.5)]" 
                />

                {/* Hotspot Pulse (May peak, worst month) */}
                {isHovered && isInView && (
                   <motion.circle 
                     cx="50" cy="85" r="2.5" fill="#ef4444" 
                     initial={{ scale: 0, opacity: 0 }} 
                     animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }} 
                     transition={{ duration: 2, repeat: Infinity, delay: 2.2 }} 
                     className="drop-shadow-[0_0_8px_red] transform-gpu" 
                   />
                )}
             </svg>

             {/* Chart Tooltips */}
             <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.9 }} 
               animate={isHovered && isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }} 
               transition={{ delay: 2.4, type: "spring", stiffness: 300, damping: 20 }} 
               className="absolute top-[35%] left-[42%] bg-white/95 backdrop-blur shadow-xl border border-red-200 rounded-lg px-2.5 py-1.5 flex flex-col items-center z-10" 
             >
                <span className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-0.5">May Peak</span>
                <span className="text-[12px] font-black text-gray-800 leading-none">89 <span className="text-[8px] text-gray-500">AQI</span></span>
             </motion.div>

             {/* Bottom Timeline */}
             <div className="absolute bottom-0 left-0 w-full h-6 border-t border-gray-100 flex items-center justify-between px-3 bg-white/80 backdrop-blur text-[7px] font-black text-gray-400 uppercase tracking-widest">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                
                {/* Scanning Progress Indicator */}
                <motion.div 
                  initial={{ x: "-10%" }} 
                  animate={isHovered && isInView ? { x: "900%" } : { x: "-10%" }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
                  className="absolute bottom-0 left-3 w-[2px] h-full bg-primary/40 shadow-[0_0_5px_#2F80ED] transform-gpu" 
                />
             </div>
          </div>

          {/* Right AI Insights Panel */}
          <div className="flex-1 flex flex-col gap-2">
             <div className="flex items-center gap-1.5 mb-0.5 px-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_5px_#6FC8FF]" />
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">AI Insights</span>
             </div>
             
             {[
               { text: "Pollution reduced 12%", color: "text-green-700", icon: <ShieldCheck className="w-3.5 h-3.5 text-green-500"/>, bg: "bg-green-50/80", border: "border-green-100" },
               { text: "Industrial Zone clear", color: "text-green-700", icon: <Activity className="w-3.5 h-3.5 text-green-500"/>, bg: "bg-green-50/80", border: "border-green-100" },
               { text: "Construction worsening", color: "text-orange-700", icon: <Flame className="w-3.5 h-3.5 text-orange-500"/>, bg: "bg-orange-50/80", border: "border-orange-200" },
               { text: "PM2.5 trending down", color: "text-blue-700", icon: <MapPin className="w-3.5 h-3.5 text-primary"/>, bg: "bg-blue-50/80", border: "border-blue-100" },
             ].map((insight, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }} 
                  transition={{ duration: 0.5, delay: 0.5 + (idx * 0.25) }} 
                  className={`flex items-center gap-2 p-2 rounded-lg border ${insight.bg} ${insight.border} shadow-sm`}
                >
                   <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center shadow-sm border border-white/50">{insight.icon}</div>
                   <span className={`text-[8px] font-bold ${insight.color} leading-tight`}>{insight.text}</span>
                </motion.div>
             ))}
          </div>

       </div>
    </div>
  );
});

AnalyticsVisual.displayName = 'AnalyticsVisual';

const CloudVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="relative w-full h-full bg-white/95 rounded-2xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex overflow-hidden group-hover:-translate-y-3 group-hover:-translate-x-1 transition-transform duration-700 pointer-events-none p-3 gap-2 z-10">
       
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-50" />

       {/* LEFT PANEL: Upload Queue & Security */}
       <div className="w-[45%] flex flex-col gap-2 h-full relative z-10">
          
          {/* Security Badges */}
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 bg-white border border-blue-100 rounded-lg px-2 py-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[6px] font-black text-blue-700 uppercase tracking-widest">AES-256 Encrypted</span>
             </div>
             <div className="flex items-center gap-1.5 bg-white border border-green-100 rounded-lg px-2 py-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[6px] font-black text-green-700 uppercase tracking-widest">Cloud Backup</span>
             </div>
          </div>
          
          {/* Upload Queue */}
          <div className="flex-1 bg-gray-50/80 rounded-xl border border-gray-100 p-2 flex flex-col gap-1.5 overflow-hidden relative shadow-inner">
             <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest mb-0.5 px-1">Live Queue</span>
             
             {/* Item 1 */}
             <div className="bg-white rounded border border-gray-100 p-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                   <Camera className="w-3 h-3 text-gray-500" />
                   <span className="text-[6px] font-bold text-gray-700 truncate">Smoke_001.jpg</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                   <motion.div initial={{ scaleX: 0 }} animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }} style={{ originX: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full w-full bg-green-500 transform-gpu" />
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-[5px] text-gray-400 uppercase font-bold">Uploading...</span>
                   <motion.span initial={{ opacity: 0 }} animate={isHovered ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.5 }} className="text-[5px] font-black text-green-500 uppercase">✓ Done</motion.span>
                </div>
             </div>

             {/* Item 2 */}
             <div className="bg-white rounded border border-gray-100 p-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                   <Camera className="w-3 h-3 text-gray-500" />
                   <span className="text-[6px] font-bold text-gray-700 truncate">Factory_002.jpg</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                   <motion.div initial={{ scaleX: 0 }} animate={isHovered ? { scaleX: 0.65 } : { scaleX: 0 }} style={{ originX: 0 }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }} className="h-full w-full bg-blue-500 transform-gpu" />
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-[5px] text-gray-400 uppercase font-bold">Uploading...</span>
                   <span className="text-[5px] font-black text-blue-500">65%</span>
                </div>
             </div>
             
             <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          </div>
       </div>

       {/* RIGHT PANEL: Analytics & Cloud Feed */}
       <div className="w-[55%] flex flex-col gap-2 h-full relative z-10">
          
          {/* Analytics Header */}
          <div className="flex justify-between items-end bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-xl p-2 border border-blue-100 shadow-sm">
             <div className="flex flex-col">
                <span className="text-[6px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Storage</span>
                <span className="text-[18px] font-black text-blue-800 leading-none">78%</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Files</span>
                <span className="text-[12px] font-black text-gray-800 leading-none">1256</span>
             </div>
          </div>

          {/* Central Cloud Illustration */}
          <div className="flex-1 bg-gray-50/80 rounded-xl border border-gray-100 relative overflow-hidden flex items-center justify-center shadow-inner">
             
             {/* Flow lines */}
             <svg className="absolute inset-0 w-full h-full opacity-30">
                <path d="M -20 50 Q 30 20 60 50 T 200 50" fill="none" stroke="#2F80ED" strokeWidth="1.5" strokeDasharray="3 3" />
             </svg>

             {/* Data particles */}
             {isHovered && isInView && (
                <>
                   <motion.div animate={{ left: ["-20%", "50%"], top: ["50%", "50%"], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_blue] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
                   <motion.div animate={{ left: ["-20%", "50%"], top: ["50%", "50%"], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.7 }} className="absolute w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_green] -translate-x-1/2 -translate-y-1/2 transform-gpu" />
                </>
             )}

             {/* Main Cloud */}
             <motion.div 
               animate={isHovered && isInView ? { scale: [1, 1.05, 1] } : {}}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10 w-16 h-16 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-1 transform-gpu"
             >
                <div className="relative">
                   <Cloud className="w-6 h-6 text-primary" />
                   {isHovered && isInView && <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 transform-gpu">
                      <Activity className="w-2 h-2 text-accent" />
                   </motion.div>}
                </div>
                <span className="text-[6px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Synced</span>
             </motion.div>
          </div>

          {/* Bottom Feed: Recent Evidence */}
          <div className="h-14 bg-gray-50/80 rounded-xl border border-gray-100 p-1.5 flex flex-col overflow-hidden relative shadow-sm">
             <motion.div 
               animate={isHovered && isInView ? { y: [0, -45] } : { y: 0 }} 
               transition={{ duration: 5, repeat: Infinity, ease: "linear" }} 
               className="flex flex-col gap-1 transform-gpu"
             >
                <div className="bg-white rounded border border-gray-100 p-1 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-gray-400" />
                      <span className="text-[6px] font-bold text-gray-700">Smoke Incident</span>
                   </div>
                   <span className="text-[5px] font-black text-green-500 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full" /> 2s ago</span>
                </div>
                <div className="bg-white rounded border border-gray-100 p-1 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-gray-400" />
                      <span className="text-[6px] font-bold text-gray-700">Industrial Zone</span>
                   </div>
                   <span className="text-[5px] font-black text-green-500 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full" /> 12s ago</span>
                </div>
                <div className="bg-white rounded border border-gray-100 p-1 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-[6px] font-bold text-gray-700">AQI Report</span>
                   </div>
                   <span className="text-[5px] font-black text-green-500 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full" /> 1m ago</span>
                </div>
                {/* Duplicate for scrolling */}
                <div className="bg-white rounded border border-gray-100 p-1 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-gray-400" />
                      <span className="text-[6px] font-bold text-gray-700">Smoke Incident</span>
                   </div>
                   <span className="text-[5px] font-black text-green-500 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full" /> 2s ago</span>
                </div>
             </motion.div>
             <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          </div>

       </div>
    </div>
  );
});

CloudVisual.displayName = 'CloudVisual';

const CitizenVisual = memo(({ isHovered, isInView = true }) => {
  return (
    <div className="relative w-full h-full bg-gray-50/95 rounded-2xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex p-3 gap-3 overflow-hidden pointer-events-none group-hover:-translate-y-3 group-hover:-translate-x-1 transition-transform duration-700 z-10">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-50" />

      {/* LEFT COLUMN: Report Details & Timeline */}
      <div className="w-[50%] flex flex-col gap-3 h-full relative z-10">
         
         {/* Complaint Summary Card */}
         <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <div className="flex justify-between items-start">
               <div>
                  <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Case ID</span>
                  <span className="text-[10px] font-black text-gray-800">AWR-2026-0182</span>
               </div>
               <div className="bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  <span className="text-[6px] font-black text-red-600 uppercase tracking-widest">High Priority</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
               <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <div className="flex flex-col">
                     <span className="text-[5px] text-gray-400 font-bold uppercase">Location</span>
                     <span className="text-[7px] font-bold text-gray-700">Industrial, Chennai</span>
                  </div>
               </div>
               <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <div className="flex flex-col">
                     <span className="text-[5px] text-gray-400 font-bold uppercase">Evidence</span>
                     <span className="text-[7px] font-bold text-gray-700">Smoke_Inc.jpg</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Tracking Timeline */}
         <div className="flex-1 bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Tracking</span>
            
            <div className="relative flex-1 flex flex-col justify-between pl-4">
               {/* Vertical Connecting Line */}
               <div className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ scaleY: 0 }} animate={isHovered ? { scaleY: 0.75 } : { scaleY: 0.75 }} style={{ originY: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="w-full h-full bg-primary transform-gpu" />
               </div>

               {/* Timeline Steps */}
               {[
                 { title: "Report Submitted", time: "10:32 AM", active: true, color: "border-primary", bg: "bg-primary" },
                 { title: "AI Verified", time: "10:34 AM", active: true, color: "border-primary", bg: "bg-primary" },
                 { title: "Authority Assigned", time: "10:36 AM", active: true, color: "border-primary", bg: "bg-primary" },
                 { title: "Investigation in Progress", time: "Current", active: true, pulsing: true, icon: <Activity className="w-2.5 h-2.5 text-orange-500" />, color: "border-orange-500", bg: "bg-orange-500" },
                 { title: "Resolution Pending", time: "Pending", active: false, color: "border-gray-200", bg: "bg-gray-200" }
               ].map((step, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }} 
                    transition={{ duration: 0.3, delay: idx * 0.3 }} 
                    className="relative flex items-center justify-between"
                  >
                     {/* Step Node */}
                     <div className={`absolute -left-[20px] w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center z-10 ${step.color} shadow-sm bg-white`}>
                        {step.icon ? step.icon : (step.active && !step.pulsing ? (
                           <svg className="w-2 h-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : <div className={`w-1.5 h-1.5 rounded-full ${step.bg}`} />)}
                        {step.pulsing && isHovered && isInView && <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-orange-500 rounded-full transform-gpu" />}
                     </div>
                     <div className="flex flex-col ml-1">
                        <span className={`text-[7px] font-black ${step.active ? (step.pulsing ? 'text-orange-600' : 'text-gray-800') : 'text-gray-400'}`}>{step.title}</span>
                     </div>
                     <span className={`text-[5px] font-bold ${step.active ? 'text-gray-500' : 'text-gray-300'}`}>{step.time}</span>
                  </motion.div>
               ))}
            </div>
         </div>

      </div>

      {/* RIGHT COLUMN: Authority & Updates */}
      <div className="w-[50%] flex flex-col gap-3 h-full relative z-10">
         
         {/* Authority Panel */}
         <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl p-3 shadow-lg border border-gray-700 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-primary/30 rounded-full blur-xl" />
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600/50">
               <div className="w-7 h-7 bg-blue-900 rounded-full border border-blue-500 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
               </div>
               <div>
                  <span className="text-[8px] font-black text-white leading-none block mb-0.5">Municipal Officer</span>
                  <span className="text-[5.5px] font-bold text-blue-300 uppercase tracking-widest">Pollution Control Board</span>
               </div>
            </div>
            
            {/* Live Progress Bar */}
            <div className="flex justify-between items-center mb-1">
               <div className="flex items-center gap-1 bg-green-500/20 px-1.5 py-0.5 rounded border border-green-500/30">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[5px] font-black text-green-400 uppercase tracking-widest">Live Status</span>
               </div>
               <span className="text-[8px] font-black text-white">80%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
               <motion.div initial={{ scaleX: 0 }} animate={isHovered ? { scaleX: 0.8 } : { scaleX: 0.8 }} style={{ originX: 0 }} transition={{ duration: 2, ease: "easeOut" }} className="h-full w-full bg-gradient-to-r from-green-500 to-green-400 transform-gpu" />
            </div>
         </div>

         {/* Recent Updates Feed */}
         <div className="flex-1 bg-white rounded-xl p-2 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Recent Updates</span>
            
            <div className="flex-1 relative overflow-hidden">
               <motion.div 
                 initial={{ y: 0 }} 
                 animate={isHovered && isInView ? { y: -70 } : { y: 0 }} 
                 transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                 className="flex flex-col gap-1.5 absolute w-full transform-gpu"
               >
                  {[
                    { t: "10:40 AM", m: "Inspection Started on-site", icon: <MapPin className="w-2.5 h-2.5 text-orange-500"/>, bg: "bg-orange-50 border-orange-100" },
                    { t: "10:36 AM", m: "Officer Assigned", icon: <Users className="w-2.5 h-2.5 text-blue-500"/>, bg: "bg-blue-50 border-blue-100" },
                    { t: "10:34 AM", m: "AI Verification Completed", icon: <Cloud className="w-2.5 h-2.5 text-purple-500"/>, bg: "bg-purple-50 border-purple-100" },
                    { t: "10:32 AM", m: "Complaint Submitted", icon: <FileText className="w-2.5 h-2.5 text-gray-500"/>, bg: "bg-gray-50 border-gray-100" },
                    // Duplicates for infinite scroll loop
                    { t: "10:40 AM", m: "Inspection Started on-site", icon: <MapPin className="w-2.5 h-2.5 text-orange-500"/>, bg: "bg-orange-50 border-orange-100" },
                    { t: "10:36 AM", m: "Officer Assigned", icon: <Users className="w-2.5 h-2.5 text-blue-500"/>, bg: "bg-blue-50 border-blue-100" },
                  ].map((act, i) => (
                     <div key={i} className={`flex items-start gap-1.5 p-1.5 rounded-md border ${act.bg}`}>
                        <div className="mt-0.5">{act.icon}</div>
                        <div className="flex flex-col">
                           <span className="text-[6.5px] font-bold text-gray-700 leading-tight">{act.m}</span>
                           <span className="text-[5px] font-bold text-gray-400 mt-0.5">{act.t}</span>
                        </div>
                     </div>
                  ))}
               </motion.div>
               
               <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-white to-transparent pointer-events-none" />
            </div>
         </div>

      </div>

    </div>
  );
});

CitizenVisual.displayName = 'CitizenVisual';


// ==========================================
// CORE FEATURE CARD COMPONENT
// ==========================================
const FeatureCard = memo(({ feature, index }) => {
  const cardRef = useRef(null);
  // Viewport detection scoped specifically to this card
  const isInView = useInView(cardRef, { margin: "50px 0px 50px 0px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-[28px] overflow-hidden ${feature.colSpan} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer transform-gpu`}
    >
      <div className={`absolute inset-0 border transition-all duration-300 rounded-[28px] ${feature.darkTheme ? 'bg-[#0A101C]/95 border-white/10 group-hover:border-white/20' : 'bg-white/85 backdrop-blur-sm border-white group-hover:border-primary/40'}`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent rounded-[28px] transition-opacity duration-300 pointer-events-none" />

      <div className="relative w-full h-full flex flex-col lg:flex-row p-8 z-10 pointer-events-none gap-8">
        
        {/* Left Side: 40% Text Content */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between relative z-20">
           <div>
              <div className="flex justify-between items-start mb-8">
                <div className={`w-[64px] h-[64px] rounded-[20px] shadow-sm flex items-center justify-center transition-all duration-300 ${feature.darkTheme ? 'bg-white/10 border border-white/20 group-hover:bg-white/20' : 'bg-white border border-primary/10 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_rgba(47,128,237,0.3)]'}`}>
                  <feature.icon className={`w-7 h-7 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${feature.darkTheme ? 'text-white' : 'text-primary'}`} strokeWidth={1.5} />
                </div>
                {feature.badge && (
                  <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold shadow-sm tracking-widest uppercase ${feature.darkTheme ? 'bg-white/10 border-white/20 text-white' : 'bg-white/95 border-primary/20 text-primary'}`}>
                    {feature.badge}
                  </div>
                )}
              </div>

              <div>
                <h3 className={`text-[24px] font-extrabold mb-3 leading-tight tracking-tight ${feature.darkTheme ? 'text-white' : 'text-text-primary'}`}>{feature.title}</h3>
                <p className={`text-[15px] leading-relaxed mb-6 ${feature.darkTheme ? 'text-white/80' : 'text-text-secondary'}`}>{feature.desc}</p>
              </div>
           </div>

           <div className={`flex items-center gap-2 font-bold text-[13px] opacity-0 translate-x-[-15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mt-2 tracking-wide ${feature.darkTheme ? 'text-white' : 'text-primary'}`}>
             Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
           </div>
        </div>
        
        {/* Right Side: 60% Visual Container */}
        <div className="w-full lg:w-[60%] h-full relative flex items-center justify-center">
           {feature.visual && <feature.visual isHovered={isHovered} isInView={isInView} />}
        </div>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// ==========================================
// FEATURE DATA (10 CARDS)
// ==========================================
const features = [
  { title: 'Real-Time Air Quality Monitoring', desc: 'Instantaneous tracking of dangerous pollutants like PM2.5 and CO2 via high-precision IoT sensors.', icon: Activity, badge: 'Live', colSpan: 'lg:col-span-5', visual: AQIVisual },
  { title: 'AI Smoke Detection', desc: 'Computer vision algorithms identify visual smoke plumes automatically in real-time, eliminating false positives.', icon: Flame, badge: 'AI Powered', colSpan: 'lg:col-span-7', visual: AISmokeVisual },
  { title: 'Automated Evidence Capture', desc: 'High-res photo capture triggers instantly the moment an environmental threshold is crossed, securing irrefutable proof.', icon: Camera, badge: 'Smart Capture', colSpan: 'lg:col-span-12', visual: EvidenceVisual },
  { title: 'Instant Alert System', desc: 'WebSocket alerts instantly notify authorities of breaches via SMS and push.', icon: Bell, badge: 'Real-Time', colSpan: 'lg:col-span-6', visual: AlertVisual },
  { title: 'Live GIS Monitoring', desc: 'Interactive maps with sensor markers, route lines, and radar pulses.', icon: MapPin, badge: 'GIS', colSpan: 'lg:col-span-6', visual: GISVisual },
  { title: 'Satellite Heatmaps', desc: 'Visualize pollution concentration zones dynamically with satellite overlays.', icon: Map, badge: 'Satellite', colSpan: 'lg:col-span-12', visual: SatelliteVisual, darkTheme: true },
  { title: 'Government Command Center', desc: 'A gorgeous, centralized dashboard tailored for municipality officials.', icon: LayoutDashboard, badge: 'Dashboard', colSpan: 'lg:col-span-12', visual: DashboardVisual },
  { title: 'Historical Pollution Analytics', desc: 'Analyze trends over months to form data-driven policies and reports.', icon: History, badge: 'Analytics', colSpan: 'lg:col-span-6', visual: AnalyticsVisual },
  { title: 'Secure Cloud Evidence Storage', desc: 'Redundant, scalable cloud storage for all violation evidence.', icon: Cloud, badge: 'Cloud', colSpan: 'lg:col-span-6', visual: CloudVisual },
  { title: 'Citizen Reporting & Tracking', desc: 'Empower locals to report anomalies directly into the platform with ease.', icon: Users, badge: 'Citizen', colSpan: 'lg:col-span-12', visual: CitizenVisual },
];

// ==========================================
// MAIN SECTION
// ==========================================
const Features = memo(() => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: "100px 0px 100px 0px" });

  return (
    <section ref={sectionRef} id="features" className="py-32 bg-[var(--color-bg-light)] relative overflow-hidden">
      {/* Background ambient visuals */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(47,128,237,0.08)_0%,_rgba(0,0,0,0)_70%)] rounded-full pointer-events-none transform-gpu" />
      <div className="absolute bottom-[5%] right-[-10%] w-[900px] h-[900px] bg-[radial-gradient(circle,_rgba(111,200,255,0.08)_0%,_rgba(0,0,0,0)_70%)] rounded-full pointer-events-none transform-gpu" />
      
      {/* Floating particles - active only when section is in view */}
      {isInView && (
        <>
          <motion.div animate={{ y: [0, -80, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[15%] left-[15%] w-3 h-3 bg-primary/40 rounded-full blur-[2px] transform-gpu" />
          <motion.div animate={{ y: [0, 80, 0], x: [0, 40, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[70%] right-[20%] w-4 h-4 bg-accent/40 rounded-full blur-[3px] transform-gpu" />
        </>
      )}

      <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full mx-auto mb-28 transform-gpu"
        >
          <h2 className="text-[56px] lg:text-[76px] font-extrabold text-text-primary mb-8 tracking-tight leading-[1.1]">
            <span className="inline-block">Powerful</span>{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
              Features
            </span>
          </h2>
          <p className="text-[20px] text-text-secondary leading-relaxed max-w-3xl mx-auto">
            Discover how AWARE combines IoT, AI, GIS, and Cloud technologies to detect, analyze, and report air pollution in real time.
          </p>
        </motion.div>

        {/* 12-Column Asymmetrical Bento Grid */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.12 } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-7 auto-rows-[420px]"
        >
          {features.map((feat, idx) => (
            <FeatureCard key={idx} feature={feat} index={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
});

Features.displayName = 'Features';

export default Features;
