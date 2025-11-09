import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, Users, MapPin, Zap } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Rapid Site Connect</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900">
          <Shield className="h-4 w-4" />
          CDM 2015 Compliant
        </div>

        <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight text-slate-900 text-balance md:text-6xl">
          Unified Construction Site Management Platform
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-slate-600 text-pretty">
          Streamline communication, ensure compliance, and manage PPM across your entire construction site. Real-time
          coordination for contractors, subcontractors, and site teams.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/auth/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Everything you need for site management</h2>
            <p className="text-slate-600">Built for the demands of modern construction and maintenance operations</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <Users className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Team Coordination</h3>
              <p className="text-sm text-slate-600">Real-time messaging and task management for all site personnel</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <Shield className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Safety First</h3>
              <p className="text-sm text-slate-600">
                Digital permits, incident reporting, and CDM 2015 compliance tracking
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <MapPin className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Site Mapping</h3>
              <p className="text-sm text-slate-600">
                Interactive zone management with geofencing and work area tracking
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <Zap className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Offline Ready</h3>
              <p className="text-sm text-slate-600">Works without internet connection, syncs when back online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <p>&copy; 2025 Rapid Site Connect. Built for construction excellence.</p>
        </div>
      </footer>
    </div>
  )
}
