
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  id: number;
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  type: 'box' | 'ball' | 'light';
  weight: number;
  color: string;
}

export interface PolaroidData {
  id: number;
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  rotation: [number, number, number];
  url: string;
}
