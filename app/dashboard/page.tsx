"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatService } from "@/lib/chat-service";
import { ChatPage } from "@/components/chat/chat-page";
import { PageTransition } from "@/components/page-transition";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ChatConversation = Database['public']['Tables']['chat_conversations']['Row'];

const chatService = new ChatService();

const sidebarNavItems = [
  {
    title: "Chat",
    href: "/dashboard",
    icon: Icons.message,
  },
  {
    title: "Remix Assistant",
    href: "/dashboard/remix",
    icon: Icons.sparkles,
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/knowledge",
    icon: Icons.database,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: Icons.history,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Icons.settings,
  },
];

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Load conversations
  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const conversations = await chatService.getConversations(user.id);
      setConversations(conversations);
      if (conversations.length > 0 && !currentConversationId) {
        setCurrentConversationId(conversations[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat
  const handleNewChat = async () => {
    if (!user) return;
    
    try {
      const conversation = await chatService.createConversation(user.id);
      if (conversation) {
        await loadConversations();
        setCurrentConversationId(conversation.id);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chatService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (conversationId === currentConversationId) {
        const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
        if (remainingConversations.length > 0) {
          setCurrentConversationId(remainingConversations[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleStartRename = (conversation: ChatConversation) => {
    setRenamingId(conversation.id);
    setNewTitle(conversation.title || "");
    setIsRenaming(true);
  };

  const handleRename = async () => {
    if (!renamingId || !newTitle.trim()) return;

    try {
      await chatService.updateConversationTitle(renamingId, newTitle.trim());
      setConversations(prev =>
        prev.map(conv =>
          conv.id === renamingId
            ? { ...conv, title: newTitle.trim() }
            : conv
        )
      );
      setIsRenaming(false);
      setRenamingId(null);
      setNewTitle("");
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  return (
    <PageTransition>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col border-r bg-background/60 backdrop-blur transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex h-14 items-center justify-end border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Icons.chevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-6">
            <nav className="grid gap-1 px-2">
              <Popover>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "flex h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground group w-full",
                          pathname === "/dashboard" &&
                            "bg-accent text-accent-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                        onClick={loadConversations}
                      >
                        <div className="flex items-center gap-3">
                          <Icons.message className="h-4 w-4" />
                          {!isCollapsed && <span>Chat</span>}
                        </div>
                        {!isCollapsed && (
                          <Icons.chevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        )}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">Chat</TooltipContent>}
                </Tooltip>
                <PopoverContent
                  side="right"
                  align="start"
                  className="w-72 p-0"
                >
                  <div className="p-2 border-b">
                    <Button
                      onClick={handleNewChat}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                    >
                      <Icons.plus className="mr-2 h-3 w-3" />
                      New Chat
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-1">
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center p-4">
                          No conversations yet
                        </div>
                      ) : (
                        conversations.map((conversation) => (
                          <button
                            key={conversation.id}
                            onClick={() => setCurrentConversationId(conversation.id)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors hover:bg-accent group relative",
                              currentConversationId === conversation.id && "bg-accent"
                            )}
                          >
                            <Icons.message className="h-3 w-3 flex-shrink-0" />
                            <div className="flex-1 text-left truncate">
                              <div className="font-medium truncate">
                                {conversation.title || "New Chat"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(conversation.updated_at), 'MMM d')}
                              </div>
                            </div>
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="h-6 w-6 rounded-sm hover:bg-accent flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename(conversation);
                                }}
                              >
                                <Icons.pencil className="h-3 w-3" />
                              </button>
                              <button
                                className="h-6 w-6 rounded-sm hover:bg-accent flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                              >
                                <Icons.trash className="h-3 w-3" />
                              </button>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {sidebarNavItems.slice(1).map((item, index) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={index} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href &&
                            "bg-accent text-accent-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          <div className="border-t p-4">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    isCollapsed && "justify-center"
                  )}
                  onClick={signOut}
                >
                  <Icons.logOut className="h-4 w-4" />
                  {!isCollapsed && <span>Sign Out</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Sign Out</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-hidden transition-all duration-300 relative",
            isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <ChatPage key={currentConversationId} initialConversationId={currentConversationId} />
        </main>
      </div>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRenaming(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRename}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
