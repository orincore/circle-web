"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react"

// Mock notifications data
const NOTIFICATIONS = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Jane Cooper",
      username: "janecooper",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "liked your post",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    type: "follow",
    user: {
      name: "Alex Morgan",
      username: "alexmorgan",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "started following you",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    type: "comment",
    user: {
      name: "Sam Wilson",
      username: "samwilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: 'commented on your post: "Great photo! Where was this taken?"',
    time: "3h ago",
    read: true,
  },
  {
    id: 4,
    type: "like",
    user: {
      name: "Leslie Alexander",
      username: "lesliealex",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "liked your comment",
    time: "5h ago",
    read: true,
  },
  {
    id: 5,
    type: "follow",
    user: {
      name: "Michael Foster",
      username: "michaelfoster",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "started following you",
    time: "1d ago",
    read: true,
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="follows">Follows</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Card key={notification.id} className={`${notification.read ? "" : "bg-muted/30"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <Avatar>
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div>
                            <span className="font-semibold">{notification.user.name}</span> {notification.content}
                          </div>
                          <div className="text-sm text-muted-foreground">{notification.time}</div>
                        </div>
                        {notification.type === "follow" && <Button size="sm">Follow Back</Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No notifications yet</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="mentions" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">No mentions yet</div>
          </TabsContent>
          <TabsContent value="follows" className="mt-6">
            <div className="space-y-2">
              {notifications
                .filter((n) => n.type === "follow")
                .map((notification) => (
                  <Card key={notification.id} className={`${notification.read ? "" : "bg-muted/30"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          <UserPlus className="h-4 w-4 text-blue-500" />
                        </div>
                        <Avatar>
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div>
                            <span className="font-semibold">{notification.user.name}</span> {notification.content}
                          </div>
                          <div className="text-sm text-muted-foreground">{notification.time}</div>
                        </div>
                        <Button size="sm">Follow Back</Button>
                      </div>
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

