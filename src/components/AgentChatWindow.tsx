import React, { useState, useRef, useEffect } from "react";
import { AgentMessage, AgentRetryRequest, Recipe, Ingredient } from "../types";
import { DynamicRecipeCard } from "./DynamicRecipeCard";
import { fetchAIRecipe, fetchAISubstitutions } from "../services/api";
import { getMacroDeltaSummary } from "../utils/nutrition";
import { useMeasurementSystem } from "../context/MeasurementContext";
import { formatMeasurementText } from "../utils/measurementFormatting";
import {
  Send,
  Sparkles,
  Utensils,
  Bot,
  User,
  ChefHat,
  Filter,
  Users,
  Repeat,
  Loader2,
  Trash2,
  AlertCircle,
  Mic,
  MicOff,
} from "lucide-react";
import "./AgentChatWindow.css";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return undefined;
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return (
    browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition
  );
};

interface AgentChatWindowProps {
  messages: AgentMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  onAddToShoppingList: (
    ingredients: Ingredient[],
    recipeTitle: string,
    recipeId: string,
  ) => void;
  onStartTimer: (
    label: string,
    seconds: number,
    recipeTitle?: string,
    stepNumber?: number,
  ) => void;
  onOpenCookingMode: (recipe: Recipe) => void;
  onOpenSubstitutions: (ingredientName: string) => void;
}

const PRESET_PROMPTS = [
  "🍝 Quick 15-minute Creamy Tuscan Pasta with Garlic & Spinach",
  "🥗 Gluten-Free High-Protein Mediterranean Grilled Chicken Bowl",
  "🥩 Tender Low-Carb Butter Garlic Pan-Seared Steak with Asparagus",
  "🍰 Easy 3-Ingredient Avocado Chocolate Mousse",
  "🥑 Vegetarian Crispy Chickpea Buddha Bowl with Tahini",
];

const DIETARY_TAGS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Low-Carb",
  "High-Protein",
  "Quick 20-Min",
];

export const AgentChatWindow: React.FC<AgentChatWindowProps> = ({
  messages,
  setMessages,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onOpenSubstitutions,
}) => {
  const { measurementSystem } = useMeasurementSystem();
  const [inputText, setInputText] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [targetServings, setTargetServings] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<
    { userPrompt: string; recipeTitle?: string }[]
  >([]);
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechErrorRef = useRef(false);
  const SpeechRecognition = getSpeechRecognitionConstructor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNewRecipe = (id: string) => {
    // Wait for DOM update
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element && chatAreaRef.current) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(
    () => () => {
      speechRecognitionRef.current?.abort();
      speechRecognitionRef.current = null;
    },
    [],
  );

  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      return;
    }

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    speechErrorRef.current = false;
    recognition.onresult = (event) => {
      const transcripts: string[] = [];
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        if (result.isFinal) transcripts.push(result[0].transcript.trim());
      }
      const transcript = transcripts.filter(Boolean).join(" ");
      if (transcript) {
        setInputText(
          (currentText) =>
            `${currentText.trimEnd()}${currentText.trim() ? " " : ""}${transcript}`,
        );
        setSpeechStatus("");
      }
    };
    recognition.onerror = (event) => {
      speechErrorRef.current = true;
      const message =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Allow microphone access in your browser to use voice input."
          : event.error === "audio-capture"
            ? "No microphone was found. Check your device settings."
            : event.error === "no-speech"
              ? "No speech was detected. Tap the microphone to try again."
              : "Voice input stopped. Check your connection and try again.";
      setSpeechStatus(message);
    };
    recognition.onend = () => {
      setIsListening(false);
      speechRecognitionRef.current = null;
      if (!speechErrorRef.current) setSpeechStatus("");
    };

    speechRecognitionRef.current = recognition;
    setSpeechStatus("Listening… Tap the microphone to finish.");
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      speechRecognitionRef.current = null;
      setIsListening(false);
      setSpeechStatus(
        "Microphone unavailable. Check browser permission and try again.",
      );
    }
  };

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const runAgentRequest = async (
    request: AgentRetryRequest,
    messageId: string,
  ) => {
    const timestamp = () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    try {
      if (request.kind === "substitutions") {
        const result = await fetchAISubstitutions(request.prompt);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  text: result.isRequestError
                    ? result.error || "Unable to reach the AI service."
                    : `Good swaps for "${request.prompt}":`,
                  timestamp: timestamp(),
                  substitutionsList: result.isRequestError
                    ? undefined
                    : result.substitutions,
                  isThinking: false,
                  isRequestError: result.isRequestError,
                  retryRequest: result.isRequestError ? request : undefined,
                }
              : msg,
          ),
        );
        return;
      }

      const result = await fetchAIRecipe({
        prompt: request.prompt,
        dietary: request.dietary,
        servings: request.servings,
        measurementSystem: request.measurementSystem,
        history: request.history,
      });
      const agentText = result.isRequestError
        ? result.error || "Unable to reach the AI service."
        : result.isFallback
          ? result.error || "Try one of these recipes instead."
          : result.recipe?.agentIntro || `Here's **${result.recipe?.title}**.`;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                text: agentText,
                timestamp: timestamp(),
                recipe: result.isFallback ? undefined : result.recipe,
                recommendedRecipes: result.recommendedRecipes,
                isThinking: false,
                isRequestError: !!result.isRequestError,
                retryRequest: result.isRequestError ? request : undefined,
              }
            : msg,
        ),
      );

      if (!result.isRequestError && !result.isFallback && result.recipe) {
        setHistory((prev) => [
          ...prev,
          { userPrompt: request.prompt, recipeTitle: result.recipe!.title },
        ]);
        scrollToNewRecipe(messageId);
      }
    } catch (error) {
      console.error("Agent error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                text: "The request failed. Please try again.",
                timestamp: timestamp(),
                isThinking: false,
                isRequestError: true,
                retryRequest: request,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || inputText.trim();
    if (!promptToUse || isLoading) return;

    const isSubstitutionRequest = ["substitute", "swap", "instead of"].some(
      (keyword) => promptToUse.toLowerCase().includes(keyword),
    );
    const request: AgentRetryRequest = isSubstitutionRequest
      ? { kind: "substitutions", prompt: promptToUse }
      : {
          kind: "recipe",
          prompt: promptToUse,
          dietary: [...selectedDietary],
          servings: targetServings,
          measurementSystem,
          history: history.slice(-5),
        };
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const messageId = "msg_agent_" + Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: "msg_user_" + Date.now(),
        sender: "user",
        text: promptToUse,
        timestamp,
      },
      {
        id: messageId,
        sender: "agent",
        text: isSubstitutionRequest
          ? "Finding ingredient swaps..."
          : "Building your recipe...",
        timestamp,
        isThinking: true,
      },
    ]);
    if (!customPrompt) setInputText("");
    setIsLoading(true);
    await runAgentRequest(request, messageId);
  };

  const handleRetryMessage = async (message: AgentMessage) => {
    if (!message.retryRequest || isLoading) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === message.id
          ? {
              ...msg,
              text:
                message.retryRequest?.kind === "substitutions"
                  ? "Retrying ingredient swaps..."
                  : "Retrying your recipe...",
              isThinking: true,
              isRequestError: false,
              retryRequest: undefined,
              recipe: undefined,
              recommendedRecipes: undefined,
              substitutionsList: undefined,
            }
          : msg,
      ),
    );
    setIsLoading(true);
    await runAgentRequest(message.retryRequest, message.id);
  };

  const handleClearChat = () => {
    if (confirm("Clear conversation history?")) {
      setMessages([]);
      setHistory([]);
    }
  };

  const handleSelectFallbackRecipe = (recipe: Recipe) => {
    const loadingMessageId = "msg_agent_loading_" + Date.now();
    const loadingMsg: AgentMessage = {
      id: loadingMessageId,
      sender: "agent",
      text: `Loading **${recipe.title}**...`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };

    setMessages((prev) => [...prev, loadingMsg]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                id: "msg_agent_recipe_" + Date.now(),
                sender: "agent",
                text: `Try **${recipe.title}**.`,
                isThinking: false,
                recipe,
              }
            : msg,
        ),
      );
    }, 3000);
  };

  return (
    <div className="chat-container">
      {/* Top Agent Controls Bar */}
      <div className="chat-controls">
        <div className="chat-controls-row">
          <div className="chat-brand">
            <div className="chat-icon-box">
              <Bot />
            </div>
            <div>
              <h1 className="chat-title">
                CooksALotl AI
                <span className="chat-title-dot"></span>
              </h1>
              <p className="chat-subtitle">Tell me what you want to cook</p>
            </div>
          </div>

          <div className="chat-controls-right">
            {/* Servings count */}
            <div className="chat-servings">
              <Users className="chat-servings-icon" />
              <span className="chat-servings-label">Serves</span>
              <select
                value={targetServings}
                onChange={(e) => setTargetServings(Number(e.target.value))}
                className="chat-servings-select"
              >
                {[1, 2, 4, 6, 8, 12].map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="chat-servings-option"
                  >
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearChat}
              className="chat-clear-btn"
              title="Clear Conversation"
            >
              <Trash2 />
            </button>
          </div>
        </div>

        {/* Dietary Tag Selectors */}
        <div className="chat-tags-row chat-scrollbar">
          <div className="chat-tags-label">
            <Filter />
            <span>Filter</span>
          </div>
          {DIETARY_TAGS.map((tag) => {
            const isSelected = selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`chat-tag ${
                  isSelected ? "chat-tag--selected" : "chat-tag--unselected"
                }`}
              >
                {tag} {isSelected && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatAreaRef} className="chat-messages chat-scrollbar">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon-box">
              <ChefHat />
            </div>
            <h2 className="chat-empty-title">What are we cooking today?</h2>
            <p className="chat-empty-desc">
              Tell me what's in your fridge, what you avoid, or what you crave.
            </p>

            <div className="chat-prompts">
              <div className="chat-prompts-label">Try a prompt</div>
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="chat-prompt-btn"
                >
                  <span>{prompt}</span>
                  <Sparkles className="chat-prompt-icon" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} id={msg.id} className="chat-message">
              {msg.sender === "user" ? (
                <div className="chat-user-row">
                  <div className="chat-user-bubble">
                    <div className="chat-user-bubble-header">
                      <span className="chat-user-label">
                        <User /> You
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="chat-user-text">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="chat-agent-row">
                  <div className="chat-agent-avatar">
                    <Bot />
                  </div>

                  <div className="chat-agent-content">
                    <div className="chat-agent-bubble">
                      <div className="chat-agent-bubble-header">
                        <span className="chat-agent-label">
                          <Sparkles /> CooksALotl AI
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {msg.isThinking ? (
                        <div className="chat-thinking-row">
                          <Loader2 className="chat-thinking-spinner" />
                          <span className="chat-thinking-text">{msg.text}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="chat-agent-text">
                            {formatMeasurementText(msg.text, measurementSystem)}
                          </p>

                          {msg.isRequestError && msg.retryRequest && (
                            <div className="chat-request-error" role="alert">
                              <AlertCircle aria-hidden="true" />
                              <span>
                                Connection issue. Your message is still here.
                              </span>
                              <button
                                type="button"
                                className="chat-retry-btn"
                                onClick={() => handleRetryMessage(msg)}
                                disabled={isLoading}
                              >
                                <Repeat aria-hidden="true" />
                                <span>Redo</span>
                              </button>
                            </div>
                          )}

                          {msg.recommendedRecipes &&
                            msg.recommendedRecipes.length > 0 && (
                              <div className="chat-fallback-list">
                                <div className="chat-fallback-label">
                                  Try one of these:
                                </div>
                                <div className="chat-fallback-grid">
                                  {msg.recommendedRecipes.map((recipe) => (
                                    <button
                                      key={recipe.id}
                                      type="button"
                                      onClick={() =>
                                        handleSelectFallbackRecipe(recipe)
                                      }
                                      className="chat-fallback-card"
                                    >
                                      <div className="chat-fallback-title">
                                        {formatMeasurementText(
                                          recipe.title,
                                          measurementSystem,
                                        )}
                                      </div>
                                      <div className="chat-fallback-summary">
                                        {formatMeasurementText(
                                          recipe.summary,
                                          measurementSystem,
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Substitutions List if requested */}
                          {msg.substitutionsList && (
                            <div className="chat-subs-grid">
                              {msg.substitutionsList.map((s, idx) => (
                                <div key={idx} className="chat-sub-card">
                                  <div className="chat-sub-name">
                                    {formatMeasurementText(
                                      s.substitute,
                                      measurementSystem,
                                    )}
                                  </div>
                                  <div className="chat-sub-ratio">
                                    Ratio:{" "}
                                    {formatMeasurementText(
                                      s.ratioOrNote,
                                      measurementSystem,
                                    )}
                                  </div>
                                  <div className="chat-sub-reason">
                                    {formatMeasurementText(
                                      s.reason,
                                      measurementSystem,
                                    )}
                                  </div>
                                  {s.macroDelta && (
                                    <div className="chat-sub-macro">
                                      Net macros:{" "}
                                      {getMacroDeltaSummary(s.macroDelta)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dynamic Recipe Card standard component */}
                    {msg.recipe && (
                      <DynamicRecipeCard
                        recipe={msg.recipe}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={isFavorite(msg.recipe.id)}
                        onAddToShoppingList={onAddToShoppingList}
                        onStartTimer={onStartTimer}
                        onOpenCookingMode={onOpenCookingMode}
                        onRequestSubstitution={(ing) =>
                          onOpenSubstitutions(ing)
                        }
                        initialServings={targetServings}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="chat-input-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chat-input-form"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Try 'chicken and spinach' or 'egg substitute'"
            className="chat-input"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            disabled={isLoading || !SpeechRecognition}
            className={`chat-mic-btn${isListening ? " chat-mic-btn--active" : ""}`}
            aria-label={
              isListening
                ? "Stop voice input"
                : SpeechRecognition
                  ? "Start voice input"
                  : "Voice input unavailable"
            }
            title={
              SpeechRecognition
                ? isListening
                  ? "Stop voice input"
                  : "Start voice input"
                : "Voice input isn't supported by this browser"
            }
          >
            {isListening ? <MicOff /> : <Mic />}
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="chat-send-btn"
          >
            {isLoading ? (
              <Loader2 className="chat-send-spinner" />
            ) : (
              <>
                <Send />
                <span className="chat-send-label">Ask AI</span>
              </>
            )}
          </button>
        </form>
        {(speechStatus || !SpeechRecognition) && (
          <p className="chat-speech-status" role="status" aria-live="polite">
            {speechStatus || "Voice input isn't supported by this browser."}
          </p>
        )}
      </div>
    </div>
  );
};
