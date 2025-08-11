"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot, User } from "lucide-react";
import { NutritionCard } from "./NutritionCard";
import { FoodAnalysis, ApiResponse } from "@/types/food";

type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};

export function AiFoodChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "system",
            content: "Welcome! You can describe a food or meal to me, and I will provide you with nutritional information."
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Send request to the backend
            const response = await fetch("/api/analyze-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: input,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get analysis");
            }

            const data = await response.json() as ApiResponse;

            if (data.success && data.data) {
                // Format the nutritional analysis result
                const foodAnalysis = data.data.foodAnalysis;
                const formattedAnalysis: FoodAnalysis = {
                    food_name: foodAnalysis.identifiedFood || input,
                    estimated_weight_grams: parseFloat(foodAnalysis.portionSize) || 100,
                    calories: parseFloat(foodAnalysis.nutritionFactsPerPortion.calories) || 0,
                    protein: parseFloat(foodAnalysis.nutritionFactsPerPortion.protein) || 0,
                    carbs: parseFloat(foodAnalysis.nutritionFactsPerPortion.carbs) || 0,
                    fats: parseFloat(foodAnalysis.nutritionFactsPerPortion.fat) || 0,
                    vitamins: foodAnalysis.additionalNotes || []
                };

                // Add AI response message
                const aiReply: Message = {
                    role: "assistant",
                    content: `I analyzed "${input}" and found the following nutritional information:\n\n` +
                        `• ${formattedAnalysis.food_name} (${formattedAnalysis.estimated_weight_grams}g)\n` +
                        `• Calories: ${formattedAnalysis.calories} kcal\n` +
                        `• Protein: ${formattedAnalysis.protein}g\n` +
                        `• Carbs: ${formattedAnalysis.carbs}g\n` +
                        `• Fats: ${formattedAnalysis.fats}g`
                };

                setMessages((prev) => [...prev, aiReply]);
                setAnalysisResult(formattedAnalysis);
            } else {
                // Add error message
                setMessages((prev) => [...prev, {
                    role: "assistant" as const,
                    content: "Sorry, I couldn't analyze this food. Could you be more specific or try with another food?"
                }]);
            }
        } catch (error) {
            console.error("Error analyzing food:", error);
            setMessages((prev) => [...prev, {
                role: "assistant" as const,
                content: "An error occurred during analysis. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: "system",
            content: "Welcome! You can describe a food or meal to me, and I will provide you with nutritional information."
        }]);
        setAnalysisResult(null);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add food manually</h2>

            <div className="flex flex-col space-y-6">
                <Card className="p-4">
                    <div className="flex items-center mb-4">
                        <Bot className="text-primary h-5 w-5 mr-2" />
                        <h3 className="text-lg font-medium">AI Assistant</h3>

                        <div className="ml-auto">
                            <Button variant="ghost" size="sm" onClick={clearChat}>
                                New conversation
                            </Button>
                        </div>
                    </div>

                    <div className="h-64 overflow-y-auto space-y-4 mb-4 p-2">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : msg.role === "system"
                                            ? "bg-muted text-muted-foreground"
                                            : "bg-secondary"
                                }`}>
                                    {msg.role === "user" && (
                                        <div className="flex items-center mb-1">
                                            <User className="h-3 w-3 mr-1" />
                                            <span className="text-xs">You</span>
                                        </div>
                                    )}
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center mb-1">
                                            <Bot className="h-3 w-3 mr-1" />
                                            <span className="text-xs">Assistant</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap text-sm">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex space-x-2">
                        <Input
                            placeholder="Describe your food or meal (e.g. 'an apple', '150g of pasta bolognese')..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1"
                        />
                        <Button onClick={handleSend} disabled={loading || !input.trim()}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </Card>

                {analysisResult && (
                    <div className="animate-in fade-in slide-in-from-top-5 duration-300">
                        <NutritionCard analysis={analysisResult} />
                    </div>
                )}
            </div>
        </div>
    );
}