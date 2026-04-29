import { GodConfig, GodId } from '../lib/types';

export const GODS: GodConfig[] = [
  { id: 'wisdom', name: 'Thần Trí Tuệ', description: 'Loại bỏ 2 đáp án sai. Giúp tăng tỉ lệ đúng.', icon: 'Brain', color: 'text-indigo-500' },
  { id: 'gamble', name: 'Thần Đánh Cược', description: 'Trả lời đúng: +20 vàng. Trả lời sai: -10 vàng.', icon: 'Dices', color: 'text-amber-500' },
  { id: 'speed', name: 'Thần Tốc Độ', description: 'Trả lời càng nhanh → nhận thêm vàng.', icon: 'Zap', color: 'text-amber-400' },
  { id: 'protect', name: 'Thần Bảo Hộ', description: '1 lần trả lời sai không bị trừ vàng.', icon: 'Shield', color: 'text-emerald-500' },
  { id: 'destroy', name: 'Thần Hủy Diệt', description: 'Khi đối thủ sai → mất thêm vàng.', icon: 'Flame', color: 'text-rose-500' },
  { id: 'chaos', name: 'Thần Hỗn Mang', description: 'Kích hoạt hiệu ứng ngẫu nhiên (buff/debuff).', icon: 'Tornado', color: 'text-purple-500' },
  { id: 'freeze', name: 'Thần Đóng Băng', description: 'Làm đối thủ: Trả lời chậm hơn, timer giảm nhanh hơn.', icon: 'Snowflake', color: 'text-cyan-400' },
  { id: 'luck', name: 'Thần May Mắn', description: 'Có xác suất: Trả lời sai vẫn nhận vàng.', icon: 'Clover', color: 'text-green-500' },
  { id: 'vampire', name: 'Thần Hút Máu', description: 'Khi trả lời đúng: Hút vàng từ đối thủ.', icon: 'Droplet', color: 'text-rose-600' },
  { id: 'prophecy', name: 'Thần Tiên Tri', description: 'Gợi ý 1 đáp án sai chắc chắn.', icon: 'Eye', color: 'text-blue-400' }
];

export function getRandomGods(count: number = 2, excludeIds: GodId[] = []): GodConfig[] {
  const available = GODS.filter(g => !excludeIds.includes(g.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  // Fallback to all gods if we ran out somehow
  if (shuffled.length < count) {
    const allShuffled = [...GODS].sort(() => Math.random() - 0.5);
    return allShuffled.slice(0, count);
  }
  return shuffled.slice(0, count);
}

