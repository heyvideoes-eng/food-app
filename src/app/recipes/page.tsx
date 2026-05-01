'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChefHat, 
  Wand2, 
  Bookmark, 
  Sparkles, 
  Flame, 
  ShoppingCart,
  Timer,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  ArrowRight,
  Trash2,
  Plus
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface Recipe {
  id: string
  title: string
  description: string
  matchScore: number
  wasteReductionScore: number
  cookTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  dietaryFit: string[]
  usesIngredients: { name: string; quantity: string; source: 'inventory' | 'pantry'; priority: 'high' | 'medium' | 'low' }[]
  missingIngredients: { name: string; optional: boolean }[]
  substitutions: { insteadOf: string; use: string }[]
  instructions: string[]
  whyThisWorks: string
  leftoverPrediction: string
  nextRecipeSuggestion: string
}

export default function RecipesPage() {
  const [preferences, setPreferences] = useState<string[]>([])
  const [creativeInput, setCreativeInput] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { selectedIngredientIds, clearSelectedIngredients } = useStore()
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  
  const supabase = createClient()
  const queryClient = useQueryClient()
  const isDemoMode = (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')) || !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    async function fetchSelectedItems() {
      if (selectedIngredientIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('fridge_items')
            .select('*')
            .in('id', selectedIngredientIds)
          
          if (error) throw error
          if (data && data.length > 0) {
            setSelectedItems(data)
          } else if (isDemoMode) {
            // Fallback to local storage
            const local = JSON.parse(localStorage.getItem('fridgemind_local_items') || '[]')
            const mock = [
              { id: '1', name: 'Whole Milk', category: 'Dairy', quantity: 1, unit: 'L', expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
              { id: '2', name: 'Fresh Spinach', category: 'Vegetables', quantity: 250, unit: 'g', expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
              { id: '3', name: 'Greek Yogurt', category: 'Dairy', quantity: 500, unit: 'g', expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            ]
            const all = [...mock, ...local]
            setSelectedItems(all.filter(i => selectedIngredientIds.includes(i.id)))
          }
        } catch (err) {
          if (isDemoMode) {
            const local = JSON.parse(localStorage.getItem('fridgemind_local_items') || '[]')
            const mock = [
              { id: '1', name: 'Whole Milk', category: 'Dairy', quantity: 1, unit: 'L', expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
              { id: '2', name: 'Fresh Spinach', category: 'Vegetables', quantity: 250, unit: 'g', expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
              { id: '3', name: 'Greek Yogurt', category: 'Dairy', quantity: 500, unit: 'g', expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            ]
            const all = [...mock, ...local]
            setSelectedItems(all.filter(i => selectedIngredientIds.includes(i.id)))
          }
        }
      } else {
        setSelectedItems([])
      }
    }
    fetchSelectedItems()
  }, [selectedIngredientIds, isDemoMode])

  const togglePreference = (pref: string) => {
    setPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  const generateRecipes = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRecipes([])
    setSummary('')

    const savedUser = localStorage.getItem('fridgemind_user')
    const user = savedUser ? JSON.parse(savedUser) : null

    try {
      const response = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          input: creativeInput,
          selectedIngredientIds,
          selectedItems, // Pass full item data for context
          userId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate')
      }

      const data = await response.json()
      setRecipes(data.recipes)
      setSummary(data.summary)
      toast.success(`Found ${data.recipes.length} perfect matches!`)
    } catch (error: any) {
      console.error(error)
      toast.error('Recipe Engine Error', {
        description: error.message || 'Please check your connection and API key.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please log in to save recipes.')
      return
    }

    const { error } = await supabase.from('recipes').insert({
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients_json: recipe.usesIngredients,
      steps_json: recipe.instructions,
      nutrition_json: { matchScore: recipe.matchScore, wasteReductionScore: recipe.wasteReductionScore },
      source: 'smart',
      from_items_json: selectedItems
    })

    if (error) {
      toast.error('Failed to save recipe.')
    } else {
      toast.success('Saved to your digital cookbook!')
    }
  }

  const fillMissingIngredients = async (recipe: Recipe) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please log in to update shopping list.')
      return
    }

    if (recipe.missingIngredients.length === 0) {
      toast.info('You have everything you need!')
      return
    }

    const itemsToInsert = recipe.missingIngredients.map(ing => ({
      user_id: user.id,
      name: ing.name,
      category: 'Produce', // Fallback category
      status: 'pending',
      auto_suggested: true
    }))

    const { error } = await supabase.from('shopping_list_items').insert(itemsToInsert)

    if (error) {
      toast.error('Failed to update shopping list.')
    } else {
      toast.success(`Added ${itemsToInsert.length} items to your shopping list!`, {
        icon: <ShoppingCart className="h-4 w-4 text-primary" />
      })
      queryClient.invalidateQueries({ queryKey: ['shopping_list_items'] })
    }
  }

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-24 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary text-[10px] tracking-[0.3em] uppercase font-bold"
          >
            <Sparkles className="h-4 w-4" /> Recipe Engine
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading tracking-tight text-white leading-none"
          >
            Recommendation Studio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl font-light"
          >
            Crafting meals from your fridge to minimize waste.
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button variant="outline" className="rounded-2xl glass border-white/10 hover:bg-white/10 h-14 px-8 font-bold gap-3 tracking-widest uppercase text-[10px]">
            <Bookmark className="h-4 w-4" />
            My Cookbook
          </Button>
        </motion.div>
      </div>

      {/* Selected Items Ribbon */}
      <AnimatePresence mode="wait">
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Selected Ingredients</h3>
              <Button 
                variant="ghost" 
                onClick={clearSelectedIngredients}
                className="text-[9px] uppercase tracking-widest text-primary hover:text-primary/80 h-auto p-0"
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedItems.map(item => (
                <Badge key={item.id} className="glass border-white/10 text-white/80 py-3 px-5 rounded-2xl flex gap-2 items-center">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Studio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20"
      >
        <Card className="glass border-white/10 shadow-2xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-10 md:p-16">
            <form onSubmit={generateRecipes} className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Dietary Constraints
                  </label>
                  <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-40">{preferences.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein', 'Low-Carb', 'Desi Focus', 'Keto', 'Paleo'].map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`relative z-30 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                        preferences.includes(pref) 
                          ? 'bg-white text-black border-white shadow-xl shadow-white/10' 
                          : 'glass border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-bold text-white uppercase tracking-[0.3em] px-1">Creative Spark</label>
                <div className="relative">
                  <Textarea 
                    placeholder="E.g., 'Something light and spicy', 'Dinner for 2 using the salmon', 'Quick 15-min snack'..." 
                    value={creativeInput}
                    onChange={(e) => setCreativeInput(e.target.value)}
                    className="resize-none min-h-[160px] rounded-[2rem] glass border-white/10 focus-visible:ring-primary/20 p-8 text-lg font-light placeholder:text-muted-foreground/20 transition-all focus:bg-white/[0.05]"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-20 rounded-[2.5rem] bg-white text-black hover:bg-white/90 font-bold text-sm tracking-[0.3em] uppercase gap-4 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98]">
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Analyzing Pantry...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recipe Results */}
      <div className="space-y-24">
        {summary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <div className="flex justify-center">
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-6 py-2 uppercase tracking-widest text-[9px] font-bold">
                Studio Intelligence
              </Badge>
            </div>
            <p className="text-2xl text-white/80 font-light leading-relaxed italic">
              "{summary}"
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            >
              <Card className="glass border-white/5 shadow-2xl rounded-[4rem] overflow-hidden border-t border-t-white/10">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Panel: Overview */}
                    <div className="lg:col-span-5 p-10 md:p-16 border-r border-white/5 space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
                            Match: {recipe.matchScore}%
                          </Badge>
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
                            Save: {recipe.wasteReductionScore}%
                          </Badge>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading text-white leading-tight">{recipe.title}</h2>
                        <p className="text-muted-foreground text-lg font-light leading-relaxed">{recipe.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Duration</div>
                          <div className="flex items-center gap-3 text-white font-medium">
                            <Timer className="h-5 w-5 text-primary" />
                            {recipe.cookTime}
                          </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Complexity</div>
                          <div className="flex items-center gap-3 text-white font-medium capitalize">
                            <ChefHat className="h-5 w-5 text-primary" />
                            {recipe.difficulty}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Ingredient Breakdown</h4>
                        <div className="space-y-3">
                          {recipe.usesIngredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                              <span className="text-white/70 font-light flex items-center gap-3">
                                <div className={`h-1.5 w-1.5 rounded-full ${ing.priority === 'high' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                                {ing.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{ing.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        {recipe.missingIngredients.length > 0 && (
                          <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="text-[9px] uppercase tracking-[0.2em] text-amber-400/60 font-bold flex items-center gap-2">
                              <Info className="h-3.5 w-3.5" /> Needed Items
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recipe.missingIngredients.map((ing, idx) => (
                                <Badge key={idx} variant="outline" className="border-white/5 text-white/30 text-[10px] py-1.5 px-4 rounded-xl">
                                  {ing.name} {ing.optional && '(Optional)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Instructions & Intelligence */}
                    <div className="lg:col-span-7 p-10 md:p-16 bg-white/[0.01] flex flex-col justify-between">
                      <div className="space-y-12">
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                             <ArrowRight className="h-4 w-4 text-primary" />
                             Methodology
                          </h4>
                          <div className="space-y-8">
                            {recipe.instructions.map((step, idx) => (
                              <div key={idx} className="flex gap-8 group">
                                <span className="text-5xl font-heading text-white/5 group-hover:text-primary/10 transition-colors shrink-0">{idx + 1}</span>
                                <p className="text-white/80 font-light leading-relaxed pt-2">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2.5rem] bg-black/40 border border-white/5">
                          <div className="space-y-3">
                            <h5 className="text-[9px] uppercase tracking-widest text-primary font-bold">Why This Works</h5>
                            <p className="text-xs text-white/50 leading-relaxed font-light">{recipe.whyThisWorks}</p>
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Inventory Impact</h5>
                            <p className="text-xs text-white/50 leading-relaxed font-light">{recipe.leftoverPrediction}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-16">
                        <Button 
                          onClick={() => saveRecipe(recipe)}
                          className="flex-1 h-18 rounded-3xl bg-white text-black hover:bg-white/90 font-bold gap-3 tracking-widest uppercase text-xs transition-all"
                        >
                          <Bookmark className="h-5 w-5" /> Archive Recipe
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => fillMissingIngredients(recipe)}
                          className="flex-1 h-18 rounded-3xl glass border-white/10 hover:bg-white/5 font-bold gap-3 tracking-widest uppercase text-xs transition-all"
                        >
                          <ShoppingCart className="h-5 w-5 text-white/40" /> Fill Missing
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="space-y-12">
            {[1, 2].map(n => (
              <Card key={n} className="glass border-white/5 shadow-2xl rounded-[4rem] animate-pulse overflow-hidden">
                <CardContent className="p-16 h-[600px] flex items-center justify-center">
                  <div className="space-y-8 w-full max-w-md text-center">
                    <div className="h-2 w-24 bg-white/5 rounded-full mx-auto" />
                    <div className="h-12 bg-white/5 rounded-3xl w-3/4 mx-auto" />
                    <div className="space-y-4">
                      <div className="h-3 bg-white/5 rounded-full w-full" />
                      <div className="h-3 bg-white/5 rounded-full w-5/6 mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && recipes.length === 0 && (
          <div className="py-24 text-center space-y-8 border-2 border-dashed border-white/5 rounded-[4rem]">
             <div className="flex justify-center">
                <div className="p-8 rounded-full bg-white/[0.02] border border-white/5">
                   <ChefHat className="h-16 w-16 text-white/10" />
                </div>
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-light text-white/40">Ready to start the engine?</h3>
                <p className="text-muted-foreground text-sm tracking-widest uppercase font-bold">Select ingredients from your fridge to begin</p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
