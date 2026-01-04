import React from 'react';
import { Clock, Play, Lock } from 'lucide-react';

/**
 * GameStatusBadge Component
 * 
 * Displays a status badge for games with appropriate styling
 * and icons for each state.
 */
const GameStatusBadge = ({ status, translations, language }) => {
  const transText = translations[language] || translations.en;

  const statusConfig = {
    pending: {
      label: transText.pending || 'Pending',
      icon: Clock,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      iconColor: 'text-yellow-100'
    },
    active: {
      label: transText.active || 'Active',
      icon: Play,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-green-100'
    },
    ended: {
      label: transText.ended || 'Ended',
      icon: Lock,
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
      iconColor: 'text-gray-100'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-semibold rounded-full`}>
      <Icon size={14} className={config.iconColor} />
      {config.label}
    </span>
  );
};

export default GameStatusBadge;