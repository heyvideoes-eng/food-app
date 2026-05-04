'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles,
  Minus,
  Maximize2
} from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'framer-motion'

export function GlobalAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    url: '/api/ai/nutrition',
  } as any) as any

  return (
    <div className="fixed bottom-24 lg:bottom-10 right-6 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-[380px] h-[500px] flex flex-col bg-[#0f111a]/95 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden">
              <CardHeader className="p-5 border-b border-white/5 flex flex-row items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">FridgeMind Assistant</CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5" onClick={() => setIsMinimized(true)}>
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
                     </div>
                     <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        Hi! I'm your global food assistant. Ask me anything about your fridge, recipes, or nutrition.
                     </p>
                  </div>
                )}
                
                {(messages as any[]).map((m: any, i: number) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-white/5 border border-white/5 text-white rounded-bl-none'
                    }`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 w-16 flex gap-1 items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <div className="p-5 pt-0">
                <form onSubmit={handleSubmit} className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 focus-within:border-primary/30 transition-all">
                  <Input 
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[13px] h-10 px-2"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={`h-10 w-10 rounded-xl transition-all ${
                    isLoading || !(input || '').trim() ? 'bg-white/5 text-muted-foreground' : 'bg-primary text-primary-foreground'
                    }`}
                    disabled={isLoading || !(input || '').trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {isMinimized && isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsMinimized(false)}
            className="h-14 px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
          >
            <Sparkles className="h-5 w-5" />
            Active Session
          </motion.button>
        )}
        
        {!isOpen && (
          <Button 
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-[24px] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-90 transition-all group relative"
          >
            <Sparkles className="h-8 w-8 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0a0c14] animate-pulse" />
          </Button>
        )}
      </div>
    </div>
  )
}
