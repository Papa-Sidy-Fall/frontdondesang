import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  buildChatbotReply,
  getInitialChatbotReply,
  type ChatbotAction,
} from "../data/help-chatbot-knowledge";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  note?: string;
  suggestions?: string[];
  actions?: ChatbotAction[];
}

function createAssistantMessage(): ChatMessage {
  const initialReply = getInitialChatbotReply();

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: initialReply.answer,
    note: initialReply.note,
    suggestions: initialReply.suggestions,
    actions: initialReply.actions,
  };
}

export function HelpChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createAssistantMessage()]);

  const shouldHide = useMemo(
    () => location.pathname.startsWith("/dev/logs"),
    [location.pathname]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isThinking]);

  if (shouldHide) {
    return null;
  }

  const sendQuestion = (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmedQuestion,
    };

    const reply = buildChatbotReply(trimmedQuestion);
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply.answer,
      note: reply.note,
      suggestions: reply.suggestions,
      actions: reply.actions,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInputValue("");
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((previous) => [...previous, assistantMessage]);
      setIsThinking(false);
    }, 250);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendQuestion(inputValue);
  };

  const resetConversation = () => {
    setMessages([createAssistantMessage()]);
    setInputValue("");
    setIsThinking(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-emerald-500 px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">Assistant DonSang</p>
                <p className="text-sm text-white/90">
                  Guide application et questions generales sante
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                  title="Reinitialiser"
                >
                  <i className="ri-refresh-line text-lg"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                  title="Fermer"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto bg-gradient-to-b from-red-50/60 to-white px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-red-600 text-white"
                        : "border border-red-100 bg-white text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-6">{message.text}</p>
                    {message.note && (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                        {message.note}
                      </p>
                    )}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <button
                            key={`${message.id}-${action.path}`}
                            type="button"
                            onClick={() => navigate(action.path)}
                            className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {message.suggestions && message.suggestions.length > 0 && message.role === "assistant" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={`${message.id}-${suggestion}`}
                            type="button"
                            onClick={() => sendQuestion(suggestion)}
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-400 [animation-delay:120ms]"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-300 [animation-delay:240ms]"></span>
                      <span className="ml-2">Analyse de votre question...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={3}
                placeholder="Posez une question sur l'application, le don de sang, les rendez-vous, les urgences..."
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-red-400"
              ></textarea>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-gray-500">
                  Reponses guides. Pour un probleme medical urgent, contactez un professionnel de sante.
                </p>
                <button
                  type="submit"
                  disabled={isThinking || !inputValue.trim()}
                  className="shrink-0 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="group flex items-center gap-3 rounded-full bg-red-600 px-4 py-3 text-white shadow-[0_16px_40px_rgba(220,38,38,0.35)] transition-all hover:bg-red-700"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <i className={`text-2xl ${isOpen ? "ri-close-line" : "ri-customer-service-2-line"}`}></i>
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold">Besoin d'aide ?</p>
          <p className="text-xs text-white/85">Assistant DonSang</p>
        </div>
      </button>
    </div>
  );
}
