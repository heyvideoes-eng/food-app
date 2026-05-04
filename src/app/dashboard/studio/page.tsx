'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Wand2, 
  ChefHat, 
  Timer, 
  Flame, 
  Bookmark,
  Share2,
  ArrowRight,
  Clock,
  Zap,
  Info
} from 'lucide-react'
import { DashboardShell } from '@/components/DashboardShell'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

const supabase = createClient()

export default function StudioPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [input, setInput] = useState('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [summary, setSummary] = useState('')

  const { data: inventory } = useQuery({
    queryKey: ['fridge_items'],
    queryFn: async () => {
      const { data } = await supabase.from('fridge_items').select('*')
      return data || []
    }
  })

  const handleGenerate = async () => {
    if (!input.trim() && (!inventory || inventory.length === 0)) {
      toast.error('Add items to inventory or specify creative intent.')
      return
    }

    setIsGenerating(true)
    const loader = toast.loading('Neural models synthesizing ingredients...', {
      style: { background: '#050508', border: '1px solid rgba(193, 255, 114, 0.2)', color: '#fff' }
    })

    try {
      const response = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input,
          selectedItems: inventory 
        })
      })

      if (!response.ok) throw new Error('Synthesis failed')
      const data = await response.json()

      setRecipes(data.recipes || [])
      setSummary(data.summary || '')
      toast.success('Archetypes generated successfully.', { id: loader })
    } catch (err) {
      console.error('Synthesis Error:', err)
      toast.error('Synthesis failed. Check node status.', { id: loader })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary text-[10px] tracking-[0.4em] uppercase font-bold opacity-60">
              <Sparkles className="h-3 w-3" /> Neural Synthesis
            </div>
            <h1 className="text-6xl font-heading font-black tracking-tight text-white">Recipe <span className="text-primary italic">Studio.</span></h1>
            <p className="text-white/40 font-light text-lg">AI-powered culinary architecture powered by NVIDIA NIM.</p>
          </div>
        </div>

        {/* Studio Input Section */}
        <div className="glass-card !p-12">
          <div className="max-w-3xl space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Creative Intent</h3>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., 'Something spicy and high-protein', 'A light dinner using the spinach'..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-xl font-light text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/5"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-20 px-12 rounded-3xl bg-white text-black font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50"
            >
              {isGenerating ? (
                <>Synthesizing... <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /></>
              ) : (
                <>Launch Synthesis <Wand2 className="h-5 w-5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl bg-primary/5 border border-primary/20 text-sm text-primary/80 font-light leading-relaxed flex gap-4"
            >
              <Info className="h-5 w-5 shrink-0" />
              {summary}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <div className="space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Generated Archetypes</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence>
                {recipes.length === 0 ? (
                  <div className="col-span-2 py-20 text-center opacity-10">
                    <ChefHat className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No syntheses performed</p>
                  </div>
                ) : (
                  recipes.map((recipe, i) => (
                    <motion.div 
                      key={recipe.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card group"
                    >
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex gap-2">
                           <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">Match: {recipe.matchScore}%</div>
                           <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">{recipe.difficulty}</div>
                        </div>
                        <div className="flex gap-2">
                           <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20 hover:text-white transition-all"><Bookmark className="h-4 w-4" /></button>
                           <button className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20 hover:text-white transition-all"><Share2 className="h-4 w-4" /></button>
                        </div>
                      </div>

                      <h3 className="text-3xl font-heading font-black text-white mb-4">{recipe.title}</h3>
                      <p className="text-white/40 font-light leading-relaxed mb-10">{recipe.description}</p>

                      <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/40">
                          <Timer className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                          <Zap className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{recipe.wasteReductionScore}% Save</span>
                        </div>
                        <button className="ml-auto flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                          View Method <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </DashboardShell>
  )
}
