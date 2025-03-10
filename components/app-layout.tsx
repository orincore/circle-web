"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Bell, MessageCircle, User, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isClient, setIsClient] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  const navItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Search", href: "/search", icon: <Search className="h-5 w-5" /> },
    { name: "Notifications", href: "/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Messages", href: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  ]

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const MobileNav = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              Circle
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mb-6">
            <ModeToggle />
          </div>
          <nav className="flex-1">
            <ul className="space-y-2 py-4">
              {navItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="py-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`border-b sticky top-0 z-10 bg-background transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}
      >
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            {isMobile && <MobileNav />}
            <Link href="/dashboard" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
              Circle
            </Link>
          </div>
          <nav className="mx-auto hidden md:flex">
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center p-2 rounded-md ${
                      pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs mt-1">{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ModeToggle />
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 transition-transform hover:scale-110">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}

