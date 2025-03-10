"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, Share2, Bookmark, Image, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useMode } from "@/components/mode-provider"

// Mock data for posts
const MOCK_POSTS = [
  {
    id: 1,
    user: {
      name: "Jane Cooper",
      username: "janecooper",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just finished a 5-mile hike in the mountains! The views were absolutely breathtaking. #hiking #nature #outdoors",
    image: "/placeholder.svg?height=400&width=600",
    likes: 124,
    comments: 23,
    timestamp: "2h ago",
  },
  {
    id: 2,
    user: {
      name: "Alex Morgan",
      username: "alexmorgan",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Made this delicious pasta dish tonight. Recipe in the comments! #cooking #foodie #homemade",
    image: "/placeholder.svg?height=400&width=600",
    likes: 89,
    comments: 15,
    timestamp: "4h ago",
  },
  {
    id: 3,
    user: {
      name: "Sam Wilson",
      username: "samwilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Just finished reading this amazing book. Highly recommend if you're into sci-fi! #books #reading #scifi",
    image: "/placeholder.svg?height=400&width=600",
    likes: 56,
    comments: 8,
    timestamp: "6h ago",
  },
]

// Mock data for suggested users
const SUGGESTED_USERS = [
  {
    id: 1,
    name: "Leslie Alexander",
    username: "lesliealex",
    avatar: "/placeholder.svg?height=40&width=40",
    interests: ["photography", "travel"],
  },
  {
    id: 2,
    name: "Michael Foster",
    username: "michaelfoster",
    avatar: "/placeholder.svg?height=40&width=40",
    interests: ["music", "art"],
  },
  {
    id: 3,
    name: "Dries Vincent",
    username: "driesvincent",
    avatar: "/placeholder.svg?height=40&width=40",
    interests: ["technology", "gaming"],
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { mode } = useMode()
  const [isClient, setIsClient] = useState(false)
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [savedPosts, setSavedPosts] = useState<number[]>([])

  useEffect(() => {
    setIsClient(true)
    // Check if jwtToken exists instead of "isLoggedIn"
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleNewPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    const newPostObj = {
      id: Date.now(),
      user: {
        name: "You",
        username: "you",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newPost,
      image: "",
      likes: 0,
      comments: 0,
      timestamp: "Just now",
    }

    setPosts([newPostObj, ...posts])
    setNewPost("")
  }

  const handleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId))
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)))
    } else {
      setLikedPosts([...likedPosts, postId])
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    }
  }

  const handleSave = (postId: number) => {
    if (savedPosts.includes(postId)) {
      setSavedPosts(savedPosts.filter((id) => id !== postId))
    } else {
      setSavedPosts([...savedPosts, postId])
    }
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <form onSubmit={handleNewPost} className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="flex-1 resize-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Image className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newPost.trim()}
                    className="transition-transform hover:scale-105"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.user.name}</div>
                      <div className="text-sm text-muted-foreground">@{post.user.username}</div>
                    </div>
                  </div>
                  <div className="px-4 pb-2">
                    <p>{post.content}</p>
                  </div>
                  {post.image && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 ${likedPosts.includes(post.id) ? "text-red-500" : ""}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`h-5 w-5 ${likedPosts.includes(post.id) ? "fill-current" : ""}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(post.id)}
                        className={savedPosts.includes(post.id) ? "text-primary" : ""}
                      >
                        <Bookmark className={`h-5 w-5 ${savedPosts.includes(post.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">Suggested for you</h3>
              <div className="space-y-4">
                {SUGGESTED_USERS.map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.interests.join(", ")}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      Follow
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {["photography", "travel", "cooking", "technology", "books"].map((topic) => (
                  <motion.div
                    key={topic}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="text-sm font-medium hover:text-primary cursor-pointer">#{topic}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                {mode === "dating" ? "Dating Mode Active" : "Friendship Mode Active"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {mode === "dating"
                  ? "You're currently in dating mode. Your profile will be shown to people looking for dates."
                  : "You're currently in friendship mode. Your profile will be shown to people looking for friends."}
              </p>
              <p className="text-xs">You can change your mode in the top menu.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
