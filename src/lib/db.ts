import { PrismaClient } from "@prisma/client";

// Prisma Clientのシングルトン生成関数
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// グローバルオブジェクトに型を定義
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// グローバルオブジェクトにPrisma Clientのインスタンスを保存
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// 本番環境でない場合にのみグローバルにインスタンスを保持
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
