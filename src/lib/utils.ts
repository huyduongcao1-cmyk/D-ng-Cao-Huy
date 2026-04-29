import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChemical(text: string) {
  return text.replace(/([A-Z][a-z]?[\])]?)([0-9]+)/g, (match, element, number) => {
    const subscripts: Record<string, string> = {
      '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084', 
      '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089'
    };
    const subscriptedNum = number.split('').map((n: string) => subscripts[n] || n).join('');
    return `${element}${subscriptedNum}`;
  }).replace(/([0-9]+)([+-])/g, (match, number, sign) => {
    const superscripts: Record<string, string> = {
      '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074', 
      '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
      '+': '\u207A', '-': '\u207B'
    };
    return `${number.split('').map((n: string) => superscripts[n] || n).join('')}${superscripts[sign] || sign}`;
  });
}
