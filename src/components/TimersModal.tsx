import React, { useState, useEffect } from "react";
import { CookingTimer } from "../types";
import {
  startTimerCompletionAlert,
  stopTimerCompletionAlert,
  unlockAudio,
} from "../utils/audio";
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
import "./TimersModal.css";

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
          // Don't do anything to paused
          if (!timer.isRunning) {
            return timer;
          }

          hasChanged = true;

          const nextSec = timer.remainingSeconds - 1;

          // Timer has finished.
          if (timer.remainingSeconds > 0 && nextSec <= 0) {
            startTimerCompletionAlert();
          }

          return {
            ...timer,
            remainingSeconds: nextSec,
            isRunning: true,
          };
        });

        return hasChanged ? updated : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setTimers]);

  if (!isOpen) return null;

  const handleAddTimer = (label: string, totalSec: number) => {
    unlockAudio();
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
    unlockAudio();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        // If timer has finished, don't use Play to restart it.
        // User should use the Repeat button instead.
        if (t.remainingSeconds <= 0) {
          return t;
        }

        return {
          ...t,
          isRunning: !t.isRunning,
        };
      }),
    );
  };

  // Manually restart a completed timer
  const handleRepeat = (id: string) => {
    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              remainingSeconds: t.totalSeconds,
              isRunning: true,
            }
          : t,
      );

      if (!updated.some((timer) => timer.remainingSeconds <= 0)) {
        stopTimerCompletionAlert();
      }

      return updated;
    });
  };

  const handleReset = (id: string) => {
    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              remainingSeconds: t.totalSeconds,
              isRunning: false,
            }
          : t,
      );

      if (!updated.some((timer) => timer.remainingSeconds <= 0)) {
        stopTimerCompletionAlert();
      }

      return updated;
    });
  };

  const handleAddMinutes = (id: string, mins: number) => {
    setTimers((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              remainingSeconds: t.remainingSeconds + mins * 60,
              totalSeconds: t.totalSeconds + mins * 60,
            }
          : t,
      );

      if (!updated.some((timer) => timer.remainingSeconds <= 0)) {
        stopTimerCompletionAlert();
      }

      return updated;
    });
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => {
      const updated = prev.filter((t) => t.id !== id);

      if (!updated.some((timer) => timer.remainingSeconds <= 0)) {
        stopTimerCompletionAlert();
      }

      return updated;
    });
  };

  const formatTime = (secs: number) => {
    const elapsedSeconds = Math.abs(secs);
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;

    return `${secs < 0 ? "-" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timer-modal-overlay">
      <div className="timer-modal">
        {/* Header */}
        <div className="timer-modal-header">
          <div className="timer-modal-brand">
            <div className="timer-modal-icon-box">
              <TimerIcon />
            </div>

            <div>
              <h2 className="timer-modal-title">
                Kitchen timers
                <span className="timer-modal-count-badge">
                  {timers.length} Active
                </span>
              </h2>

              <p className="text-xs text-slate-400">Keep every step on track</p>
            </div>
          </div>

          <button onClick={onClose} className="timer-modal-close-btn">
            <X />
          </button>
        </div>

        {/* Quick Add Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Add Timer
          </label>

          <div className="flex flex-wrap gap-2">
            {[1, 3, 5, 8, 10, 15, 20, 30].map((m) => (
              <button
                key={m}
                onClick={() => handleAddTimer(`${m} Min Timer`, m * 60)}
                className="timer-modal-preset-btn"
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
              handleAddTimer(
                customLabel.trim() || `${customMinutes} Min Timer`,
                customMinutes * 60,
              );

              setCustomLabel("");
            }
          }}
          className="timer-modal-form"
        >
          <input
            type="text"
            placeholder="Timer Label (e.g. Boil Eggs, Sear Steak)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="timer-modal-form-input timer-modal-form-input--label"
          />

          <input
            type="number"
            min="1"
            max="180"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="timer-modal-form-input timer-modal-form-input--minutes"
          />

          <button type="submit" className="timer-modal-form-submit">
            <Plus className="w-4 h-4" />
            <span>Add Timer</span>
          </button>
        </form>

        {/* Active Timers List */}
        <div className="timer-modal-list">
          {timers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4">
              No active timers running. Click a step timer in any recipe or add
              one above!
            </div>
          ) : (
            timers.map((timer) => {
              const percent =
                timer.totalSeconds > 0
                  ? Math.max(
                      0,
                      Math.round(
                        (timer.remainingSeconds / timer.totalSeconds) * 100,
                      ),
                    )
                  : 0;

              const isFinished = timer.remainingSeconds <= 0;

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
                    {/* Timer Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isFinished && (
                          <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
                        )}

                        <span className="font-bold text-sm text-white">
                          {timer.label}
                        </span>

                        {isFinished && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            TIME'S UP
                          </span>
                        )}
                      </div>

                      {timer.recipeTitle && (
                        <div className="text-[11px] text-slate-400">
                          Recipe: {timer.recipeTitle}{" "}
                          {timer.stepNumber ? `(Step ${timer.stepNumber})` : ""}
                        </div>
                      )}
                    </div>

                    {/* Countdown Display */}
                    <div className="timer-card-countdown-row">
                      <span
                        className={`font-mono text-2xl font-bold tracking-wider ${
                          isFinished
                            ? "text-rose-400"
                            : timer.isRunning
                              ? "text-amber-300"
                              : "text-slate-400"
                        }`}
                      >
                        {formatTime(timer.remainingSeconds)}
                      </span>

                      {/* Timer Controls */}
                      <div className="flex items-center space-x-1">
                        {/* Repeat button appears ONLY when timer is finished */}
                        {isFinished ? (
                          <button
                            onClick={() => handleRepeat(timer.id)}
                            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5"
                            title="Repeat Timer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Repeat
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePlay(timer.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                            title={timer.isRunning ? "Pause" : "Start"}
                          >
                            {timer.isRunning ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleAddMinutes(timer.id, 1)}
                          className="timer-card-add-min-btn"
                          title="+1 Minute"
                        >
                          +1m
                        </button>

                        <button
                          onClick={() => handleReset(timer.id)}
                          className="timer-card-control-btn timer-card-reset-btn"
                          title="Reset"
                        >
                          <RotateCcw />
                        </button>

                        <button
                          onClick={() => handleDeleteTimer(timer.id)}
                          className="timer-card-control-btn timer-card-delete-btn"
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="timer-card-progress-track">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isFinished
                          ? "bg-rose-500"
                          : "bg-gradient-to-r from-orange-500 to-amber-400"
                      }`}
                      style={{
                        width: `${percent}%`,
                      }}
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
