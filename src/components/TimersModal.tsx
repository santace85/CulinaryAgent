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
          if (timer.isRunning && timer.remainingSeconds > 0) {
            hasChanged = true;
            const nextSec = timer.remainingSeconds - 1;
            if (nextSec === 0) {
              playTimerCompletionChime();
            }
            return {
              ...timer,
              remainingSeconds: nextSec,
              isRunning: nextSec > 0,
            };
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
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t)),
    );
  };

  const handleReset = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false }
          : t,
      ),
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
          : t,
      ),
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
                Precision Kitchen Timers
                <span className="timer-modal-count-badge">
                  {timers.length} Active
                </span>
              </h2>
              <p className="timer-modal-subtitle">
                Simultaneous cooking timers with audio alerts
              </p>
            </div>
          </div>

          <button onClick={onClose} className="timer-modal-close-btn">
            <X />
          </button>
        </div>

        {/* Quick Add Preset Buttons */}
        <div className="timer-modal-quick-add">
          <label className="timer-modal-quick-add-label">
            <Sparkles /> Quick Add Timer
          </label>
          <div className="timer-modal-preset-row">
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
            <Plus />
            <span>Add Timer</span>
          </button>
        </form>

        {/* Active Timers List */}
        <div className="timer-modal-list">
          {timers.length === 0 ? (
            <div className="timer-modal-empty">
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
              const isFinished = timer.remainingSeconds === 0;

              const cardStateClass = isFinished
                ? "timer-card--finished"
                : timer.isRunning
                  ? "timer-card--running"
                  : "timer-card--idle";

              const countdownStateClass = isFinished
                ? "timer-card-countdown--finished"
                : timer.isRunning
                  ? "timer-card-countdown--running"
                  : "timer-card-countdown--idle";

              return (
                <div key={timer.id} className={`timer-card ${cardStateClass}`}>
                  <div className="timer-card-top-row">
                    <div className="timer-card-info">
                      <div className="timer-card-label-row">
                        {isFinished && (
                          <BellRing className="timer-card-bell-icon" />
                        )}
                        <span className="timer-card-label">{timer.label}</span>
                      </div>
                      {timer.recipeTitle && (
                        <div className="timer-card-recipe">
                          Recipe: {timer.recipeTitle}{" "}
                          {timer.stepNumber ? `(Step ${timer.stepNumber})` : ""}
                        </div>
                      )}
                    </div>

                    {/* Countdown Display */}
                    <div className="timer-card-countdown-row">
                      <span
                        className={`timer-card-countdown ${countdownStateClass}`}
                      >
                        {formatTime(timer.remainingSeconds)}
                      </span>

                      {/* Timer Controls */}
                      <div className="timer-card-controls">
                        <button
                          onClick={() => handleTogglePlay(timer.id)}
                          className="timer-card-control-btn"
                          title={timer.isRunning ? "Pause" : "Start"}
                        >
                          {timer.isRunning ? <Pause /> : <Play />}
                        </button>

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
                      className={`timer-card-progress-fill ${
                        isFinished
                          ? "timer-card-progress-fill--finished"
                          : "timer-card-progress-fill--active"
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
