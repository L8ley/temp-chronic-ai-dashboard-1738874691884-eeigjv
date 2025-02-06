import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  onSubmit,
  inputRef,
  disabled
}: ChatInputProps) {
  return (
    <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t">
      <form
        onSubmit={onSubmit}
        className="relative flex items-center max-w-2xl mx-auto"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message chronic.ai..."
          className="pr-16 py-6 bg-background"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim() || disabled}
          className="absolute right-2 h-10 w-10 transition-all duration-200"
        >
          {isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
} 