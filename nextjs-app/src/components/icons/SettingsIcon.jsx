/**
 * SettingsIcon Component
 *
 * Settings/Cog icon using SkeuomorphicCircleButton base component
 * Follows the same pattern as InfoIcon
 */

'use client';

import { Settings } from 'lucide-react';
import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function SettingsIcon({ className = '' }) {
  return (
    <SkeuomorphicCircleButton
      diameter={64}
      gradientId="settings-gradient"
      className={className}
    >
      {/* Cog/Settings icon using lucide-react - centered in 64x64 viewbox */}
      <foreignObject x="20" y="20" width="24" height="24">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '24px', height: '24px' }}>
          <Settings className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </foreignObject>
    </SkeuomorphicCircleButton>
  );
}
