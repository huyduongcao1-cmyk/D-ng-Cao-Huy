import React, { useState } from 'react';
import { UserInfo } from '../lib/types';
import { FlaskConical } from 'lucide-react';
import { cn } from '../lib/utils';

interface WelcomeScreenProps {
  onStart: (info: UserInfo) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!fullName.trim() || !className.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    onStart({ fullName: fullName.trim(), className: className.trim() });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <FlaskConical className="w-32 h-32" />
         </div>

         <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase drop-shadow-sm mb-2">
              CHEM BATTLE 🧪
            </h1>
            <p className="text-slate-400 text-sm tracking-wider uppercase font-bold">Đấu Trường Sinh Tử</p>
         </div>

         <div className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Họ và tên</label>
             <input
               type="text"
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all font-bold tracking-wide"
               placeholder="Vd: Nguyễn Văn A"
               maxLength={30}
             />
           </div>
           
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Lớp</label>
             <input
               type="text"
               value={className}
               onChange={(e) => setClassName(e.target.value)}
               className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all font-bold tracking-wide"
               placeholder="Vd: 11A1"
               maxLength={10}
             />
           </div>

           {error && (
             <div className="text-rose-400 text-sm font-bold text-center bg-rose-500/10 py-2 rounded-xl border border-rose-500/20">
               {error}
             </div>
           )}
           
           <button
             onClick={handleStart}
             className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] uppercase"
           >
             BẮT ĐẦU
           </button>
         </div>
      </div>
    </div>
  );
}
