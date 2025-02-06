import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center max-w-sm text-center px-8 animate-in fade-in-50">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
          <Icons.brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Welcome to chronic.ai
        </h1>
        <p className="text-muted-foreground mb-8">
          Your intelligent AI companion. Ask me anything or start a conversation.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="outline"
            className="justify-start text-left h-auto p-4"
            onClick={() => onSuggestionClick("What can you help me with?")}
          >
            <Icons.sparkles className="mr-2 h-4 w-4" />
            What can you help me with?
          </Button>
          <Button
            variant="outline"
            className="justify-start text-left h-auto p-4"
            onClick={() => onSuggestionClick("Tell me about chronic.ai")}
          >
            <Icons.brain className="mr-2 h-4 w-4" />
            Tell me about chronic.ai
          </Button>
          <Button
            variant="outline"
            className="justify-start text-left h-auto p-4"
            onClick={() => onSuggestionClick("How do I get started?")}
          >
            <Icons.rocket className="mr-2 h-4 w-4" />
            How do I get started?
          </Button>
        </div>
      </div>
    </div>
  );
} 