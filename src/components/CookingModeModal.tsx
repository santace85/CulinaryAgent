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

interface CookingModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onStartTimer: (label: string, seconds: number, recipeTitle?: string, stepNumber?: number) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onStartTimer,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 relative space-y-6 flex flex-col justify-between max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-orange-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Hands-Free Cooking Assistant
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{recipe.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSpeakStep}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSpeaking
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
              title="Read Step Instructions Aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
              <span>{isSpeaking ? "Stop Voice" : "Voice Read"}</span>
            </button>

            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>
              Step {currentStepIdx + 1} of {totalSteps}
            </span>
            <span>{Math.round(((currentStepIdx + 1) / totalSteps) * 100)}% Completed</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Big Active Step Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl my-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
              Step #{currentStep.stepNumber}
            </span>

            {currentStep.timerSeconds && currentStep.timerSeconds > 0 && (
              <button
                onClick={() =>
                  onStartTimer(
                    `${recipe.title} (Step ${currentStep.stepNumber})`,
                    currentStep.timerSeconds!,
                    recipe.title,
                    currentStep.stepNumber
                  )
                }
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-bold hover:bg-amber-500/30 transition-all"
              >
                <TimerIcon className="w-4 h-4 text-amber-400" />
                <span>⏱️ Start {Math.round(currentStep.timerSeconds / 60)}m Timer</span>
              </button>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{currentStep.title}</h3>

          <p className="text-base sm:text-xl text-slate-200 leading-relaxed font-normal">
            {currentStep.instruction}
          </p>

          {currentStep.tip && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-2xl text-sm flex items-start gap-2.5">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold mb-0.5">Chef Tip:</strong>
                {currentStep.tip}
              </div>
            </div>
          )}

          <button
            onClick={() => toggleStepComplete(currentStep.stepNumber)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${
              completedSteps[currentStep.stepNumber]
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {completedSteps[currentStep.stepNumber] ? "Step Marked Complete ✓" : "Mark Step Complete"}
            </span>
          </button>
        </div>

        {/* Footer Step Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setCurrentStepIdx((idx) => Math.max(0, idx - 1));
            }}
            disabled={currentStepIdx === 0}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-sm hover:bg-slate-700 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            {currentStepIdx + 1} / {totalSteps}
          </span>

          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setCurrentStepIdx((idx) => Math.min(totalSteps - 1, idx + 1));
            }}
            disabled={currentStepIdx === totalSteps - 1}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-sm hover:brightness-110 disabled:opacity-40 transition-all shadow-lg"
          >
            <span>Next Step</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
