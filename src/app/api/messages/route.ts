import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const currentUser = cookieStore.get("currentUser");
  return currentUser?.value || null;
};

const getUserId = (currentUser: string) => {
  return currentUser === "user1-id" ? "user1-id" : "user2-id";
};

const getOtherUserId = (currentUser: string) => {
  return currentUser === "user1-id" ? "user2-id" : "user1-id";
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserId(currentUser);
    const otherUserId = getOtherUserId(currentUser);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: userId }, { receiverId: otherUserId }] },
          { AND: [{ senderId: otherUserId }, { receiverId: userId }] },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content, receiverId } = await req.json();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserId(currentUser);

    const message = await prisma.message.create({
      data: { content, senderId: userId, receiverId },
    });

    const chatChannels = [`chat-${receiverId}`, `chat-${userId}`];
    await Promise.all(
      chatChannels.map((channel) =>
        pusherServer.trigger(channel, "new-message", message)
      )
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
