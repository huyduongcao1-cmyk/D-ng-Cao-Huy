import React, { useState } from 'react';
import { Chapter, GameMode, PlayerState, UserInfo } from './lib/types';
import PlayScreen from './components/PlayScreen';
import EndScreen from './components/EndScreen';
import WelcomeScreen from './components/WelcomeScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { Beaker, FlaskConical, Atom, Gamepad2, Users, Swords, ChevronRight, Trophy } from 'lucide-react';
import { cn } from './lib/utils';
import { getQuestionsForGame } from './game/GameEngine';

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [view, setView] = useState<'welcome' | 'menu' | 'play' | 'end' | 'leaderboard'>('welcome');
  const [mode, setMode] = useState<GameMode>('single');
  const [chapter, setChapter] = useState<Chapter>('chuong_4');
  
  // Game Data
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [questionPools, setQuestionPools] = useState<Record<string, any>>({});

  const handleWelcomeComplete = (info: UserInfo) => {
    setUserInfo(info);
    setView('menu');
  };

  const handleStart = () => {
    if (!userInfo) return;

    // Treat 2v2 as 2 entities (Team 1 and Team 2)
    const effectiveMode = mode === '2v2' ? '1v1' : mode;
    const pools = getQuestionsForGame(chapter, effectiveMode);
    setQuestionPools(pools);

    const initPlayers: PlayerState[] = Object.keys(pools).map((pId, index) => ({
      id: pId,
      name: index === 0 ? `${userInfo.fullName} - ${userInfo.className}` : (mode === '2v2' ? 'Đội 2' : 'Người Chơi 2'),
      gold: 0,
      score: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      activeGods: []
    }));

    setPlayers(initPlayers);
    setView('play');
  };

  const handleEnd = (finalPlayers: PlayerState[]) => {
    setPlayers(finalPlayers);
    setView('end');
  };

  if (view === 'welcome') {
    return <WelcomeScreen onStart={handleWelcomeComplete} />;
  }

  if (view === 'play') {
    return (
      <PlayScreen 
        mode={mode} 
        chapter={chapter} 
        initialPlayers={players} 
        questionPools={questionPools} 
        onEnd={handleEnd}
        onQuit={() => setView('menu')}
      />
    );
  }

  if (view === 'end') {
    return <EndScreen 
      players={players} 
      mode={mode}
      chapter={chapter}
      onHome={() => setView('menu')} 
      onLeaderboard={() => setView('leaderboard')}
      onReplay={handleStart}
    />;
  }

  if (view === 'leaderboard') {
    return <LeaderboardScreen onHome={() => setView('menu')} />;
  }

  // MAIN MENU
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 md:p-6 selection:bg-blue-500/30 font-sans">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-rose-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">
          <FlaskConical className="w-12 h-12 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent uppercase">
            Hóa Học <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Arena</span>
          </h1>
        </div>
        <p className="text-slate-400 mb-12 text-center text-lg max-w-md font-light leading-relaxed">
          Xin chào <span className="text-blue-400 font-bold">{userInfo?.fullName} - {userInfo?.className}</span>! Chọn chế độ và bắt đầu ngay.
        </p>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-slate-800 shadow-2xl">
          <div className="mb-10">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Atom className="w-4 h-4 text-blue-400" /> Chọn Chương
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'chuong_4', title: 'Hydrocacbon', desc: 'Alkane, Alkene, Benzene...' },
                { id: 'chuong_5', title: 'Halogen & Alcohol', desc: 'Alcohol, Phenol...' },
                { id: 'chuong_6', title: 'Carbonyl & Acid', desc: 'Aldehyde, Ketone...' },
                { id: 'mixed', title: 'Đấu Trường Hỗn Hợp', desc: 'Tổng hợp mọi chuyên đề' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChapter(ch.id as Chapter)}
                  className={cn(
                    "text-left p-5 rounded-2xl border transition-all duration-300",
                    chapter === ch.id 
                      ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  )}
                >
                  <div className={cn("font-bold mb-1 text-lg", chapter === ch.id ? "text-blue-400" : "text-slate-200")}>
                    {ch.title}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">{ch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400" /> Chế Độ Chơi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setMode('single')}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border transition-all duration-300",
                  mode === 'single' ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-emerald-400" : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <Gamepad2 className="w-8 h-8 mb-3" />
                <span className="font-bold">Chơi Đơn</span>
              </button>
              <button
                onClick={() => setMode('1v1')}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border transition-all duration-300",
                  mode === '1v1' ? "bg-rose-500/10 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] text-rose-400" : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <Swords className="w-8 h-8 mb-3" />
                <span className="font-bold">Đối Kháng 1v1</span>
              </button>
              <button
                onClick={() => setMode('2v2')}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border transition-all duration-300",
                  mode === '2v2' ? "bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-amber-500" : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <Users className="w-8 h-8 mb-3" />
                <span className="font-bold">Đồng Đội 2v2</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            VÀO ĐẤU TRƯỜNG <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => setView('leaderboard')}
            className="w-full mt-4 py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold tracking-widest border border-amber-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 uppercase"
          >
            <Trophy className="w-5 h-5" /> BẢNG XẾP HẠNG
          </button>
        </div>
      </div>
    </div>
  );
}
