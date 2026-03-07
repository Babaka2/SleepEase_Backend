import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  screenBackground?: string; // 可选的屏幕背景样式
}

export default function PhoneFrame({ children, screenBackground = 'bg-gradient-to-br from-slate-700 via-slate-800 to-blue-900' }: PhoneFrameProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-white">
      {/* iPhone 15 Frame - 统一尺寸 */}
      <div className="relative w-full max-w-[320px] aspect-[9/19.5]">
        {/* Phone Body with realistic border */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-[3.5rem] shadow-2xl">
          {/* Metallic border highlight - Outer glow */}
          <div className="absolute inset-0 rounded-[3.5rem] shadow-[0_0_30px_rgba(0,0,0,0.5)]"></div>
          
          {/* Metallic frame layers */}
          <div className="absolute inset-0 rounded-[3.5rem] border-[4px] border-gray-600/60"></div>
          <div className="absolute inset-0 rounded-[3.5rem] border-[2px] border-gray-500/30"></div>
          <div className="absolute inset-[1px] rounded-[3.4rem] border-[1px] border-white/20"></div>
          <div className="absolute inset-[2px] rounded-[3.3rem] border-[1px] border-black/40"></div>
          
          {/* Side Buttons - Enhanced */}
          {/* Volume Buttons */}
          <div className="absolute -left-[1px] top-[140px] w-[3px] h-7 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 rounded-r-md border-t border-b border-gray-500/50 shadow-inner"></div>
          <div className="absolute -left-[1px] top-[180px] w-[3px] h-7 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 rounded-r-md border-t border-b border-gray-500/50 shadow-inner"></div>
          {/* Silent Switch */}
          <div className="absolute -left-[1px] top-[100px] w-[3px] h-5 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 rounded-r-md border-t border-b border-gray-500/50 shadow-inner"></div>
          {/* Power Button */}
          <div className="absolute -right-[1px] top-[160px] w-[3px] h-20 bg-gradient-to-l from-gray-600 via-gray-700 to-gray-600 rounded-l-md border-t border-b border-gray-500/50 shadow-inner"></div>
          
          {/* Screen Bezel */}
          <div className="absolute inset-[8px] bg-black rounded-[3rem] shadow-inner">
            {/* Inner bezel shadow for depth */}
            <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
            
            {/* Dynamic Island - Enhanced */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[110px] h-[35px] bg-black rounded-full z-10 shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(0,0,0,0.5)] border border-gray-900/50"></div>
            
            {/* Phone Screen */}
            <div className={`w-full h-full rounded-[3rem] overflow-hidden relative ${screenBackground}`}>
              {/* Content Container */}
              <div className="relative w-full h-full">
                {children}
              </div>
              
              {/* Home Indicator - Enhanced - 固定在屏幕底部 */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-[5px] bg-white/90 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
