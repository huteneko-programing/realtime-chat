"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { pusherClient } from "@/lib/pusher";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
};

// const messages: Message[] = [
//   {
//     id: "1",
//     content: "こんにちは、User 1です。",
//     senderId: "user1-id",
//     receiverId: "user2-id",
//     createdAt: new Date(),
//   },
//   {
//     id: "2",
//     content: "こんにちは、User 2です。",
//     senderId: "user2-id",
//     receiverId: "user1-id",
//     createdAt: new Date(),
//   },
// ];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();

  // 相手のユーザー情報（デモ用）
  const otherUser = user?.id === "user1-id" ? "user2" : "user1";
  const otherUserId = user?.id === "user1-id" ? "user2-id" : "user1-id";

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToChatChannel(user.id);
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };
  const subscribeToChatChannel = (userId: string) => {
    const channel = pusherClient.subscribe(`chat-${userId}`);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (messageExists) return prev;

        const newMessages = [...prev, data].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setTimeout(scrollToBottom, 100);
        return newMessages;
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`chat-${userId}`);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          receiverId: otherUserId,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // 最下部へスクロール
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  var channel = pusherClient.subscribe("my-channel");
  channel.bind("my-event", function (data: any) {
    alert(JSON.stringify(data));
  });

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-4">コンタクト</h2>
          <div className="flex items-center p-3 hover:bg-gray-100 rounded cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{otherUser[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="ml-3">{otherUser}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">
            ログイン中: <span className="font-semibold">{user?.username}</span>
          </div>
          <Button variant="secondary" onClick={logout} className="w-full">
            ログアウト
          </Button>
        </div>
      </aside>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.senderId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[70%] ${
                  message.senderId === user?.id ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <CardContent className="p-3">
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* メッセージ入力エリア */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="メッセージを入力..."
            />

            <Button onClick={sendMessage}>送信</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
