"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
};

const messages: Message[] = [
  {
    id: "1",
    content: "こんにちは、User 1です。",
    senderId: "user1-id",
    receiverId: "user2-id",
    createdAt: new Date(),
  },
  {
    id: "2",
    content: "こんにちは、User 2です。",
    senderId: "user2-id",
    receiverId: "user1-id",
    createdAt: new Date(),
  },
];

export default function ChatPage() {
  const { user } = useAuth();

  // 相手のユーザー情報（デモ用）
  const otherUser = user?.username === "user1" ? "user2" : "user1";

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <h2 className="text-lg font-semibold mb-4">コンタクト</h2>
        <div className="flex items-center p-3 hover:bg-gray-100 rounded cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{otherUser[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="ml-3">{otherUser}</span>
        </div>
      </div>

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
        </div>

        {/* メッセージ入力エリア */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input placeholder="メッセージを入力..." />
            <Button>送信</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
