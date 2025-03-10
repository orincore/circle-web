"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock users data
const USERS = [
  {
    id: 1,
    name: "Jane Cooper",
    username: "janecooper",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Photographer and travel enthusiast",
    interests: ["Photography", "Travel", "Nature"],
  },
  {
    id: 2,
    name: "Alex Morgan",
    username: "alexmorgan",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Food blogger and cooking enthusiast",
    interests: ["Cooking", "Food", "Recipes"],
  },
  {
    id: 3,
    name: "Sam Wilson",
    username: "samwilson",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Book lover and sci-fi enthusiast",
    interests: ["Books", "Sci-Fi", "Reading"],
  },
  {
    id: 4,
    name: "Leslie Alexander",
    username: "lesliealex",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Travel photographer and adventure seeker",
    interests: ["Photography", "Travel", "Adventure"],
  },
  {
    id: 5,
    name: "Michael Foster",
    username: "michaelfoster",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Music producer and artist",
    interests: ["Music", "Art", "Production"],
  },
  {
    id: 6,
    name: "Dries Vincent",
    username: "driesvincent",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Tech enthusiast and gamer",
    interests: ["Technology", "Gaming", "Coding"],
  },
]

// Mock interests data
const INTERESTS = [
  "Photography",
  "Travel",
  "Cooking",
  "Books",
  "Music",
  "Art",
  "Technology",
  "Gaming",
  "Fitness",
  "Fashion",
  "Movies",
  "Sports",
]

export default function SearchPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(USERS)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      const filtered = USERS.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.username.toLowerCase().includes(lowercaseQuery) ||
          user.bio.toLowerCase().includes(lowercaseQuery) ||
          user.interests.some((interest) => interest.toLowerCase().includes(lowercaseQuery)),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(USERS)
    }
  }, [searchQuery])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users, interests, or topics..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="people" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>
          <TabsContent value="people" className="mt-6">
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                            <p className="text-sm mt-1">{user.bio}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.interests.map((interest, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button size="sm">Follow</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No users found matching your search</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="interests" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map((interest, index) => (
                <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{interest}</span>
                    <Button variant="ghost" size="sm">
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

