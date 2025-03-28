import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="bg-white border-b border-secondary-200 p-4 flex justify-between items-center md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white">
            BP
          </div>
          <h1 className="font-bold text-lg text-primary-800">BarberPro</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-secondary-500 hover:text-secondary-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-secondary-50">
        <div className="p-6">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  );
}
