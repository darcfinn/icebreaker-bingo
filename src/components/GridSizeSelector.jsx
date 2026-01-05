import React from 'react';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

/**
 * GridSizeSelector Component
 * 
 * Allows admins to select grid size and win conditions when creating a game.
 * Provides visual feedback and recommendations based on selection.
 */
const GridSizeSelector = ({
  gridSize,
  winCondition,
  language,
  translations,
  onGridSizeChange,
  onWinConditionChange
}) => {
  const transText = translations[language] || translations.en;

  const gridOptions = [
    {
      size: 3,
      squares: 9,
      icon: Smartphone,
      label: transText.grid3x3 || '3×3 (9 squares)',
      description: transText.grid3x3Desc || 'Quick games, mobile-friendly',
      recommended: 'mobile',
      selectedClasses: 'border-green-500 bg-green-50',
      iconColorSelected: 'text-green-600',
      titleColorSelected: 'text-green-900',
      previewColorSelected: 'bg-green-400'
    },
    {
      size: 4,
      squares: 16,
      icon: Tablet,
      label: transText.grid4x4 || '4×4 (16 squares)',
      description: transText.grid4x4Desc || 'Balanced, works everywhere',
      recommended: 'all',
      selectedClasses: 'border-yellow-500 bg-yellow-50',
      iconColorSelected: 'text-yellow-600',
      titleColorSelected: 'text-yellow-900',
      previewColorSelected: 'bg-yellow-400'
    },
    {
      size: 5,
      squares: 25,
      icon: Monitor,
      label: transText.grid5x5 || '5×5 (25 squares)',
      description: transText.grid5x5Desc || 'Classic BINGO, best on desktop',
      recommended: 'desktop',
      selectedClasses: 'border-blue-500 bg-blue-50',
      iconColorSelected: 'text-blue-600',
      titleColorSelected: 'text-blue-900',
      previewColorSelected: 'bg-blue-400'
    }
  ];

  const getMaxLines = (size) => {
    // Max lines = rows + columns + 2 diagonals
    return size + size + 2;
  };

  const getWinConditionOptions = () => {
    const maxLines = getMaxLines(gridSize);
    const options = [];
    
    // Generate options for 1 to maxLines
    // maxLines is the same as blackout, so we stop at maxLines - 1
    // and use maxLines as the blackout option
    for (let i = 1; i < maxLines; i++) {
      let difficulty;
      if (i === 1) difficulty = transText.easy || 'Easy';
      else if (i === 2) difficulty = transText.medium || 'Medium';
      else if (i <= Math.floor(maxLines / 2)) difficulty = transText.hard || 'Hard';
      else difficulty = transText.veryHard || 'Very Hard';
      
      options.push({
        value: i,
        label: `${i} ${i === 1 ? (transText.line || 'line') : (transText.lines || 'lines')} - ${difficulty}`
      });
    }
    
    // Add full board option (replaces maxLines since they're equivalent)
    options.push({
      value: 'blackout',
      label: `${transText.fullBoard || 'Full Board'} (${gridSize * gridSize} ${transText.squares || 'squares'}) - ${transText.veryHard || 'Very Hard'}`
    });
    
    return options;
  };

  return (
    <div className="space-y-6">
      {/* Grid Size Selection */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          {transText.selectGridSize || 'Select Grid Size'}
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gridOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = gridSize === option.size;
            
            return (
              <button
                key={option.size}
                onClick={() => onGridSizeChange(option.size)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected 
                    ? option.selectedClasses
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                  }
                `}
              >
                {/* Recommended badge */}
                {option.recommended === 'all' && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded font-semibold">
                    ⭐ {transText.recommended || 'Recommended'}
                  </span>
                )}
                
                <div className="flex items-start gap-3">
                  <Icon 
                    size={32} 
                    className={isSelected ? option.iconColorSelected : 'text-gray-400'}
                  />
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isSelected ? option.titleColorSelected : 'text-gray-800'}`}>
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {/* Visual grid preview */}
                <div className="mt-3 flex justify-center">
                  <div 
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${option.size}, minmax(0, 1fr))`,
                      width: `${option.size * 16}px`,
                      height: `${option.size * 16}px`
                    }}
                  >
                    {Array.from({ length: option.squares }).map((_, i) => (
                      <div
                        key={i}
                        className={`
                          rounded-sm
                          ${isSelected ? option.previewColorSelected : 'bg-gray-300'}
                        `}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Mobile warning for 5x5 */}
        {gridSize === 5 && (
          <div className="mt-3 bg-orange-50 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
            <span className="text-orange-600">⚠️</span>
            <p className="text-sm text-orange-800">
              {transText.grid5x5Warning || 'Mobile players may find this grid difficult to use. Consider 4×4 for groups with mobile users.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Win Condition Selection */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          {transText.winCondition || 'Win Condition'}
        </label>
        
        <select
          value={winCondition.type === 'blackout' ? 'blackout' : winCondition.linesRequired}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'blackout') {
              onWinConditionChange({ type: 'blackout' });
            } else {
              onWinConditionChange({ type: 'lines', linesRequired: parseInt(value) });
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
        >
          {getWinConditionOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Win condition explanation */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>{transText.howToWin || 'How to win'}:</strong>{' '}
            {winCondition.type === 'blackout' 
              ? (transText.blackoutDesc || 'Fill all squares on the board')
              : winCondition.linesRequired === 1
              ? (transText.oneLineDesc || 'Complete any single row, column, or diagonal')
              : (transText.multipleLinesDesc || `Complete ${winCondition.linesRequired} different rows, columns, or diagonals`).replace('{count}', winCondition.linesRequired)
            }
          </p>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2">
          {transText.gamePreview || 'Game Preview'}
        </h4>
        <div className="space-y-1 text-sm text-indigo-800">
          <p>
            <strong>{transText.totalSquares || 'Total squares'}:</strong> {gridSize * gridSize}
          </p>
          <p>
            <strong>{transText.toWin || 'To win'}:</strong>{' '}
            {winCondition.type === 'blackout' 
              ? (transText.fillAllSquares || 'Fill all squares')
              : `${winCondition.linesRequired} ${winCondition.linesRequired === 1 ? (transText.line || 'line') : (transText.lines || 'lines')}`
            }
          </p>
          <p>
            <strong>{transText.estimatedTime || 'Est. time'}:</strong>{' '}
            {gridSize === 3 ? '5-10 min' : gridSize === 4 ? '15-20 min' : '25-35 min'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GridSizeSelector;