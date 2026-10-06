import React from 'react';
import { Wifi, BatteryMedium, Signal, Sparkles } from 'lucide-react';

interface MobileSmartphoneFrameProps {
  children: React.ReactNode;
  onExitPreview: () => void;
}

export const MobileSmartphoneFrame: React.FC<MobileSmartphoneFrameProps> = ({
  children,
  onExitPreview,
}) => {
  return (
    <div className="py-6 px-2 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-900/80 backdrop-blur-sm">
      {/* Friendly Top Controller Bar */}
      <div className="mb-3.5 flex items-center justify-between w-full max-w-[400px] px-2 text-white text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tampilan Smartphone Ramah</span>
        </div>
        <button
          onClick={onExitPreview}
          className="text-2xs bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full text-white font-semibold transition-all active:scale-95 border border-white/10"
        >
          Layar Penuh ✕
        </button>
      </div>

      {/* Smartphone Chassis */}
      <div className="relative w-full max-w-[390px] h-[790px] bg-slate-950 rounded-[48px] p-2.5 shadow-2xl ring-1 ring-white/15 border-4 border-slate-700/80 flex flex-col overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-sm pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Mobile Status Bar */}
        <div className="pt-2 px-5 pb-1 flex items-center justify-between text-2xs font-semibold z-40 select-none bg-white text-slate-900 rounded-t-[36px]">
          <span className="font-mono text-xs">09:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>

        {/* Viewport Screen with Smooth Internal Scroll */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 relative pb-20 no-scrollbar">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/60 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};
