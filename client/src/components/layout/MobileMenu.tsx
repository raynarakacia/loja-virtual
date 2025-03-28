import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Visão Geral", href: "/", icon: "fas fa-chart-line" },
  { name: "Barbeiros", href: "/barbers", icon: "fas fa-cut" },
  { name: "Serviços", href: "/services", icon: "fas fa-concierge-bell" },
  { name: "Clientes", href: "/clients", icon: "fas fa-user-friends" },
  { name: "Agendamentos", href: "/appointments", icon: "far fa-calendar-alt" },
  { name: "Produtos", href: "/products", icon: "fas fa-shopping-bag" },
  { name: "Vendas", href: "/sales", icon: "fas fa-cash-register" },
  { name: "Relatórios", href: "/reports", icon: "fas fa-file-alt" }
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 bg-gray-800 bg-opacity-50 md:hidden">
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-semibold text-primary">BarberHub</h1>
          <button onClick={onClose} className="text-gray-500 focus:outline-none">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="px-4 py-4 space-y-3">
          {navigationItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "block px-2 py-2 text-sm font-medium rounded-md",
                location === item.href
                  ? "bg-gray-200 text-primary"
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              <i className={cn(item.icon, "mr-3")}></i>
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
