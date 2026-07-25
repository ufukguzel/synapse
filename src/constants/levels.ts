import type {CefrLevel} from '@/types';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LABELS: Record<CefrLevel, {title: string; description: string}> = {
  A1: {title: 'Beginner', description: 'Can understand and use basic everyday expressions.'},
  A2: {title: 'Elementary', description: 'Can communicate in simple, routine tasks.'},
  B1: {title: 'Intermediate', description: 'Can handle most travel and work situations.'},
  B2: {title: 'Upper Intermediate', description: 'Can interact with fluency and spontaneity.'},
  C1: {title: 'Advanced', description: 'Can express ideas fluently and precisely.'},
  C2: {title: 'Proficient', description: 'Can understand virtually everything with ease.'},
};
