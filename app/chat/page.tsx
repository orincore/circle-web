"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Modal from "react-modal"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Send,
  Phone,
  Video,
  Info,
  Plus,
  Sparkles,
  MoreHorizontal,
  Edit2,
  Trash2,
  ThumbsUp 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import io from "socket.io-client"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

// Set app element for react-modal (using body instead of #__next)
if (typeof window !== "undefined") {
  Modal.setAppElement("body")
}

const getUserIdFromToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = (4 - (base64.length % 4)) % 4
    base64 += '='.repeat(padLength)
    const decodedData = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(decodedData)
    return payload.id.toString()
  } catch (e) {
    console.error("Failed to decode token", e)
    return null
  }
}

const maskName = (name: string) => {
  if (!name) return ''
  if (name.length <= 2) return name
  return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}`
}

export default function ChatPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [chats, setChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [randomChatOpen, setRandomChatOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [acceptMatchModalOpen, setAcceptMatchModalOpen] = useState(false)
  const [matchFoundData, setMatchFoundData] = useState<{ chatId: string; partner: any } | null>(null)

  // Additional feature states
  const [editingMessage, setEditingMessage] = useState<any>(null)
  const [editMessageContent, setEditMessageContent] = useState("")
  const [dropdownForMessage, setDropdownForMessage] = useState<string | null>(null)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isArchived, setIsArchived] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [socket, setSocket] = useState<any>(null)
  const activeChatRef = useRef(activeChat)
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
  const userId = token ? getUserIdFromToken(token) : null

  const partner = activeChat?.participants.find((p: any) => p._id !== userId)

  // When active chat changes, emit "read-all"
  useEffect(() => {
    activeChatRef.current = activeChat
    if (activeChat && socket) {
      socket.emit("read-all", { chatId: activeChat._id, userId })
    }
  }, [activeChat, socket, userId])

  // Fetch chats
  const fetchChats = async () => {
    try {
      const res = await fetch("https://newbackend-zoat.onrender.com/api/chat", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const { data } = await res.json()
      setChats(data)
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0])
        fetchMessages(data[0]._id)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast.error("Failed to load chats")
    }
  }

  // Fetch messages for active chat
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`https://newbackend-zoat.onrender.com/api/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const { data } = await res.json()
      const sortedMessages = data.sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      setMessages(sortedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    }
  }

  // Debounce typing: calls typing endpoint and emits "typing" event
  const typingTimeoutRef = useRef<any>(null)
  const handleTyping = useCallback(() => {
    if (!activeChat || !socket) return
    fetch(`https://newbackend-zoat.onrender.com/api/chat/${activeChat._id}/typing`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      }
    })
    socket.emit("typing", { chatId: activeChat._id, userId })
  }, [activeChat, socket, token, userId])

  useEffect(() => {
    if (newMessage) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping()
      }, 500)
    }
  }, [newMessage, handleTyping])

  // Socket initialization
  useEffect(() => {
    setIsClient(true)
    if (!token || !userId) {
      router.push("/login")
      return
    }
    
    const initializeSocket = () => {
      const newSocket = io("https://newbackend-zoat.onrender.com", {
        auth: { token },
        transports: ["websocket"]
      })
  
      newSocket.on("connect", () => {
        setSocket(newSocket)
        newSocket.emit("authenticate", userId)
      })
  
      newSocket.on("match-found", (data: { chatId: string; partner: any }) => {
        setMatchFoundData({ chatId: data.chatId, partner: data.partner })
        setAcceptMatchModalOpen(true)
        setIsSearching(false)
      })
  
      newSocket.on("match-confirmed", async (data: { chatId: string }) => {
        setAcceptMatchModalOpen(false)
        setRandomChatOpen(false)
        await fetchChats()
        const chat = await fetch(`https://newbackend-zoat.onrender.com/api/chat/${data.chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())
        setActiveChat(chat.data)
        fetchMessages(data.chatId)
        newSocket.emit("join-chat", data.chatId)
      })
  
      newSocket.on("new-message", (message: any) => {
        // Update chat list with latest message info
        setChats(prev => prev.map(chat => {
          if (chat._id === message.chat) {
            return { ...chat, lastMessage: message, updatedAt: message.createdAt }
          }
          return chat
        }))
        // If active chat matches, update messages
        if (activeChatRef.current?._id === message.chat) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === message._id)
            if (!exists) {
              const updated = [...prev, message]
              return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            }
            return prev
          })
        }
      })
  
      newSocket.on("typing", (data: { chatId: string; userId: string }) => {
        if (activeChatRef.current && data.chatId === activeChatRef.current._id && data.userId !== userId) {
          setIsPartnerTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 3000)
        }
      })
  
      newSocket.on("read-all", (data: { chatId: string; messageIds: string[] }) => {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg._id) ? { ...msg, read: true } : msg
        ))
      })
  
      newSocket.on("match-rejected", () => {
        toast.info("Match rejected. Restarting search...")
        startMatchmaking()
      })
  
      newSocket.on("message-error", (error: string) => {
        toast.error(error)
      })
  
      return newSocket
    }
  
    const socketInstance = initializeSocket()
    fetchChats()
  
    return () => {
      socketInstance?.disconnect()
    }
  }, [token, userId, router])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    const scroll = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
    const timeout = setTimeout(scroll, 100)
    return () => clearTimeout(timeout)
  }, [messages])

  // Send message (optimistic UI)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || !socket) return
  
    const tempId = uuidv4()
    const optimisticMessage = {
      _id: tempId,
      content: newMessage,
      sender: userId,
      chat: activeChat._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: true,
      read: false,
      reactions: []
    }
  
    setMessages(prev => {
      const updated = [...prev, optimisticMessage]
      return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })
    setNewMessage("")
  
    socket.emit("send-message", {
      chatId: activeChat._id,
      senderId: userId,
      content: optimisticMessage.content,
    })
  }

  // Edit message
  const handleEditMessage = async (messageId: string) => {
    try {
      const res = await fetch(`https://newbackend-zoat.onrender.com/api/chat/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editMessageContent })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => prev.map(msg => msg._id === messageId ? data.data : msg))
        setEditingMessage(null)
        setEditMessageContent("")
      } else {
        toast.error(data.error || "Failed to edit message")
      }
    } catch (error) {
      console.error("Edit message error:", error)
      toast.error("Failed to edit message")
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`https://newbackend-zoat.onrender.com/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId))
      } else {
        toast.error(data.error || "Failed to delete message")
      }
    } catch (error) {
      console.error("Delete message error:", error)
      toast.error("Failed to delete message")
    }
  }

  // Add reaction
  const handleAddReaction = async (messageId: string) => {
    try {
      const res = await fetch(`https://newbackend-zoat.onrender.com/api/chat/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reaction: "👍" })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, reactions: data.data.reactions } : msg))
      } else {
        toast.error(data.error || "Failed to add reaction")
      }
    } catch (error) {
      console.error("Add reaction error:", error)
      toast.error("Failed to add reaction")
    }
  }

  // Block/Unblock
  const handleBlockToggle = async () => {
    if (!partner) return
    try {
      const endpoint = isBlocked
        ? `https://newbackend-zoat.onrender.com/api/chat/unblock/${partner._id}`
        : `https://newbackend-zoat.onrender.com/api/chat/block/${partner._id}`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setIsBlocked(!isBlocked)
        toast.success(isBlocked ? "User unblocked" : "User blocked")
      } else {
        toast.error(data.error || "Failed to update block status")
      }
    } catch (error) {
      console.error("Block/unblock error:", error)
      toast.error("Failed to update block status")
    }
  }

  // Archive/Unarchive
  const toggleArchiveChat = async () => {
    if (!activeChat) return
    try {
      const endpoint = isArchived
        ? `https://newbackend-zoat.onrender.com/api/chat/${activeChat._id}/unarchive`
        : `https://newbackend-zoat.onrender.com/api/chat/${activeChat._id}/archive`
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setIsArchived(!isArchived)
        toast.success(isArchived ? "Chat unarchived" : "Chat archived")
      } else {
        toast.error(data.error || "Failed to update archive status")
      }
    } catch (error) {
      console.error("Archive error:", error)
      toast.error("Failed to update archive status")
    }
  }

  const startMatchmaking = () => {
    setIsSearching(true)
    socket?.emit("start-search", userId)
  }

  const cancelSearch = () => {
    setIsSearching(false)
    socket?.emit("end-search", userId)
  }

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat)
    fetchMessages(chat._id)
    socket?.emit("join-chat", chat._id)
  }

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto"
  }

  if (!isClient) return null

  return (
    <AppLayout>
      <div style={containerStyle} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
          {/* Chat List */}
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-xl">Messages</h2>
              {/* We'll place the random chat modal trigger here */}
              <Button size="sm" variant="outline" onClick={() => setRandomChatOpen(true)} className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> New Chat
              </Button>

              <Modal
                isOpen={randomChatOpen}
                onRequestClose={() => setRandomChatOpen(false)}
                contentLabel="Start Random Chat"
                className="bg-white rounded-lg p-4 max-w-md mx-auto my-20 outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <div className="flex flex-col">
                  <h3 className="font-semibold text-lg">Start a Random Chat</h3>
                  <p className="text-sm text-gray-600">Connect with someone based on shared interests</p>
                  {!isSearching ? (
                    <div className="mt-4">
                      <Button onClick={startMatchmaking}>
                        <Sparkles className="mr-2 h-4 w-4" /> Start Chat
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                      </div>
                      <p className="mt-4 text-center">Finding your match...</p>
                      <Button variant="outline" onClick={cancelSearch} className="mt-4">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Modal>
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {/* If no chats, show a friendly fallback */}
              {chats.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  You have no chats yet. Click <strong>New Chat</strong> to start one!
                </div>
              ) : (
                chats.map(chat => (
                  <motion.div
                    key={chat._id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    className={`p-4 flex items-center space-x-3 cursor-pointer ${
                      activeChat?._id === chat._id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chat.participants[0]?.avatar} />
                        <AvatarFallback>{chat.participants[0]?.username[0]}</AvatarFallback>
                      </Avatar>
                      {chat.participants[0]?.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">
                          {chat.participants.map((p: any) => p.username).join(", ")}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage?.content}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="rounded-full px-2 py-1">{chat.unreadCount}</Badge>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={partner?.avatar} />
                    <AvatarFallback>{partner?.username[0]}</AvatarFallback>
                  </Avatar>
                  {partner?.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{partner?.username}</h3>
                  <p className="text-xs text-muted-foreground">
                    {partner?.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleBlockToggle}>
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleArchiveChat}>
                  {isArchived ? "Unarchive" : "Archive"}
                </Button>
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
              {isPartnerTyping && (
                <div className="text-sm text-gray-500 italic absolute top-0 left-0">
                  Partner is typing...
                </div>
              )}
              <AnimatePresence initial={false}>
                {/* If no messages, show a fallback */}
                {messages.length === 0 ? (
                  <motion.div
                    key="no-messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground p-4"
                  >
                    No messages yet. Send the first message!
                  </motion.div>
                ) : (
                  messages.map(message => {
                    const senderId = typeof message.sender === "object" ? message.sender._id : message.sender
                    const isSender = senderId === userId
                    const uniqueKey = message.isOptimistic ? `opt-${message._id}` : message._id

                    return (
                      <motion.div
                        key={uniqueKey}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`relative max-w-[75%] rounded-lg p-3 ${
                            isSender
                              ? "bg-gray-100 text-gray-900 rounded-br-none"
                              : "bg-purple-600 text-white rounded-bl-none"
                          }`}
                        >
                          {editingMessage && editingMessage._id === message._id ? (
                            <div>
                              <Input
                                value={editMessageContent}
                                onChange={(e) => setEditMessageContent(e.target.value)}
                                className="mb-2"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleEditMessage(message._id)}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="break-words">{message.content}</p>
                              <div className="flex items-center justify-end mt-1 space-x-2">
                                {message.isOptimistic && (
                                  <span className="text-xs opacity-70 animate-pulse">Sending...</span>
                                )}
                                {message.edited && !message.isOptimistic && (
                                  <span className="text-xs opacity-70">edited</span>
                                )}
                                {isSender && message.read ? (
                                  <span className="text-xs text-green-600">Seen</span>
                                ) : isSender ? (
                                  <span className="text-xs text-gray-600">Delivered</span>
                                ) : null}
                                <span className={`text-xs ${isSender ? "text-gray-600" : "text-purple-200"}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </>
                          )}

                          {isSender && !editingMessage && (
                            <div className="absolute top-0 right-0">
                              <Button size="xs" variant="ghost" onClick={() => setDropdownForMessage(message._id)}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              {dropdownForMessage === message._id && (
                                <div className="absolute right-0 mt-6 w-32 bg-white shadow-md border rounded z-10">
                                  <div className="flex flex-col">
                                    <button
                                      className="px-2 py-1 hover:bg-gray-100 text-left"
                                      onClick={() => {
                                        setEditingMessage(message)
                                        setEditMessageContent(message.content)
                                        setDropdownForMessage(null)
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="px-2 py-1 hover:bg-gray-100 text-left"
                                      onClick={() => {
                                        handleDeleteMessage(message._id)
                                        setDropdownForMessage(null)
                                      }}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      className="px-2 py-1 hover:bg-gray-100 text-left"
                                      onClick={() => {
                                        handleAddReaction(message._id)
                                        setDropdownForMessage(null)
                                      }}
                                    >
                                      React
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`absolute top-0 ${
                              isSender
                                ? "-right-1.5 w-3 h-3 bg-gray-100 clip-path-triangle-right"
                                : "-left-1.5 w-3 h-3 bg-purple-600 clip-path-triangle-left"
                            }`}
                          />
                        </motion.div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-background">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={acceptMatchModalOpen}
        onRequestClose={() => setAcceptMatchModalOpen(false)}
        contentLabel="Match Found"
        className="bg-white rounded-lg p-4 max-w-md mx-auto my-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">Match Found!</h3>
          <p className="text-sm text-gray-600">Someone wants to connect with you!</p>
          {matchFoundData?.partner && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={matchFoundData.partner.avatar} />
                <AvatarFallback>{matchFoundData.partner.username[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <h4 className="font-semibold">
                  {maskName(matchFoundData.partner.firstName || matchFoundData.partner.username)}{" "}
                  {matchFoundData.partner.lastName && maskName(matchFoundData.partner.lastName)}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {matchFoundData.partner.age && <p>Age: {matchFoundData.partner.age}</p>}
                  {matchFoundData.partner.location && <p>Location: {matchFoundData.partner.location}</p>}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                socket?.emit("accept-match", { chatId: matchFoundData?.chatId, userId })
                setAcceptMatchModalOpen(false)
                setRandomChatOpen(false)
              }}
              className="w-full"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                socket?.emit("reject-match", { chatId: matchFoundData?.chatId, userId })
                setAcceptMatchModalOpen(false)
              }}
              className="w-full"
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
