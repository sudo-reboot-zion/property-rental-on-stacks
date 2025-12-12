import { useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ChatInterface from "./ChatInterface";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const AIChatButton = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsChatOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Open AI Assistant"
            >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

                {/* Main button */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:shadow-primary/60 transition-all duration-300 group-hover:scale-110 border border-white/10">
                    <Bot className="w-8 h-8 text-white relative z-10" />

                    {isHovered && (
                        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-300 animate-pulse drop-shadow-md" />
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                    <div className="bg-popover border border-border/50 rounded-lg px-4 py-2 shadow-xl whitespace-nowrap backdrop-blur-sm">
                        <p className="text-sm font-semibold text-popover-foreground">Chat Assistant</p>
                        <p className="text-xs text-muted-foreground">We're online!</p>
                    </div>
                </div>
            </button>

            {/* Chat Dialog */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                {/* 
                   CRITICAL LAYOUT FIX:
                   1. h-[85vh]: Sets a explicit height for the modal.
                   2. max-h-[800px]: Prevents it from looking ridiculous on huge screens.
                   3. overflow-hidden: Ensures the rounded corners clip content.
                   4. flex flex-col: Allows the inner content to stretch.
                */}
                <DialogContent className="max-w-md w-full sm:w-[450px] h-[85vh] max-h-[800px] p-0 gap-0 border-none outline-none overflow-hidden flex flex-col shadow-2xl bg-background rounded-xl sm:rounded-2xl">
                    
                    {/* Accessibility requirements for Radix UI Dialog */}
                    <VisuallyHidden.Root>
                        <DialogTitle>AI Assistant Chat</DialogTitle>
                        <DialogDescription>Chat with our AI assistant to find properties.</DialogDescription>
                    </VisuallyHidden.Root>

                    {/* Chat Interface takes up 100% of the DialogContent */}
                    <div className="flex-1 w-full h-full min-h-0">
                        <ChatInterface onClose={() => setIsChatOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AIChatButton;