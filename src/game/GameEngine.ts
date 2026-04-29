import { Chapter, GameMode, Question } from '../lib/types';
import { QUESTION_BANK } from '../data/questions';

export function getQuestionsForGame(chapter: Chapter, mode: GameMode): { [playerId: string]: Question[] } {
  // B1: Lọc theo chương
  let pool = chapter === 'mixed' 
    ? [...QUESTION_BANK] 
    : QUESTION_BANK.filter(q => q.chapter === chapter);
  
  // Shuffle pool
  pool.sort(() => Math.random() - 0.5);

  const numPlayers = mode === 'single' ? 1 : mode === '1v1' ? 2 : 4;
  const questionsPerPlayer = 40;
  const labPerPlayer = 5;

  const result: { [playerId: string]: Question[] } = {};

  for (let i = 0; i < numPlayers; i++) {
    const pId = `p${i + 1}`;
    
    // Select Lab questions for this player
    const labQs = pool.filter(q => q.type === 'thi_nghiem').slice(0, labPerPlayer);
    pool = pool.filter(q => !labQs.includes(q)); // Remove from pool to avoid dups across players

    // Need 35 theory questions, distributed: 14 NB, 10 TH, 11 VD (approx ~ 40-30-30 of 40)
    const nbQs = pool.filter(q => q.type === 'ly_thuyet' && q.difficulty === 'nhan_biet').slice(0, 14);
    pool = pool.filter(q => !nbQs.includes(q));

    const thQs = pool.filter(q => q.type === 'ly_thuyet' && q.difficulty === 'thong_hieu').slice(0, 10);
    pool = pool.filter(q => !thQs.includes(q));

    const vdQs = pool.filter(q => q.type === 'ly_thuyet' && q.difficulty === 'van_dung').slice(0, 11);
    pool = pool.filter(q => !vdQs.includes(q));

    // If we run out exactly, just grab any left for the remainder
    let pPool = [...labQs, ...nbQs, ...thQs, ...vdQs];
    let remainder = questionsPerPlayer - pPool.length;
    if (remainder > 0) {
      const extra = pool.slice(0, remainder);
      pool = pool.filter(q => !extra.includes(q));
      pPool.push(...extra);
    }

    // Shuffle the final 40 for this player
    pPool.sort(() => Math.random() - 0.5);
    
    // Sort slightly by diff: Round 1 easier, Round 4 harder, but still randomized within chunks
    const chunk1 = pPool.filter(q => q.difficulty === 'nhan_biet' || q.difficulty === 'thong_hieu').slice(0, 10);
    pPool = pPool.filter(q => !chunk1.includes(q));
    
    const chunk4 = pPool.filter(q => q.difficulty === 'van_dung').slice(0, 10);
    pPool = pPool.filter(q => !chunk4.includes(q));

    // If chunk4 doesn't have 10, fill from remainder
    while(chunk4.length < 10 && pPool.length > 0) {
      chunk4.push(pPool.pop()!);
    }
    while(chunk1.length < 10 && pPool.length > 0) {
      chunk1.push(pPool.pop()!);
    }
    
    const chunk23 = [...pPool]; // The remaining 20

    // Mix experiments randomly
    const finalSet = [...chunk1, ...chunk23.slice(0,10), ...chunk23.slice(10,20), ...chunk4];

    result[pId] = finalSet;
  }

  return result;
}
