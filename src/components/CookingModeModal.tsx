import React, { useState } from "react";
import { Recipe } from "../types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Timer as TimerIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import "./CookingModeModal.css";

interface CookingModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onStartTimer: (
    label: string,
    seconds: number,
    recipeTitle?: string,
    stepNumber?: number,
  ) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onStartTimer,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!recipe) return null;

  const currentStep = recipe.steps[currentStepIdx] || recipe.steps[0];
  const totalSteps = recipe.steps.length;

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  // Text-To-Speech Step Reader
  const handleSpeakStep = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `Step ${currentStep.stepNumber}. ${currentStep.title}. ${currentStep.instruction}. ${
      currentStep.tip ? `Chef tip: ${currentStep.tip}` : ""
    }`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="cooking-mode-overlay">
      <div className="cooking-mode-modal">
        {/* Top Header */}
        <div className="cooking-mode-header">
          <div>
            <div className="cooking-mode-eyebrow">
              <Sparkles /> Hands-Free Cooking Assistant
            </div>
            <h2 className="cooking-mode-title">{recipe.title}</h2>
          </div>

          <div>
            <button
              onClick={handleSpeakStep}
              className={`cooking-mode-voice ${
                isSpeaking ? "cooking-mode-voice--active" : ""
              }`}
              title="Read Step Instructions Aloud"
            >
              {isSpeaking ? (
                <VolumeX className="cooking-mode-voice-icon" />
              ) : (
                <Volume2 className="cooking-mode-voice-icon" />
              )}
              <span>{isSpeaking ? "Stop Voice" : "Voice Read"}</span>
            </button>

            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="cooking-mode-close"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="cooking-mode-progress">
          <div className="cooking-mode-progress-label">
            <span>
              Step {currentStepIdx + 1} of {totalSteps}
            </span>
            <span>
              {Math.round(((currentStepIdx + 1) / totalSteps) * 100)}% Completed
            </span>
          </div>
          <div className="cooking-mode-progress-track">
            <div
              className="cooking-mode-progress-fill"
              style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Big Active Step Card */}
        <div className="cooking-mode-step">
          <div className="cooking-mode-step-header">
            <span className="cooking-mode-step-badge">
              Step #{currentStep.stepNumber}
            </span>

            {currentStep.timerSeconds && currentStep.timerSeconds > 0 && (
              <button
                onClick={() =>
                  onStartTimer(
                    `${recipe.title} (Step ${currentStep.stepNumber})`,
                    currentStep.timerSeconds!,
                    recipe.title,
                    currentStep.stepNumber,
                  )
                }
                className="cooking-mode-timer"
              >
                <TimerIcon className="cooking-mode-timer-icon" />
                <span>
                  ⏱️ Start {Math.round(currentStep.timerSeconds / 60)}m Timer
                </span>
              </button>
            )}
          </div>

          <h3 className="cooking-mode-step-title">{currentStep.title}</h3>

          <p className="cooking-mode-instruction">{currentStep.instruction}</p>

          {currentStep.tip && (
            <div className="cooking-mode-tip">
              <Zap className="cooking-mode-tip-icon" />
              <div>
                <strong>Chef Tip:</strong>
                {currentStep.tip}
              </div>
            </div>
          )}

          <button
            onClick={() => toggleStepComplete(currentStep.stepNumber)}
            className={`cooking-mode-complete ${
              completedSteps[currentStep.stepNumber]
                ? "cooking-mode-complete--done"
                : ""
            }`}
          >
            <CheckCircle2 className="cooking-mode-complete-icon" />
            <span>
              {completedSteps[currentStep.stepNumber]
                ? "Step Marked Complete ✓"
                : "Mark Step Complete"}
            </span>
          </button>
        </div>

        {/* Footer Step Navigation */}
        <div className="cooking-mode-footer">
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setCurrentStepIdx((idx) => Math.max(0, idx - 1));
            }}
            disabled={currentStepIdx === 0}
            className="cooking-mode-nav"
          >
            <ChevronLeft />
            <span>Previous Step</span>
          </button>

          <span className="cooking-mode-counter">
            {currentStepIdx + 1} / {totalSteps}
          </span>

          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setCurrentStepIdx((idx) => Math.min(totalSteps - 1, idx + 1));
            }}
            disabled={currentStepIdx === totalSteps - 1}
            className="cooking-mode-nav cooking-mode-nav--next"
          >
            <span>Next Step</span>
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};
