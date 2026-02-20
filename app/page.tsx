"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Zap,
  Brain,
  Sparkles,
  CheckCircle2,
  Award,
  BookText,
  Eye,
  EyeOff,
  Lightbulb,
  MoveHorizontal,
  Rewind,
  Grid3X3,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {

  useEffect(() => {
    console.log(`[PERF:HomePage] Component mounted/hydrated at ${performance.now().toFixed(2)}ms`);
    try {
      performance.mark("dashboard-paint");
      performance.measure("login-redirect-duration", "login-success", "dashboard-paint");
      const measurements = performance.getEntriesByName("login-redirect-duration");
      if (measurements.length > 0) {
        console.log(`[PERF:Navigation] Total Transition Time: ${measurements[0].duration.toFixed(2)}ms`);
      }
    } catch (e) {
      // Ignore if login-success mark doesn't exist (e.g., initial load without login)
    }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-16">
        {/* Enhanced Hero Section */}
        <section className="relative rounded-2xl overflow-hidden">
          {/* Background Elements - Simplified */}
          <div className="absolute inset-0 bg-blue-600"></div>
          <div className="absolute inset-0 bg-[url('/subtle-dot-pattern.png')] bg-repeat opacity-5"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute -left-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-8 sm:px-12 md:flex md:items-center md:justify-between md:gap-12 lg:py-12 xl:px-16">
            <div className="md:max-w-[55%]">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-blue-100 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-300/20">
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                <span>Scientifically proven techniques</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 text-white leading-tight">
                Boost Your{" "}
                <span className="relative">
                  <span className="relative z-10">Reading Speed</span>
                  <span className="absolute bottom-2 left-0 h-3 w-full bg-blue-400/30 rounded-lg"></span>
                </span>{" "}
                & Comprehension
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                Train your brain to read faster, retain more information, and improve your focus with our
                scientifically-backed speed reading techniques and exercises.
              </p>

              <div className="mb-8 p-4 bg-blue-700/40 backdrop-blur-md rounded-xl border border-blue-400/20 shadow-lg">
                <h3 className="text-white text-xl font-semibold mb-4 text-center">Popular Reading Drills</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link
                    href="/drills/speed-sprint"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-blue-500/60 to-blue-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-blue-500/30">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Speed Sprint</span>
                  </Link>

                  <Link
                    href="/drills/comprehension-time"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-indigo-500/60 to-indigo-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-indigo-500/30">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Comprehension</span>
                  </Link>

                  <Link
                    href="/drills/word-reveal"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-purple-500/60 to-purple-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-purple-500/30">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Word Reveal</span>
                  </Link>

                  <Link
                    href="/drills/running-words"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-cyan-500/60 to-cyan-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-cyan-500/30">
                      <Grid3X3 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Running Words</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <Link
                    href="/drills/main-idea"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-amber-500/60 to-amber-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-amber-500/30">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Main Idea</span>
                  </Link>

                  <Link
                    href="/drills/reverse-reading"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-rose-500/30 hover:bg-rose-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-rose-500/60 to-rose-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-rose-500/30">
                      <Rewind className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Reverse Reading</span>
                  </Link>

                  <Link
                    href="/drills/fixation-breaker"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-emerald-500/60 to-emerald-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-emerald-500/30">
                      <MoveHorizontal className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Fixation Breaker</span>
                  </Link>

                  <Link
                    href="/drills/blind-spot"
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-teal-500/30 hover:bg-teal-500/40 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 group"
                  >
                    <div className="bg-gradient-to-br from-teal-500/60 to-teal-500/40 p-3 rounded-full border border-white/20 shadow-lg group-hover:shadow-teal-500/30">
                      <EyeOff className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium text-center">Blind Spot</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4 text-blue-200">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <span className="text-xs font-medium">2x</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <span className="text-xs font-medium">3x</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <span className="text-xs font-medium">5x</span>
                  </div>
                </div>
                <span className="text-sm">Boost your reading speed up to 5x</span>
              </div>
            </div>

            {/* Image Placeholder with the provided image */}
            <div className="hidden md:flex relative w-full max-w-md h-[380px] mt-12 md:mt-0 items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-500/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl flex items-center justify-center p-5 overflow-hidden relative group">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>

                <div className="relative w-full h-full rounded-lg overflow-hidden ring-4 ring-white/10 ring-offset-2 ring-offset-blue-600/20 transition-all duration-300 group-hover:ring-white/20 group-hover:scale-[0.98]">
                  <Image
                    src="https://i.ibb.co/ksN7Ys9T/159c1775-02ee-4a1d-88e0-d1d8c5396b2c-edited-2.png"
                    alt="Professional portrait"
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-blue-900/20 to-transparent"></div>

                  {/* Name caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-xl">Rahul Singh</h3>
                    <p className="text-blue-100 text-sm">Chief Mentor, Rahul Sir Classes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our scientifically-backed approach helps you train your brain to process text more efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-6 text-center flex flex-col items-center hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <BookText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Adaptive Reading</h3>
              <p className="text-muted-foreground">
                Our system adapts to your current reading level and gradually increases the challenge
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 text-center flex flex-col items-center hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Targeted Drills</h3>
              <p className="text-muted-foreground">
                Specialized exercises target specific reading skills like fixation and peripheral vision
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 text-center flex flex-col items-center hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Comprehension Focus</h3>
              <p className="text-muted-foreground">
                Balance speed with understanding through our comprehension quizzes and retention techniques
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Benefits of Speed Reading</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your reading habits and unlock new potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Save Valuable Time</h3>
                <p className="text-muted-foreground">
                  Cut your reading time in half while maintaining or improving comprehension
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Improve Focus</h3>
                <p className="text-muted-foreground">
                  Train your brain to concentrate better and reduce distractions while reading
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Enhance Memory</h3>
                <p className="text-muted-foreground">
                  Better retention of information through improved reading techniques
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Reduce Eye Strain</h3>
                <p className="text-muted-foreground">
                  Learn techniques that minimize eye fatigue during extended reading sessions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands who have transformed their reading abilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">SD</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sanika</h4>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I've doubled my reading speed in just 3 weeks. Now I can get through all my course materials with time
                to spare!"
              </p>
              <div className="flex text-yellow-400 mt-4">
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">RS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Roshan</h4>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The comprehension exercises have been game-changing. I'm reading faster AND understanding more of what
                I read."
              </p>
              <div className="flex text-yellow-400 mt-4">
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">MK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Manisha</h4>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I was skeptical at first, but the results speak for themselves. My reading speed has increased by 215%
                in two months."
              </p>
              <div className="flex text-yellow-400 mt-4">
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
                <Award className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative rounded-2xl overflow-hidden py-16 px-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Reading?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who have already improved their reading speed and comprehension
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
              asChild
            >
              <Link href="/read">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading Now
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
