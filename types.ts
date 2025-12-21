
export interface Slide {
  id: string;
  title: string;
  content: string[];
  imageUrl?: string;
  layout: 'split' | 'centered' | 'full-image';
  category?: string;
}

export interface Presentation {
  id: string;
  topic: string;
  slides: Slide[];
  theme: 'classical' | 'modern' | 'minimalist';
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PRESENTING = 'PRESENTING',
  ERROR = 'ERROR'
}
