
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              StreamMatch
            </span>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <nav className="sticky bottom-0 z-10 bg-card border-t border-border">
        <div className="grid grid-cols-3 h-16">
          <NavItem 
            to="/" 
            label="Explorar" 
            isActive={location.pathname === '/'} 
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            } 
          />
          <NavItem 
            to="/matches" 
            label="Matches" 
            isActive={location.pathname === '/matches'} 
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            } 
          />
          <NavItem 
            to="/profile" 
            label="Perfil" 
            isActive={location.pathname === '/profile'} 
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            } 
          />
        </div>
      </nav>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
}

function NavItem({ to, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center h-full transition-colors ${
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
