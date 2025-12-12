/**
 * Chat Message Component
 * Displays individual chat messages with properties and knowledge
 */
import { useState, useEffect } from 'react';
import { Bot, User, BookOpen, Home, Shuffle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyChatCard } from './PropertyChatCard';
import type { Message } from '@/hooks/use-chat';

interface ChatMessageProps {
    message: Message;
    onClose?: () => void;
}

export function ChatMessage({ message, onClose }: ChatMessageProps) {
    const isUser = message.type === 'user';
    const [displayedText, setDisplayedText] = useState(isUser ? message.text : '');
    const [isTyping, setIsTyping] = useState(!isUser);

    // Typing effect for AI messages
    useEffect(() => {
        if (isUser) return;

        let currentIndex = 0;
        const text = message.text;
        const speed = 15; // ms per char

        const intervalId = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [message.text, isUser]);

    // Parse bold text (**text**)
    const renderText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 fade-in duration-300 w-full`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-primary' : 'bg-gradient-to-br from-primary to-accent'
                }`}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Content Container */}
            <div className={`flex-1 space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                {/* Query Type Badge (AI only) */}
                {!isUser && message.query_type && (
                    <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm flex items-center gap-2">
                        {message.query_type === 'property_search' && (
                            <>
                                <Home className="w-4 h-4" />
                                <span>Property Search</span>
                            </>
                        )}

                        {message.query_type === 'knowledge' && (
                            <>
                                <BookOpen className="w-4 h-4" />
                                <span>Knowledge</span>
                            </>
                        )}

                        {message.query_type === 'mixed' && (
                            <>
                                <Shuffle className="w-4 h-4" />
                                <span>Mixed Query</span>
                            </>
                        )}
                    </Badge>
                )}

                {/* Text Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 max-w-[90%] shadow-sm break-words ${isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/80 dark:bg-muted/80 backdrop-blur-md border border-border/50'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                        {renderText(displayedText)}
                        {isTyping && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary/50 animate-pulse"></span>}
                    </p>
                </div>

                {/* Knowledge Snippets - No nested scroll, just stack them */}
                {!isUser && message.knowledge_snippets && message.knowledge_snippets.length > 0 && (
                    <div className="w-full max-w-[90%] mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <BookOpen className="w-4 h-4" />
                            <span>Related Information</span>
                        </div>
                        <div className="space-y-2">
                            {message.knowledge_snippets.map((snippet, idx) => (
                                <Card key={idx} className="bg-accent/10 hover:bg-accent/20 transition-colors border-none">
                                    <CardContent className="p-3">
                                        <h4 className="font-semibold text-sm mb-1">{snippet.title}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {snippet.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Property Cards - Single column stack, no nested scroll */}
                {!isUser && message.properties && message.properties.length > 0 && (
                    <div className="w-full max-w-[90%] mt-2">
                        <div className="flex flex-col gap-3">
                            {message.properties.map((property) => (
                                <PropertyChatCard key={property.property_id} property={property} onClose={onClose} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
