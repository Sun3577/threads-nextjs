// Clerk Component가 작동하려면 ClerkProvider 안에 있어야 됨
import { ClerkProvider } from "@clerk/nextjs";

// Font
import { Inter } from "next/font/google";

// Global CSS
import "../globals.css";

// metaData를 Object처럼 생성
import { Metadata } from "next";

// Next.JS MetaData : https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Threads",
  description: "A Next.js 14 Meta Threads Application",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // React Component의 Children, 전체 집합
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

// inter.className는 body에 적용되어서 body의 font를 일괄 적용
