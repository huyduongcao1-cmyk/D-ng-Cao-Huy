import React, { useEffect, useState, useMemo } from 'react';
import { LeaderboardEntry } from '../lib/types';
import { Home, Trophy, Medal, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface LeaderboardScreenProps {
  onHome: () => void;
}

export default function LeaderboardScreen({ onHome }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterChapter, setFilterChapter] = useState<string>('all');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chemArenaLeaderboard');
      if (stored) {
        const parsed: LeaderboardEntry[] = JSON.parse(stored);
        setEntries(parsed);
      }
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    }
  }, []);

  const filteredEntries = useMemo(() => {
    let result = [...entries];
    
    if (filterMode !== 'all') {
      result = result.filter(e => e.mode === filterMode);
    }
    
    if (filterChapter !== 'all') {
      result = result.filter(e => e.chapter === filterChapter);
    }

    // Sort by gold (desc), then accuracy (desc)
    return result.sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      return b.accuracy - a.accuracy;
    });
  }, [entries, filterMode, filterChapter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-4 md:p-8 font-sans">
      <div className="text-center mb-10 pt-8 relative z-10">
        <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
          BẢNG XẾP HẠNG
        </h1>
        <p className="text-slate-400 uppercase tracking-widest font-bold text-sm">Vinh danh các bậc thầy hóa học</p>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10 px-2 lg:px-0">
         {/* Filters */}
         <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 p-4 rounded-[2rem] border border-slate-800">
           <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-widest pb-1 md:pb-0 px-2">
             <Filter className="w-4 h-4" /> LỌC
           </div>
           
           <select 
             value={filterMode} 
             onChange={e => setFilterMode(e.target.value)}
             className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-amber-500 font-bold overflow-hidden"
           >
             <option value="all">Tất cả chế độ</option>
             <option value="single">Chơi Đơn</option>
             <option value="1v1">Đối Kháng 1v1</option>
             <option value="2v2">Đồng Đội 2v2</option>
           </select>

           <select 
             value={filterChapter} 
             onChange={e => setFilterChapter(e.target.value)}
             className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-amber-500 font-bold overflow-hidden"
           >
             <option value="all">Tất cả chương</option>
             <option value="chuong_4">Chương 4: Hydrocacbon</option>
             <option value="chuong_5">Chương 5: Halogen & Alcohol</option>
             <option value="chuong_6">Chương 6: Carbonyl & Acid</option>
             <option value="mixed">Đấu trường hỗn hợp</option>
           </select>
         </div>

         {filteredEntries.length === 0 ? (
           <div className="text-center text-slate-500 py-10 italic">
             Chưa có dữ liệu xếp hạng. Hãy chơi một ván để ghi danh!
           </div>
         ) : (
           <div className="flex flex-col gap-3">
             {filteredEntries.map((entry, index) => (
                <div key={entry.id} className={cn(
                  "flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[2rem] border transition-all",
                  index === 0 ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]" :
                  index === 1 ? "bg-slate-300/10 border-slate-300/50 shadow-[0_0_30px_rgba(203,213,225,0.1)]" :
                  index === 2 ? "bg-orange-600/10 border-orange-600/30 shadow-[0_0_30px_rgba(234,88,12,0.1)]" :
                  "bg-slate-900/50 border-slate-800"
                )}>
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                    {index === 0 ? <Medal className="w-10 h-10 text-amber-400 drop-shadow-md" /> :
                     index === 1 ? <Medal className="w-8 h-8 text-slate-300 drop-shadow-md" /> :
                     index === 2 ? <Medal className="w-8 h-8 text-orange-600 drop-shadow-md" /> :
                     <span className="text-2xl font-black text-slate-600">#{index + 1}</span>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={cn("text-lg md:text-xl font-black truncate", index < 3 ? "text-slate-100" : "text-slate-300")}>{entry.name}</span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[80px] sm:max-w-none">{entry.className}</span>
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 flex-wrap">
                       <span>{entry.mode.toUpperCase()}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                       <span>Chương {entry.chapter.replace('chuong_', '')}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                       <span>{format(entry.date, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-10 shrink-0">
                     <div className="text-right">
                       <div className="text-2xl font-black text-amber-400 font-mono tracking-tighter">{entry.gold}</div>
                       <div className="text-[10px] text-amber-500/50 uppercase tracking-widest font-bold hidden sm:block">Vàng</div>
                     </div>
                     <div className="text-right hidden sm:block">
                       <div className="text-xl font-black text-emerald-400 font-mono tracking-tighter">{Math.round(entry.accuracy)}%</div>
                       <div className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold">Chính xác</div>
                     </div>
                  </div>
                </div>
             ))}
           </div>
         )}
      </div>

      <div className="flex justify-center mt-12 pb-8 relative z-10 w-full">
        <button
          onClick={onHome}
          className="flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold tracking-widest rounded-2xl border border-slate-700 transition-all hover:-translate-y-1 hover:shadow-lg hover:text-white"
        >
          <Home className="w-5 h-5" />
          MÀN HÌNH CHÍNH
        </button>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
