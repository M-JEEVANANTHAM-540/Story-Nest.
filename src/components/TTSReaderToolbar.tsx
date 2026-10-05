import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Gauge,
  Sparkles,
  Highlighter,
  Sliders,
  AudioLines
} from 'lucide-react';

interface TTSReaderToolbarProps {
  isSpeaking: boolean;
  isPaused: boolean;
  speakingLineIndex: number | null;
  speakingCustomText: string | null;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  highlightedText: string;
  totalLines: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  setSelectedVoiceName: (name: string) => void;
  onPlayFullChunk: () => void;
  onPlaySelectedText: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const SPEED_OPTIONS = [
  { label: '0.5x Slow', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x Normal', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x Fast', value: 1.5 },
];

export const TTSReaderToolbar: React.FC<TTSReaderToolbarProps> = ({
  isSpeaking,
  isPaused,
  speakingLineIndex,
  speakingCustomText,
  playbackSpeed,
  setPlaybackSpeed,
  highlightedText,
  totalLines,
  voices,
  selectedVoiceName,
  setSelectedVoiceName,
  onPlayFullChunk,
  onPlaySelectedText,
  onPause,
  onResume,
  onStop,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 text-slate-800 shadow-xs transition-all duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
            isSpeaking && !isPaused
              ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <Volume2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                Text-To-Speech Read Aloud
              </span>
              {isSpeaking && !isPaused && (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                  <AudioLines className="w-3.5 h-3.5 animate-bounce text-emerald-700" />
                  Speaking...
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {speakingLineIndex !== null ? (
                <span>Reading Line {speakingLineIndex + 1} of {totalLines}</span>
              ) : speakingCustomText ? (
                <span>Reading Highlighted Text</span>
              ) : (
                <span>Highlight any text or click 🔊 next to any sentence to read aloud</span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Primary Playback Controls */}
        <div className="flex items-center gap-2">
          {!isSpeaking ? (
            <button
              onClick={onPlayFullChunk}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Read Full Story Part
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause
            </button>
          )}

          {isSpeaking && (
            <button
              onClick={onStop}
              className="bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              showSettings
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Adjust Speed & Voice Settings"
          >
            <Gauge className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline font-mono">{playbackSpeed}x Speed</span>
          </button>
        </div>
      </div>

      {/* Highlighted Text Read Banner if user selects text with mouse/touch */}
      {highlightedText && (
        <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200 animate-fade-in">
          <div className="flex items-center gap-2 text-xs truncate">
            <Highlighter className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-slate-700 font-medium truncate">
              Selected: <strong className="text-amber-900 font-serif">"{highlightedText}"</strong>
            </span>
          </div>

          <button
            onClick={onPlaySelectedText}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" /> Read Highlight
          </button>
        </div>
      )}

      {/* Expandable Settings: Speed Selector & Voice Selector */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fade-in">
          {/* Speed Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-700" /> Playback Speed
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPlaybackSpeed(opt.value)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    playbackSpeed === opt.value
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-sky-700" /> Narrator Voice
            </label>
            <select
              value={selectedVoiceName}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="">Default System Voice</option>
              {voices
                .filter(v => v.lang.startsWith('en'))
                .map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
