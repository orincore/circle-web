"use client"

import { useMode } from "@/components/mode-provider"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Heart, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useMode()

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="mode-switch"
          checked={mode === "dating"}
          onCheckedChange={(checked) => setMode(checked ? "dating" : "friendship")}
          className={cn(
            "transition-colors duration-300",
            mode === "dating" ? "bg-[#ff3b82] hover:bg-[#ff3b82]/90" : "",
          )}
        />
        <Label htmlFor="mode-switch" className="flex items-center space-x-1 cursor-pointer">
          {mode === "dating" ? (
            <>
              <Heart className="h-4 w-4 text-[#ff3b82]" />
              <span className="text-sm">Dating</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">Friendship</span>
            </>
          )}
        </Label>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

