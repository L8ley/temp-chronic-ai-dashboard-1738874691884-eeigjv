"use client";

import { useState, useRef, useEffect } from "react";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { flowiseService } from "@/lib/flowise";
import { ChatService } from "@/lib/chat-service";
import { Message } from "@/types/chat";
import { useUser } from "@/lib/hooks/use-user";

// Your chatflow ID from Flowise
const CHATFLOW_ID = process.env.NEXT_PUBLIC_FLOWISE_CHATFLOW_ID || '';

const chatService = new ChatService();

interface ChatPageProps {
  initialConversationId: string | null;
}

export function ChatPage({ initialConversationId }: ChatPageProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a new conversation if none exists
  useEffect(() => {
    async function createInitialConversation() {
      if (!user || currentConversationId) return;
      
      try {
        const conversation = await chatService.createConversation(user.id);
        if (conversation) {
          setCurrentConversationId(conversation.id);
        }
      } catch (error) {
        console.error('Error creating initial conversation:', error);
      }
    }

    createInitialConversation();
  }, [user, currentConversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!currentConversationId) return;
      
      try {
        const messages = await chatService.getMessages(currentConversationId);
        setMessages(messages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }

    loadMessages();
  }, [currentConversationId]);

  // Update conversation ID when prop changes
  useEffect(() => {
    setCurrentConversationId(initialConversationId);
  }, [initialConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !CHATFLOW_ID || !currentConversationId || !user) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "sending",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await chatService.saveMessage(currentConversationId, userMessage);

      // Only include messages with content when sending to Flowise
      const chatMessages = messages
        .filter(msg => msg.content && msg.content.trim() !== '')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add the current user message
      chatMessages.push({
        role: userMessage.role,
        content: userMessage.content
      });

      await flowiseService.chatStream(
        chatMessages,
        CHATFLOW_ID,
        // Handle streaming updates
        async (response) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.isStreaming) {
              lastMessage.content = response.text || "";
              if (response.usedTools) {
                lastMessage.usedTools = response.usedTools;
              }
              if (!response.isPartial) {
                lastMessage.status = "sent";
                lastMessage.isStreaming = false;
                // Save completed assistant message
                chatService.saveMessage(currentConversationId, lastMessage);
              }
            }
            return newMessages;
          });
        },
        // Handle errors
        (error) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.isStreaming) {
              lastMessage.status = "error";
              lastMessage.isStreaming = false;
            }
            return newMessages;
          });
        },
        // Handle completion
        () => setIsLoading(false)
      );

      // Update user message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg === userMessage ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error) {
      // Update user message status to error
      setMessages((prev) =>
        prev.map((msg) =>
          msg === userMessage ? { ...msg, status: "error" } : msg
        )
      );
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to use the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={setInput} />
        ) : (
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            scrollAreaRef={scrollAreaRef} 
          />
        )}
      </div>

      <div className="flex-none border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          disabled={!CHATFLOW_ID || !currentConversationId}
        />
      </div>
    </div>
  );
}
