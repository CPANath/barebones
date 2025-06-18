import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, Target, DollarSign, Calendar, Zap, Trophy, AlertCircle, Info } from 'lucide-react';

export default function CharacterCounter({ 
  maxLength = 280, 
  placeholder = "Start typing...",
  showWordCount = true,
  showReadingTime = true,
  allowOverflow = false,
  className = "",
  onTextChange,
  initialValue = "",
  theme = "modern" // modern, minimal, glass
}) {
  const [text, setText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  
  const characterCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const remainingChars = maxLength - characterCount;
  const isNearLimit = remainingChars <= 20 && remainingChars > 0;
  const isOverLimit = remainingChars < 0;
  
  // Reading time calculation (average 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleChange = useCallback((e) => {
    const newText = e.target.value;
    
    if (!allowOverflow && newText.length > maxLength) {
      return; // Don't update if over limit and overflow not allowed
    }
    
    setText(newText);
    onTextChange?.(newText);
  }, [maxLength, allowOverflow, onTextChange]);

  const handleClear = () => {
    setText('');
    onTextChange?.('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Initialize with initial value
  useEffect(() => {
    if (initialValue && !text) {
      setText(initialValue);
      onTextChange?.(initialValue);
    }
  }, [initialValue, onTextChange, text]);

  const getThemeClasses = () => {
    const themes = {
      modern: {
        container: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
        textarea: "bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600",
        stats: "bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
      },
      minimal: {
        container: "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700",
        textarea: "bg-transparent border-none focus:ring-1",
        stats: "bg-transparent border-t border-gray-200 dark:border-gray-700 pt-3"
      },
      glass: {
        container: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-xl",
        textarea: "bg-white/50 dark:bg-gray-900/50 border border-white/30 dark:border-gray-600/30 backdrop-blur-sm",
        stats: "bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3"
      }
    };
    return themes[theme] || themes.modern;
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 rounded-xl transition-all duration-300 ${themeClasses.container} ${isFocused ? 'ring-2 ring-blue-500/20 scale-[1.02]' : ''} ${className}`}>
      <div className="space-y-4">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Text Editor
          </h3>
          <div className="flex items-center space-x-2">
            {text.length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Text area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full min-h-32 p-4 text-gray-900 dark:text-gray-100 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${themeClasses.textarea}`}
            rows={6}
            spellCheck="true"
          />
          
          {/* Character count overlay */}
          {isFocused && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
              {characterCount}/{maxLength}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              isOverLimit 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isNearLimit 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gradient-to-r from-green-400 to-blue-500'
            }`}
            style={{ 
              width: `${Math.min(100, (characterCount / maxLength) * 100)}%`,
              transform: isOverLimit ? 'scaleX(1.05)' : 'scaleX(1)'
            }}
          />
        </div>

        {/* Statistics */}
        <div className={`${themeClasses.stats} transition-all duration-300`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {characterCount.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Characters</div>
            </div>
            
            {showWordCount && (
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {wordCount.toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Words</div>
              </div>
            )}
            
            {showReadingTime && wordCount > 0 && (
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {readingTime}m
                </div>
                <div className="text-gray-600 dark:text-gray-400">Read time</div>
              </div>
            )}
            
            <div className="text-center">
              <div className={`font-semibold transition-colors duration-200 ${
                isOverLimit 
                  ? 'text-red-600 dark:text-red-400' 
                  : isNearLimit 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-green-600 dark:text-green-400'
              }`}>
                {remainingChars >= 0 ? remainingChars : `+${Math.abs(remainingChars)}`}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {remainingChars >= 0 ? 'Remaining' : 'Over limit'}
              </div>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {Math.round((characterCount / maxLength) * 100)}% of limit used
            </span>
            {text.length > 0 && (
              <span>
                Last edited: {new Date().toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Warnings/Tips */}
        {isOverLimit && !allowOverflow && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 dark:text-red-300">
                Text exceeds the maximum length of {maxLength} characters
              </span>
            </div>
          </div>
        )}
        
        {isNearLimit && !isOverLimit && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Approaching character limit
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}