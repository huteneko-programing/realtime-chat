"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (id: string) => {
    try {
      setLoading(true);
      login(id);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const renderLoginButton = (id: string, label: string) => (
    <Button
      className="w-full"
      onClick={() => handleLogin(id)}
      disabled={loading}
    >
      {label}
    </Button>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderLoginButton("user1-id", "User 1 としてログイン")}
          {renderLoginButton("user2-id", "User 2 としてログイン")}
        </CardContent>
      </Card>
    </div>
  );
}
