import React, { useState, useEffect } from "react";
import { CookingTimer } from "../types";
import { playTimerCompletionChime, playTickSound } from "../utils/audio";
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  X,
  BellRing,
  Sparkles,
} from "lucide-react";

interface TimersModalProps {
  isOpen: boolean;
  onClose: () => void;
  timers: CookingTimer[];
  setTimers: React.Dispatch<React.SetStateAction<CookingTimer[]>>;
}

export const TimersModal: React.FC<TimersModalProps> = ({
  isOpen,
  onClose,
  timers,
  setTimers,
}) => {
  const [customLabel, setCustomLabel] = useState("");
  const [customMinutes, setCustomMinutes] = useState<number>(5);

  // Timer interval ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        let hasChanged = false;
        const updated = prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            hasChanged = true;
            const nextSec = timer.remainingSeconds - 1;
            if (nextSec === 0) {
              playTimerCompletionChime();
            }
            return { ...timer, remainingSeconds: nextSec, isRunning: nextSec > 0 };
          }
          return timer;
        });
        return hasChanged ? updated : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setTimers]);

  if (!isOpen) return null;

  const handleAddTimer = (label: string, totalSec: number) => {
    const newTimer: CookingTimer = {
      id: "timer_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      label: label || "Kitchen Timer",
      totalSeconds: totalSec,
      remainingSeconds: totalSec,
      isRunning: true,
    };
    setTimers((prev) => [newTimer, ...prev]);
  };

  const handleTogglePlay = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleReset = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t
      )
    );
  };

  const handleAddMinutes = (id: string, mins: number) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              remainingSeconds: t.remainingSeconds + mins * 60,
              totalSeconds: t.totalSeconds + mins * 60,
            }
          : t
      )
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <TimerIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Precision Kitchen Timers
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {timers.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Simultaneous cooking timers with audio alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Add Timer
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 5, 8, 10, 15, 20, 30].map((m) => (
              <button
                key={m}
                onClick={() => handleAddTimer(`${m} Min Timer`, m * 60)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-xs font-semibold text-amber-300 transition-all"
              >
                + {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Custom Timer Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customMinutes > 0) {
              handleAddTimer(customLabel.trim() || `${customMinutes} Min Timer`, customMinutes * 60);
              setCustomLabel("");
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800"
        >
          <input
            type="text"
            placeholder="Timer Label (e.g. Boil Eggs, Sear Steak)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            min="1"
            max="180"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="sm:col-span-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-xs rounded-xl px-3 py-2 flex items-center justify-center space-x-1 hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timer</span>
          </button>
        </form>

        {/* Active Timers List */}
        <div className="space-y-3">
          {timers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4">
              No active timers running. Click a step timer in any recipe or add one above!
            </div>
          ) : (
            timers.map((timer) => {
              const percent =
                timer.totalSeconds > 0
                  ? Math.max(0, Math.round((timer.remainingSeconds / timer.totalSeconds) * 100))
                  : 0;
              const isFinished = timer.remainingSeconds === 0;

              return (
                <div
                  key={timer.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isFinished
                      ? "bg-rose-500/10 border-rose-500/40 animate-pulse"
                      : timer.isRunning
                      ? "bg-slate-950 border-amber-500/30 shadow-md"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isFinished && <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />}
                        <span className="font-bold text-sm text-white">{timer.label}</span>
                      </div>
                      {timer.recipeTitle && (
                        <div className="text-[11px] text-slate-400">
                          Recipe: {timer.recipeTitle} {timer.stepNumber ? `(Step ${timer.stepNumber})` : ""}
                        </div>
                      )}
                    </div>

                    {/* Countdown Display */}
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-mono text-2xl font-bold tracking-wider ${
                          isFinished ? "text-rose-400" : timer.isRunning ? "text-amber-300" : "text-slate-400"
                        }`}
                      >
                        {formatTime(timer.remainingSeconds)}
                      </span>

                      {/* Timer Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTogglePlay(timer.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title={timer.isRunning ? "Pause" : "Start"}
                        >
                          {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleAddMinutes(timer.id, 1)}
                          className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          title="+1 Minute"
                        >
                          +1m
                        </button>

                        <button
                          onClick={() => handleReset(timer.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                          title="Reset"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTimer(timer.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isFinished ? "bg-rose-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
