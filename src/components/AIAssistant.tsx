import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🐅 Olá! Sou o assistente do Zodiac Fortune. Como posso ajudar você hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: newMessages.map(m => ({ 
            role: m.role, 
            content: m.content 
          })) 
        }
      });

      if (error) {
        console.error('AI function error:', error);
        throw error;
      }

      const assistantMessage = data?.choices?.[0]?.message?.content;
      
      if (!assistantMessage) {
        throw new Error('Resposta inválida da IA');
      }

      setMessages([...newMessages, { 
        role: 'assistant', 
        content: assistantMessage 
      }]);

    } catch (error: any) {
      console.error('Error calling AI:', error);
      
      let errorMessage = 'Desculpe, ocorreu um erro. Tente novamente.';
      
      if (error.message?.includes('429')) {
        errorMessage = 'Muitas requisições. Aguarde alguns segundos.';
      } else if (error.message?.includes('402')) {
        errorMessage = 'Serviço temporariamente indisponível.';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });

      setMessages([...newMessages, {
        role: 'assistant',
        content: `❌ ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    '🎰 Como funciona o RTP?',
    '🏆 Quais são as conquistas?',
    '📊 Como ver minhas estatísticas?',
    '🎁 O que são recompensas diárias?'
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              size="icon"
            >
              <Bot className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="flex flex-col h-[600px] max-h-[80vh] bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Assistente AI</h3>
                    <p className="text-xs text-purple-300">Powered by Gemini 2.5</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                            : 'bg-white/10 text-white backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 text-purple-300 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-purple-300 mb-2">Perguntas rápidas:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          setTimeout(sendMessage, 100);
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-purple-500/30">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta..."
                    disabled={isLoading}
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
