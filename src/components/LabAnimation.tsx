import { motion } from 'motion/react';
import { LabConfig } from '../lib/types';
import { formatChemical } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function LabAnimation({ config }: { config: LabConfig }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800); // Add agent
    const t2 = setTimeout(() => setStage(2), 2000); // React
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [config]);

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      {/* Background glow based on reaction */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{ 
          backgroundColor: stage === 2 && config.effect === 'color_change' ? config.color : 'transparent' 
        }}
        transition={{ duration: 1 }}
      />
      
      {/* Main Tube */}
      <div className="relative w-12 h-32 border-4 border-t-0 border-white/40 rounded-b-full overflow-hidden flex flex-col justify-end backdrop-blur-sm shadow-xl">
        <motion.div 
          className="w-full relative"
          initial={{ height: '40%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          animate={{ 
            height: stage >= 1 ? '70%' : '40%',
            backgroundColor: stage === 2 && config.effect === 'color_change' ? config.color : 'rgba(255, 255, 255, 0.4)'
          }}
          transition={{ duration: 1 }}
        >
          {/* Precipitate effect */}
          {stage === 2 && config.effect === 'precipitate' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 bg-white"
              initial={{ height: '0%' }}
              animate={{ height: '30%' }}
              transition={{ duration: 2 }}
            />
          )}

          {/* Gas bubbles */}
          {stage === 2 && config.effect === 'gas' && (
            <div className="absolute inset-0 overflow-hidden flex justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/60 rounded-full absolute bottom-0"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ 
                    y: -150, 
                    opacity: [0, 1, 0],
                    x: Math.sin(i * 45) * 10
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Adding Chemical Animation */}
      <motion.div 
        className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: stage === 0 ? -10 : stage === 1 ? 0 : -50,
          opacity: stage === 1 ? 1 : 0 
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-white text-xs bg-slate-800 px-2 py-1 rounded-full mb-1 border border-slate-600 font-mono">
          {config.chemical_2 ? formatChemical(config.chemical_2) : 'Reagent'}
        </div>
        <div className="w-1 h-8 bg-blue-400/50 rounded-b-full"></div>
      </motion.div>

      {/* Base Chemical Label */}
      <div className="absolute bottom-2 font-mono text-white/80 bg-black/40 px-3 py-1 rounded-full text-sm">
        {formatChemical(config.chemical_1)}
      </div>
    </div>
  );
}
