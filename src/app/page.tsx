'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Refrigerator, ChefHat, Trash2, ShoppingBag, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const features = [
    { name: 'Fridge Tracker', icon: Refrigerator, desc: 'Monitor your inventory and expiry dates.', href: '/fridge', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { name: 'AI Recipes', icon: ChefHat, desc: 'Generate recipes from what you have.', href: '/recipes', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Smart Shopping', icon: ShoppingBag, desc: 'Sync your needs before you shop.', href: '/shopping', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Waste Analytics', icon: Trash2, desc: 'Track and reduce your food waste.', href: '/waste', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ]

  const textVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        delay: i * 0.1,
        ease: 'easeOut'
      } as any
    })
  }

  return (
    <main ref={containerRef} className="relative w-full">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="max-w-6xl w-full text-center z-10">
          <motion.div
            custom={0}
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass mb-12 text-primary text-sm font-medium tracking-[0.2em] uppercase"
          >
            <Sparkles className="w-4 h-4" /> Welcome to the Future of Food
          </motion.div>

          <motion.h1
            custom={1}
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-[clamp(3rem,10vw,8rem)] font-heading leading-[0.85] mb-8"
          >
            Meet <span className="text-white">FridgeMind</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Your intelligent kitchen companion. Track inventory, reduce waste, and discover AI-powered recipes.
          </motion.p>
          
          <motion.div
            custom={3}
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
             <button 
               onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
               className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors tracking-widest uppercase text-xs font-bold"
             >
               Explore Modules <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* Feature Sections - One by one for high visual density */}
      <div className="px-6 py-24 md:py-48 max-w-7xl mx-auto space-y-48 md:space-y-96">
        {features.map((feature, i) => (
          <section key={i} className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
              className={`flex flex-col ${i % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
            >
              <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center ${feature.bg} ${feature.color} mb-8 glass`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-heading mb-6">{feature.name}</h2>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-10">
                {feature.desc}
              </p>
              <Link href={feature.href} className="group inline-flex items-center gap-3 text-lg font-medium text-white">
                <span className="relative overflow-hidden">
                  Launch Module
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: i % 2 === 0 ? 5 : -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.215, 0.61, 0.355, 1] }}
              className={`relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden glass shadow-2xl ${i % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
            >
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
               <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <feature.icon className={`w-32 h-32 ${feature.color} blur-2xl`} />
                  <feature.icon className={`w-32 h-32 ${feature.color} absolute`} />
               </div>
               
               {/* Visual filler for high-end look */}
               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className={`h-full ${feature.bg.replace('/10', '')}`} 
                      />
                    </div>
                    <p className="text-[10px] tracking-widest uppercase opacity-30">Module Active</p>
                  </div>
                  <p className="text-4xl font-heading opacity-10">0{i + 1}</p>
               </div>
            </motion.div>
          </section>
        ))}
      </div>

      {/* Footer Section - Cinematic Exit */}
      <section className="h-[50vh] flex flex-col items-center justify-center px-6 text-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <p className="text-sm tracking-[0.3em] uppercase opacity-40">Ready to transform your kitchen?</p>
          <h3 className="text-4xl md:text-6xl font-heading">The evolution starts here.</h3>
          <div className="flex gap-6 justify-center">
            <Link href="/fridge" className="px-8 py-4 rounded-full glass hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
