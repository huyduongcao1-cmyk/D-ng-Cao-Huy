import React, { useEffect, useState } from 'react';
import { PlayerState, GameMode, Chapter, LeaderboardEntry } from '../lib/types';
import { cn } from '../lib/utils';
import { Trophy, Home, Coins, Target, BarChart2, Zap, RotateCcw, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndScreenProps {
  players: PlayerState[];
  mode: GameMode;
  chapter: Chapter;
  onHome: () => void;
  onLeaderboard: () => void;
  onReplay: () => void;
}

export default function EndScreen({ players, mode, chapter, onHome, onLeaderboard, onReplay }: EndScreenProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6']
    });

    if (!saved) {
      saveToLeaderboard();
      setSaved(true);
    }
  }, [players, mode, chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveToLeaderboard = () => {
    try {
      const stored = localStorage.getItem('chemArenaLeaderboard');
      const leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
      
      const newEntries: LeaderboardEntry[] = players.map(p => {
        // Player names are structured as "FullName - ClassName" for single and P1 in 1v1
        let pName = p.name;
        let pClass = 'N/A';
        if (pName.includes(' - ')) {
           const parts = pName.split(' - ');
           pName = parts[0];
           pClass = parts[1] || 'N/A';
        }
        return {
          id: crypto.randomUUID(),
          name: pName,
          className: pClass,
          mode,
          chapter,
          gold: p.gold,
          correct: p.correctAnswers,
          accuracy: p.totalAnswered > 0 ? (p.correctAnswers / p.totalAnswered) * 100 : 0,
          date: Date.now()
        };
      });

      localStorage.setItem('chemArenaLeaderboard', JSON.stringify([...leaderboard, ...newEntries]));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  };

  const getFeedback = (accuracy: number) => {
    if (accuracy >= 90) return "Master cấp Thần! Kiến thức Hóa của bạn tuyệt đỉnh.";
    if (accuracy >= 70) return "Học sinh Giỏi! Nền tảng rất chắc chắn.";
    if (accuracy >= 50) return "Khá tốt! Nhưng cần ôn lại một chút để vươn tầm.";
    return "Cần cố gắng hơn nữa. Hãy học lại kỹ lý thuyết nhé!";
  };

  const isMulti = players.length > 1;
  const sorted = [...players].sort((a, b) => b.gold - a.gold);
  const winner = sorted[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-4 md:p-8 font-sans overflow-y-auto">
      <div className="text-center mb-8 pt-8">
        <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
          KẾT THÚC
        </h1>
        {isMulti && (
          <p className="mt-4 text-xl">
            Chiến thắng: <span className="font-bold text-amber-500">{winner.name}</span>
          </p>
        )}
      </div>

      <div className={cn(
        "flex-1 flex gap-6 md:gap-8 max-w-5xl w-full mx-auto mb-12 flex-wrap",
        isMulti ? "flex-col md:flex-row" : "justify-center"
      )}>
        {players.map((p, i) => {
          const acc = p.totalAnswered > 0 ? Math.round((p.correctAnswers / p.totalAnswered) * 100) : 0;
          return (
            <div 
              key={p.id} 
              className={cn(
                 "flex-1 rounded-[2rem] p-6 md:p-8 border backdrop-blur-sm relative overflow-hidden flex flex-col",
                 p.id === winner.id && isMulti ? "border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-colors",
                 !isMulti && "max-w-xl w-full border-blue-500 bg-gradient-to-b from-slate-900 to-indigo-950/30"
              )}
            >
              {p.id === winner.id && isMulti && (
                <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 font-bold px-4 py-1 rounded-bl-[1.5rem] text-sm">
                  WINNER
                </div>
              )}
              
              <h2 className={cn(
                "text-2xl font-black uppercase mb-6 text-center tracking-widest",
                !isMulti ? "text-blue-400" : p.id === winner.id ? "text-amber-500" : "text-slate-400"
              )}>
                {p.name}
              </h2>

              <div className="space-y-4 mb-8">
                <StatRow icon={<Coins className="text-amber-400" />} label="Tổng Vàng" value={p.gold} />
                <StatRow icon={<Target className="text-emerald-400" />} label="Chính xác" value={`${acc}%`} />
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                    <div className="text-xs text-emerald-400 font-bold mb-1">ĐÚNG</div>
                    <div className="text-2xl text-emerald-500 font-black">{p.correctAnswers}</div>
                  </div>
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                    <div className="text-xs text-red-400 font-bold mb-1">SAI / BỎ QUA</div>
                    <div className="text-2xl text-red-500 font-black">{40 - p.correctAnswers}</div>
                  </div>
                </div>
              </div>

              {!isMulti && (
                 <div className="mt-auto bg-slate-950/50 border border-indigo-500/30 p-6 rounded-2xl flex items-start gap-4">
                   <Zap className="w-8 h-8 text-indigo-400 shrink-0" />
                   <div>
                     <h4 className="font-bold text-slate-300 mb-1">Nhận xét từ hệ thống</h4>
                     <p className="text-sm text-indigo-300">{getFeedback(acc)}</p>
                   </div>
                 </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-4 pb-8 max-w-2xl mx-auto w-full">
        <button
          onClick={onLeaderboard}
          className="flex-1 flex justify-center items-center gap-3 px-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold tracking-widest rounded-2xl border border-amber-500/30 transition-all hover:-translate-y-1"
        >
          <Trophy className="w-5 h-5" />
          BẢNG XẾP HẠNG
        </button>
        <button
          onClick={onReplay}
          className="flex-1 flex justify-center items-center gap-3 px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold tracking-widest rounded-2xl border border-blue-500/50 transition-all hover:-translate-y-1"
        >
          <RotateCcw className="w-5 h-5" />
          CHƠI LẠI
        </button>
        <button
          onClick={onHome}
          className="flex-1 flex justify-center items-center gap-3 px-6 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold tracking-widest rounded-2xl border border-slate-700 transition-all hover:-translate-y-1 hover:text-white"
        >
          <Home className="w-5 h-5" />
          MÀN HÌNH CHÍNH
        </button>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
      <div className="flex items-center gap-3 text-slate-300">
        {icon}
        <span className="font-medium text-lg">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono">
        {value}
      </div>
    </div>
  );
}
