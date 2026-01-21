import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login - Kalash Heritage",
  description: "Sign in to your Kalash Heritage account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple header with logo */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="relative h-10 w-32 block mx-auto">
            <Image
              src="/kalaash-heritage-logo.png"
              alt="Kalash Heritage"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Kalash Heritage. All rights reserved.</p>
      </footer>
    </div>
  );
}
