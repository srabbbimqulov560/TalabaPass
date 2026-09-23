import { GraduationCap } from 'lucide-react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function TalabaLoader({ text, fullScreen = false }: LoaderProps) {
  return (
    // 1. TASHQI QOBIQ: Ekranni to'liq yopadi yoki minimum 60vh balandlik oladi.
    <div className={fullScreen ? "fixed inset-0 z-[100] w-full h-[100dvh] bg-[hsl(var(--background))]" : "relative w-full min-h-[60vh]"}>
      <style>{`
        @keyframes outer-spin {
          100% { transform: rotate(360deg); }
        }
        .animate-outer-spin {
          animation: outer-spin 3s linear infinite;
        }

        @keyframes morph-circle {
          0%, 100% { stroke-dasharray: 0.1, 83.6; } 
          50% { stroke-dasharray: 251.2, 0; }        
        }
        .animate-morph {
          animation: morph-circle 2.5s ease-in-out infinite;
        }

        @keyframes pop-and-nod {
          0% { transform: scale(0) translateY(15px); opacity: 0; }
          15% { transform: scale(1.1) translateY(-3px); opacity: 1; }
          25% { transform: scale(1) translateY(0); }
          40% { transform: rotate(-15deg) translateY(2px); }
          55% { transform: rotate(10deg) translateY(-1px); }
          70% { transform: rotate(0deg) translateY(0); }
          100% { transform: rotate(0deg) translateY(0); opacity: 1; }
        }
        .animate-pop-nod {
          animation: pop-and-nod 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: center bottom;
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 1.5s forwards;
          opacity: 0;
        }
      `}</style>

      {/* 2. MUTLAQ MARKAZ: Aynan shu qator animatsiyani har doim aniq o'rtaga mixlab qo'yadi */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        
        <div className="relative flex items-center justify-center w-[72px] h-[72px] mb-4">
          {/* Aylanuvchi SVG (3 ta shar) */}
          <svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 w-full h-full animate-outer-spin"
            style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }}
          >
            <defs>
              <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#glow-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              className="animate-morph"
              style={{ transformOrigin: 'center' }}
            />
          </svg>

          {/* O'rtadagi Qalqib chiquvchi Ikonka */}
          <div className="relative z-10 animate-pop-nod flex items-center justify-center">
            <div className="bg-[hsl(var(--background))] rounded-full p-1.5 shadow-sm">
              <GraduationCap size={26} className="text-[#10b981]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {text && (
          <p className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))] animate-fade-in-up tracking-wide whitespace-nowrap" style={{ animationDelay: '1.8s' }}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}