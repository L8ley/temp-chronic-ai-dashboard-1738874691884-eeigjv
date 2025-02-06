import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { ChatMessage } from "@/components/chat/chat-message";
import { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, isLoading, scrollAreaRef }: MessageListProps) {
  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className="flex flex-col gap-6 py-4 px-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className="group animate-in slide-in-from-bottom-2"
          >
            <ChatMessage message={message} />
            <div className="flex items-center justify-end h-4 -mt-1">
              <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {format(message.timestamp, "h:mm a")}
                {message.status === "sending" && " · Sending..."}
                {message.status === "error" && " · Failed to send"}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center py-10 animate-in fade-in-0">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.brain className="h-4 w-4 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 