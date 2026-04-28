import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCoachMutation } from "@/features/analytics/analyticsAPI";
import { X, MessageCircle } from "lucide-react";

type Message = { id: string; sender: "user" | "assistant"; text: string };

const SAMPLE_QUESTIONS = [
  "Can I afford a 50,000 KES laptop?",
  "Summarize my expenses for this week",
  "What were my top spending categories?",
  "What's my savings rate?",
  "Am I on budget?",
];

export const CoachChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [coach, { isLoading }] = useCoachMutation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("foretrack_coach_msgs");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  const handleClose = () => {
    setMessages([]);
    try {
      localStorage.removeItem("foretrack_coach_msgs");
    } catch (e) {
      // ignore
    }
    setOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("foretrack_coach_msgs", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (question?: string) => {
    const text = (question || input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };
    setMessages((s) => [...s, userMsg]);
    setInput("");

    try {
      const res = await coach({ question: text }).unwrap();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: res.data.answer,
      };
      setMessages((s) => [...s, assistantMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        sender: "assistant",
        text: "Sorry, I couldn't get an answer right now. Try again.",
      };
      setMessages((s) => [...s, errMsg]);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        aria-label="Open Coach"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-2 bottom-2 z-50 flex items-center gap-2 rounded-full bg-indigo-600 p-2 text-white shadow-lg hover:bg-indigo-700 sm:right-5 sm:bottom-5 sm:p-3"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Coach</span>
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed right-2 bottom-16 z-50 max-h-[calc(100vh-5rem)] w-[calc(100vw-1rem)] sm:right-5 sm:bottom-20 sm:w-80 md:w-96 sm:max-h-[70vh]">
          <Card className="flex flex-col h-full p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm font-semibold">Foretrack Coach</div>
                  <div className="text-xs text-gray-500">
                    Ask finance questions
                  </div>
                </div>
              </div>
              <div>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(60vh-120px)] overflow-auto p-2 sm:p-3 sm:max-h-[calc(70vh-120px)]">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 font-medium">
                    Try asking:
                  </div>
                  <div className="space-y-2">
                    {SAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => send(q)}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-3 text-left text-sm text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3 mt-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.sender === "user" ? "text-right" : "text-left"}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        m.sender === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="border-t bg-white p-2 sm:p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask your coach..."
                  className="min-h-[44px] max-h-24 resize-none"
                />
                <Button
                  onClick={() => send()}
                  disabled={isLoading || !input.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? "Thinking..." : "Send"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default CoachChat;
