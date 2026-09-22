import React from 'react';

export interface NeoBrainCoreProps {
  state?: 'idle' | 'listening' | 'thinking' | 'responding';
  amplitude?: number;
  quality?: 'balanced' | 'high';
  reducedMotion?: boolean;
  onEngage?: () => void;
  onCreated?: (context: any) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

declare const NeoBrainCore: React.FC<NeoBrainCoreProps>;
export default NeoBrainCore;
