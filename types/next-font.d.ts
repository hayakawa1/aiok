declare module 'next/font/google' {
  interface FontOptions {
    subsets?: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    weight?: string | number | Array<string | number>;
    style?: 'normal' | 'italic';
    preload?: boolean;
    variable?: string;
    fallback?: string[];
  }

  interface FontReturn {
    className: string;
    style: { fontFamily: string };
    variable: string;
  }

  export function Inter(options?: FontOptions): FontReturn;
  export function Geist(options?: FontOptions): FontReturn;
  export function Geist_Mono(options?: FontOptions): FontReturn;
} 