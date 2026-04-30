'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  Send, 
  Activity, 
  Sparkles, 
  Flame, 
  Apple, 
  Utensils,
  Plus,
  ArrowRight,
  Info
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function NutritionPage() {
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/nutrition' }),
    onError: (err: Error) => {
      console.error('Chat Error:', err)
      toast.error('Could not reach the AI Nutritionist. Please check your connection.')
    }
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input.trim() })
    setInput('')
  }
  
  const [sessions] = useState([
    { id: '1', title: 'High-Protein Breakfast', date: 'Yesterday' },
    { id: '2', title: 'Spinach Waste Reduction', date: '2 days ago' },
    { id: '3', title: 'Intermittent Fasting Tips', date: 'Last week' },
  ])

  const suggestedTopics = [
    'Protein optimization',
    'Low-waste dinner',
    'Macro breakdown',
    'Keto options'
  ]
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleNewChat = () => {
    setMessages([])
    toast.success('Started new chat session')
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] max-w-[1400px] mx-auto gap-8">
      {/* Sessions Sidebar - Desktop */}
      <div className="hidden xl:flex flex-col w-72 space-y-6">
        <Button 
          onClick={handleNewChat}
          className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold gap-3 shadow-xl"
        >
          <Plus className="h-5 w-5 text-primary" /> New Session
        </Button>

        <div className="flex-1 space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Recent Sessions</h3>
          <div className="space-y-1">
            {sessions.map(session => (
              <button 
                key={session.id}
                className="w-full flex flex-col items-start p-4 rounded-2xl hover:bg-white/5 transition-all group text-left"
              >
                <span className="text-[13px] font-bold text-white/80 group-hover:text-primary transition-colors">{session.title}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{session.date}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/10 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
             </div>
             <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Pro Guardian</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your smart nutritionist has analyzed 24 meals this week. You're on track!
          </p>
        </Card>
      </div>

      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        {/* Nutrition Mini-Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Calories', value: '1,450', unit: 'kcal', icon: Flame, color: 'text-amber-500' },
            { label: 'Protein', value: '65', unit: 'g', icon: Activity, color: 'text-primary' },
            { label: 'Carbs', value: '180', unit: 'g', icon: Apple, color: 'text-emerald-500' },
            { label: 'Fats', value: '42', unit: 'g', icon: Utensils, color: 'text-cyan-400' },
          ].map((stat, i) => (
            <Card key={i} className="bg-[#161821] border-white/5 shadow-sm p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-10 w-10" />
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{stat.value}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{stat.unit}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 overflow-hidden flex flex-col bg-[#0f111a] shadow-2xl border-white/5 rounded-[40px] relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[32px] bg-primary/20 flex items-center justify-center border border-primary/20 animate-pulse">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-2xl font-black text-white tracking-tight">How can I help today?</h3>
                  <p className="text-muted-foreground text-sm">
                    Ask about specific ingredients, log a meal, or get a personalized macro plan.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {suggestedTopics.map((topic, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      onClick={() => setInput(topic)}
                      className="rounded-full bg-white/5 border-white/5 hover:border-primary/30 h-10 px-5 text-xs font-bold text-muted-foreground hover:text-primary transition-all"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(messages as any[]).map((message: any, i: number) => (
              <div 
                key={i} 
                className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start animate-in slide-in-from-left-2 duration-300'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div 
                  className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-4 shadow-xl ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-lg shadow-primary/10' 
                      : 'bg-[#161821] border border-white/5 text-white rounded-bl-lg'
                  }`}
                >
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start items-end gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0 mb-1">
                  <Sparkles className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-[#161821] border border-white/5 rounded-3xl rounded-bl-lg px-6 py-4 w-24 flex gap-1.5 items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-6 md:p-8 pt-0 mt-auto">
            <form onSubmit={handleSubmit} className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
              />
              
              <div className="flex gap-3 bg-[#161821] p-3 rounded-[32px] border border-white/5 group-focus-within:border-primary/30 transition-all">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 rounded-2xl h-14 w-14 bg-white/5 hover:bg-white/10 text-primary transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-6 h-6" />
                </Button>
                
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your nutritionist..." 
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white text-base h-14 px-2"
                />
                
                <Button 
                  type="submit" 
                  size="icon" 
                  className={`rounded-2xl h-14 w-14 shrink-0 transition-all ${
                    isLoading || !input.trim() ? 'bg-white/5 text-muted-foreground' : 'bg-primary text-primary-foreground'
                  }`}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-6 h-6" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
