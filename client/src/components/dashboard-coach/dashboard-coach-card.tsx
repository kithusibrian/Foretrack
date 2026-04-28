import { useState } from "react";
import { useCoachMutation } from "@/features/analytics/analyticsAPI";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface DashboardCoachCardProps {
  preset?: string;
  from?: string;
  to?: string;
}

export const DashboardCoachCard = ({
  preset,
  from,
  to,
}: DashboardCoachCardProps) => {
  const [question, setQuestion] = useState("");
  const [coach, { isLoading, error }] = useCoachMutation();
  const [response, setResponse] = useState<string | null>(null);

  const errorMessage =
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as any).data === "object" &&
    (error as any).data !== null &&
    "message" in (error as any).data
      ? String((error as any).data.message)
      : "Unable to get coach response. Please try again.";

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const result = await coach({
        question: question.trim(),
        preset,
        from,
        to,
      }).unwrap();

      setResponse(result.data.answer);
      setQuestion("");
    } catch (err) {
      console.error("Coach error:", err);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Ask Your Financial Coach
          </h3>
        </div>

        <p className="text-sm text-gray-600">
          Ask questions like "Can I afford this?" or "Why was my spending higher
          this month?" — powered by Gemini AI.
        </p>

        {/* Question Input */}
        <div className="space-y-2">
          <Textarea
            placeholder='e.g., "Can I afford a 50,000 KES laptop?" or "Why did I spend more on dining this month?"'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="min-h-20 resize-none text-base placeholder:text-gray-400"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleAsk}
          disabled={isLoading || !question.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get Advice
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="text-red-600 mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Coach's Answer
            </p>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
            <p className="text-xs text-gray-500 pt-2">
              Powered by Gemini AI · Tailored to your spending data
            </p>
          </div>
        )}

        {/* Empty State */}
        {!response && !isLoading && (
          <div className="bg-white/50 rounded-lg p-4 text-center text-sm text-gray-500">
            Ask a question to get personalized financial advice.
          </div>
        )}
      </div>
    </Card>
  );
};
