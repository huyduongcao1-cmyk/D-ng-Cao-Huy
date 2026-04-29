import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, GameMode, GodConfig, PlayerState, Question, GodId } from '../lib/types';
import { cn, formatChemical } from '../lib/utils';
import LabAnimation from './LabAnimation';
import { getRandomGods, GODS } from '../data/gods';
import { Coins, Timer, Shield, Zap, ChevronRight, Ban, Swords } from 'lucide-react';
import clsx from 'clsx';

interface PlayScreenProps {
  mode: GameMode;
  chapter: Chapter;
  initialPlayers: PlayerState[];
  questionPools: Record<string, Question[]>;
  onEnd: (players: PlayerState[]) => void;
  onQuit: () => void;
}

export default function PlayScreen({ mode, chapter, initialPlayers, questionPools, onEnd, onQuit }: PlayScreenProps) {
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0); // 0 or 1
  const [players, setPlayers] = useState<PlayerState[]>(initialPlayers);
  const [questionIndices, setQuestionIndices] = useState<Record<string, number>>(
    initialPlayers.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );

  // Status: playing -> transition -> god_selection -> next_round
  const [status, setStatus] = useState<'playing' | 'round_transition' | 'god_selection'>('playing');
  
  // God selection state
  const [godChoices, setGodChoices] = useState<GodConfig[]>([]);
  const [godSelectionTurn, setGodSelectionTurn] = useState(-1);

  // Question state
  const currentPlayer = players[turnIndex];
  const qIndex = questionIndices[currentPlayer.id];
  const currentQuestion = questionPools[currentPlayer.id][qIndex];
  const isDark = mode !== 'single';

  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Wisdom/Prophecy eliminated options
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // Derived active god flags
  const hasWisdom = currentPlayer.activeGods.includes('wisdom');
  const hasProphecy = currentPlayer.activeGods.includes('prophecy');
  const hasSpeed = currentPlayer.activeGods.includes('speed');

  useEffect(() => {
    // Prep question (eliminations)
    setEliminatedOptions([]);
    if (currentQuestion && (hasWisdom || hasProphecy)) {
      const wrongs = currentQuestion.options.filter(o => o !== currentQuestion.correct);
      if (hasWisdom) setEliminatedOptions(wrongs.slice(0, 2));
      else if (hasProphecy) setEliminatedOptions(wrongs.slice(0, 1));
      
      // Consume the god
      setPlayers(prev => prev.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, activeGods: p.activeGods.filter(g => g !== 'wisdom' && g !== 'prophecy') }
          : p
      ));
    }
    
    // Process Freeze
    const opp = players.find(p => p.id !== currentPlayer.id);
    let initTime = 15;
    if (opp && opp.activeGods.includes('freeze')) {
      initTime = 8; // Freeze severely drops time
    }
    // Process Chaos (Random init time or something fun if current player has it)
    if (currentPlayer.activeGods.includes('chaos')) {
       initTime += Math.floor(Math.random() * 10) - 5; // -5s to +5s random
    }
    
    setTimeLeft(initTime);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [qIndex, currentPlayer.id]);

  useEffect(() => {
    if (status !== 'playing' || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(null); // Time out
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, isAnswered]);

  const handleAnswer = (option: string | null) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.correct;
    
    setPlayers(prev => {
      const newPlayers = [...prev];
      const p = newPlayers[turnIndex];
      const opp = newPlayers[1 - turnIndex];

      let goldDelta = 0;
      
      p.totalAnswered += 1;
      if (isCorrect) {
        p.correctAnswers += 1;
        p.score += 10;
        goldDelta = 10;

        if (p.activeGods.includes('gamble')) goldDelta = 20;
        if (hasSpeed && timeLeft >= 10) goldDelta += 5;
        if (p.activeGods.includes('vampire') && opp) {
           goldDelta += 10;
           opp.gold = Math.max(0, opp.gold - 10);
        }
      } else {
        // Wrong or timeout
        if (p.activeGods.includes('luck') && Math.random() < 0.3) {
          goldDelta = 10;
        } else if (p.activeGods.includes('gamble')) {
          goldDelta = -10;
        }

        if (p.activeGods.includes('protect')) {
          goldDelta = 0;
          p.activeGods = p.activeGods.filter(g => g !== 'protect'); // consumes shield
        } else if (opp && opp.activeGods.includes('destroy')) {
          goldDelta -= 10;
        }
      }

      p.gold = Math.max(0, p.gold + goldDelta);
      return newPlayers;
    });

    // Proceed to next question after delay
    setTimeout(() => {
      setQuestionIndices(prevIdx => {
        const val = prevIdx[currentPlayer.id] + 1;
        const questionsDoneThisRound = val % 10;
        
        if (questionsDoneThisRound === 0 && val > 0) {
          setPlayers(latestPlayers => {
            if (turnIndex < latestPlayers.length - 1) {
               setStatus('round_transition');
            } else {
               if (round === 4) {
                 onEnd(latestPlayers);
               } else {
                 setGodSelectionTurn(0);
                 setGodChoices(getRandomGods(2));
                 setStatus('god_selection');
               }
            }
            return latestPlayers;
          });
        }
        return { ...prevIdx, [currentPlayer.id]: val };
      });
    }, 1500);
  };

  const handleNextTurn = () => {
    setTurnIndex(prev => prev + 1);
    setStatus('playing');
  };

  const selectGod = (godId: GodId) => {
    setPlayers(prev => {
      const p = prev[godSelectionTurn];
      // remove exclusive gods and Add
      const newGods = [...p.activeGods.filter(g => g !== 'wisdom' && g !== 'prophecy' && g !== 'protect'), godId];
      const copy = [...prev];
      copy[godSelectionTurn] = { ...p, activeGods: newGods };
      return copy;
    });

    if (godSelectionTurn < players.length - 1) {
      setGodSelectionTurn(prev => prev + 1);
      setGodChoices(getRandomGods(2));
    } else {
      // Start next round
      setRound(r => r + 1);
      setTurnIndex(0);
      setStatus('playing');
    }
  };

  if (status === 'round_transition') {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center select-none shadow-inner bg-slate-950 text-slate-200")}>
        <Swords className="w-16 h-16 mb-4 text-rose-500 animate-bounce" />
        <h2 className="text-3xl font-black uppercase mb-2">Đổi Lượt</h2>
        <p className="text-xl mb-8">Đến lượt của <span className="font-bold text-blue-400">{players[turnIndex + 1].name}</span></p>
        <button onClick={handleNextTurn} className="px-8 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform hover:bg-blue-500/30">
          BẮT ĐẦU LUÂN PHIÊN
        </button>
      </div>
    );
  }

  if (status === 'god_selection') {
    const selectorName = players[godSelectionTurn].name;
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 select-none bg-slate-950 text-slate-200 font-sans relative overflow-hidden")}>
         {/* Background ambient light */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-amber-500/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[120px]" />
         </div>

         <div className="relative z-10 w-full max-w-5xl">
           <div className="text-center mb-12">
             <h2 className="text-4xl font-black uppercase mb-3 text-amber-500 tracking-[0.2em] drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">CHỌN THẦN 🔮</h2>
             <p className="text-xl text-slate-400"><span className="text-blue-400 font-bold">{selectorName}</span>, hãy chọn 1 vị thần bảo trợ cho Vòng {round + 1}</p>
           </div>
           
           <div className="flex gap-8 justify-center flex-wrap md:flex-nowrap">
             {godChoices.map((god) => {
               // Map color utility to hex for radial glow
               const glowColorMap: Record<string, string> = {
                 'text-indigo-500': 'rgba(99, 102, 241, 0.5)',
                 'text-amber-500': 'rgba(245, 158, 11, 0.5)',
                 'text-amber-400': 'rgba(251, 191, 36, 0.5)',
                 'text-emerald-500': 'rgba(16, 185, 129, 0.5)',
                 'text-rose-500': 'rgba(244, 63, 94, 0.5)',
                 'text-purple-500': 'rgba(168, 85, 247, 0.5)',
                 'text-cyan-400': 'rgba(34, 211, 238, 0.5)',
                 'text-green-500': 'rgba(34, 197, 94, 0.5)',
                 'text-rose-600': 'rgba(225, 29, 72, 0.5)',
                 'text-blue-400': 'rgba(96, 165, 250, 0.5)'
               };
               const glow = glowColorMap[god.color] || 'rgba(255,255,255,0.5)';

               return (
                 <div
                   key={god.id}
                   className="group w-full max-w-sm rounded-[2rem] border border-slate-700/50 bg-slate-900/80 backdrop-blur-md flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-4 shadow-2xl relative"
                   style={{ boxShadow: `0 20px 40px -10px ${glow}` }}
                 >
                   {/* Card Ambient Glow from top */}
                   <div className="absolute top-0 inset-x-0 h-40 opacity-20 transition-opacity duration-500 group-hover:opacity-40" style={{ background: `radial-gradient(circle at 50% 0%, ${glow}, transparent 70%)` }} />
                   
                   {/* Big Image Representation */}
                   <div className="h-56 w-full flex items-center justify-center relative mt-6 shrink-0">
                     <div className="absolute inset-0 bg-slate-950/40 rounded-full mx-10 blur-xl opacity-50" />
                     <div 
                       className="w-40 h-40 rounded-full flex items-center justify-center relative z-10 overflow-hidden border border-slate-700/50"
                       style={{ background: `radial-gradient(circle at center, ${glow}, transparent 80%), #020617` }}
                     >
                       <Zap className={cn("w-20 h-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]", god.color)} />
                     </div>
                   </div>

                   <div className="p-8 flex-1 flex flex-col items-center text-center z-10">
                     <h3 className={cn("text-3xl font-black mb-4 tracking-wider uppercase", god.color)}>{god.name}</h3>
                     <p className="text-base text-slate-400 leading-relaxed font-medium pb-8 flex-1 flex items-center">{god.description}</p>
                     
                     <button 
                       onClick={() => selectGod(god.id as GodId)}
                       className={cn(
                         "w-full py-4 rounded-xl font-black text-lg tracking-[0.2em] uppercase transition-all duration-300",
                         "bg-slate-800 text-slate-300 border border-slate-700 group-hover:bg-white group-hover:text-slate-950 group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                       )}
                     >
                       CHỌN
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // --- PLAYING SCREEN (Elegant Dark Aesthetic) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 flex flex-col gap-6 overflow-hidden select-none">
      {/* Header: Battle Status */}
      <header className="flex justify-between items-center h-20 px-4 md:px-8 bg-slate-900/50 border border-slate-800 rounded-2xl shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center font-bold text-sm md:text-base", turnIndex === 0 ? "bg-blue-500/20 border-blue-400 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-500")}>P1</div>
          <div className="hidden sm:block">
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">{players[0].name}</div>
            <div className="text-lg md:text-xl font-mono text-amber-400">{players[0].gold} <span className="text-[10px] md:text-xs">VÀNG</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-rose-500 font-bold italic text-center">Round {round} / 4 &bull; Câu {(qIndex % 10) + 1}</div>
          <div className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tighter">00:{timeLeft.toString().padStart(2, '0')}</div>
          <div className="w-24 md:w-48 h-1 md:h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full", timeLeft > 5 ? "bg-gradient-to-r from-blue-500 to-emerald-500" : "bg-gradient-to-r from-rose-500 to-orange-500")}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 15) * 100}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 w-1/3 justify-end">
          {players.length > 1 ? (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">{players[1].name}</div>
                <div className="text-lg md:text-xl font-mono text-amber-400">{players[1].gold} <span className="text-[10px] md:text-xs">VÀNG</span></div>
              </div>
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center font-bold text-sm md:text-base", turnIndex === 1 ? "bg-rose-500/20 border-rose-400 text-rose-400" : "bg-slate-800 border-slate-700 text-slate-500")}>P2</div>
            </>
          ) : (
             <button onClick={onQuit} className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-slate-800/50 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all">THOÁT</button>
          )}
        </div>
      </header>

      {/* Main Content: Lab + Question */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
        {/* Question Section */}
        <div className={cn("flex flex-col gap-6", (currentQuestion.type === 'thi_nghiem' && currentQuestion.lab) || currentPlayer.activeGods.length > 0 ? "lg:col-span-8" : "lg:col-span-12 max-w-4xl mx-auto w-full")}>
          <div className="flex-1 p-6 md:p-10 bg-slate-900 border border-slate-800 md:rounded-[2rem] rounded-3xl relative overflow-hidden flex flex-col min-h-[250px] lg:min-h-0">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <div className="flex gap-2 mb-4 z-10 flex-wrap">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/50 text-blue-400 text-[10px] rounded-full uppercase tracking-widest font-bold">Chương {chapter.replace('chuong_', '')}</span>
              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/50 text-orange-400 text-[10px] rounded-full uppercase tracking-widest font-bold">
                {currentQuestion.difficulty === 'nhan_biet' ? 'Nhận biết' : currentQuestion.difficulty === 'thong_hieu' ? 'Thông hiểu' : 'Vận dụng'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-light leading-relaxed z-10 flex-1 flex items-center">
              {formatChemical(currentQuestion.question)}
            </h2>
          </div>

          {/* Answers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 lg:h-48 overflow-y-auto">
             {currentQuestion.options.map((opt, i) => {
              const isEliminated = eliminatedOptions.includes(opt);
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQuestion.correct;
              
              let bgClass = "bg-slate-900 border-slate-800 hover:bg-slate-800";
              let labelClass = "bg-slate-800 text-slate-400";
              let textClass = "text-slate-200 text-lg";

              if (isAnswered) {
                if (isCorrectOpt) {
                   bgClass = "bg-blue-500/20 border-blue-500";
                   labelClass = "bg-blue-500 text-white";
                } else if (isSelected) {
                   bgClass = "bg-rose-500/20 border-rose-500 opacity-60";
                   labelClass = "bg-rose-500 text-white";
                   textClass = "text-rose-200 text-lg";
                } else {
                   bgClass = "bg-slate-900 border-slate-800 opacity-40";
                }
              } else if (isSelected) {
                bgClass = "bg-slate-800 border-blue-500";
                labelClass = "bg-blue-500 text-white";
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered || isEliminated}
                  onClick={() => handleAnswer(opt)}
                  className={cn(
                    "group p-4 md:p-6 rounded-2xl border flex items-center gap-4 transition-all text-left",
                    bgClass,
                    !isAnswered && !isEliminated && "hover:border-blue-500",
                    isEliminated && "opacity-20 cursor-not-allowed scale-95 grayscale"
                  )}
                >
                  <span className={cn("w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-bold transition-colors", labelClass, !isAnswered && !isSelected && "group-hover:bg-blue-500 group-hover:text-white")}>
                     {['A','B','C','D'][i]}
                  </span>
                  <span className={cn(textClass, "flex-1 leading-snug")}>{formatChemical(opt)}</span>
                  {isEliminated && <Ban className="absolute inset-0 m-auto text-red-500 opacity-50 w-12 h-12 pointer-events-none" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lab & Gods Section */}
        {((currentQuestion.type === 'thi_nghiem' && currentQuestion.lab) || currentPlayer.activeGods.length > 0) && (
          <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto w-full">
            {/* Virtual Lab */}
            {currentQuestion.type === 'thi_nghiem' && currentQuestion.lab && (
              <div className="shrink-0 bg-slate-900 border border-slate-800 md:rounded-[2rem] rounded-3xl p-6 flex flex-col min-h-[300px]">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Virtual Lab Sim v2.0</div>
                <div className="flex-1 flex flex-col">
                  <div className="w-full flex-1">
                    <LabAnimation config={currentQuestion.lab} />
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                    <span className="text-xs text-blue-300 font-mono italic underline underline-offset-4 pointer-events-none">Phân tích phản ứng</span>
                  </div>
                </div>
              </div>
            )}

            {/* Active Gods List */}
            {currentPlayer.activeGods.length > 0 && (
              <div className="flex-1 shrink-0 bg-gradient-to-b from-slate-900 to-indigo-950/30 border border-slate-800 md:rounded-[2rem] rounded-3xl p-6 flex flex-col h-full min-h-[150px]">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Thần Đang Bảo Hộ</div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                   {currentPlayer.activeGods.map((gId, idx) => {
                     const gInfo = GODS.find(g => g.id === gId);
                     const isUsed = false; // Add logic if god is consumed
                     return (
                       <div key={idx} className={cn("flex gap-4 items-center transition-all", isUsed && "opacity-50 grayscale")}>
                         <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                           <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative">
                             <Zap className={cn("w-6 h-6", gInfo ? gInfo.color : "text-white")} />
                             <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900", gInfo ? gInfo.color.replace('text-', 'bg-') : "bg-blue-500")} />
                           </div>
                         </div>
                         <div className="flex flex-col justify-center">
                           <div className="text-sm font-bold text-indigo-300">{gInfo ? gInfo.name : gId.toUpperCase()}</div>
                           <div className="text-[10px] text-slate-400 leading-tight pr-2">{gInfo?.description}</div>
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="h-10 shrink-0 hidden md:flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-[0.3em] px-4 font-bold border-t border-slate-800/50 mt-auto pt-4 relative z-10 w-full max-w-7xl mx-auto">
        <div>Chemistry Arena: Final Update</div>
        <div className="flex gap-6">
          <span className={cn(chapter === 'chuong_4' ? "text-cyan-500/80 underline" : "text-slate-600")}>Hydrocarbon</span>
          <span className={cn(chapter === 'chuong_5' ? "text-cyan-500/80 underline" : "text-slate-600")}>Halogen - Alcohol</span>
          <span className={cn(chapter === 'chuong_6' ? "text-cyan-500/80 underline" : "text-slate-600")}>Carbonyl - Acid</span>
        </div>
        <div>© Lab Interactive / AI Studio</div>
      </footer>
    </div>
  );
}
