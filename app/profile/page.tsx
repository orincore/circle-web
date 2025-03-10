"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Grid, MessageCircle, Settings, Image, Bookmark } from "lucide-react"
import { getToken, getUserId } from "../../lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    setIsClient(true)
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchUser() {
      try {
        const res = await fetch("https://newbackend-zoat.onrender.com/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          
        })
        console.log(token);

        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          router.push("/login")
        }
      } catch (err) {
        router.push("/login")
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    if (user && user._id) {
      const token = getToken()
      async function fetchPosts() {
        try {
          const res = await fetch(`https://newbackend-zoat.onrender.com/api/post/user/${user._id}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })

          const data = await res.json()
          if (data.success) {
            setPosts(data.data)
          }
        } catch (err) {
          console.error("Error fetching posts:", err)
        } finally {
          setLoadingPosts(false)
        }
      }
      fetchPosts()
    }
  }, [user])

  if (!isClient || loadingUser) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Error loading user data.</div>
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">@{user.username}</div>
                <p className="mb-4">{user.bio || "No bio provided."}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.interests &&
                    user.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                </div>
                <div className="flex justify-center md:justify-start gap-6 text-sm">
                  <div>
                    <span className="font-bold">{user.postsCount}</span> posts
                  </div>
                  <div>
                    <span className="font-bold">{user.followerCount}</span> followers
                  </div>
                  <div>
                    <span className="font-bold">{user.followingCount}</span> following
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">
              <Grid className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="tagged">
              <Image className="h-4 w-4 mr-2" />
              Tagged
            </TabsTrigger>
            <TabsTrigger value="chats">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {loadingPosts ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">Loading posts...</div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post: any) => (
                  <div key={post.id || post._id} className="aspect-square relative group cursor-pointer">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={`Post ${post.id || post._id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <div className="flex gap-4">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 mr-1"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                          </svg>
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 mr-1"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">No posts yet</div>
            )}
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">No saved posts yet</div>
          </TabsContent>
          <TabsContent value="tagged" className="mt-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">No tagged posts yet</div>
          </TabsContent>
          <TabsContent value="chats" className="mt-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">No active chats yet</div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
