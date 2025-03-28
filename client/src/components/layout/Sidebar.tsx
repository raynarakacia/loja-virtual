import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Visão Geral", href: "/", icon: "fas fa-chart-line", section: "dashboard" },
  { name: "Barbeiros", href: "/barbers", icon: "fas fa-cut", section: "management" },
  { name: "Serviços", href: "/services", icon: "fas fa-concierge-bell", section: "management" },
  { name: "Clientes", href: "/clients", icon: "fas fa-user-friends", section: "management" },
  { name: "Agendamentos", href: "/appointments", icon: "far fa-calendar-alt", section: "management" },
  { name: "Produtos", href: "/products", icon: "fas fa-shopping-bag", section: "management" },
  { name: "Vendas", href: "/sales", icon: "fas fa-cash-register", section: "management" },
  { name: "Relatórios", href: "/reports", icon: "fas fa-file-alt", section: "reports" }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-shrink-0 bg-white shadow-md">
      <div className="flex flex-col w-64">
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <h1 className="text-xl font-semibold text-white">BarberHub</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Dashboard
            </div>
            {navigationItems
              .filter(item => item.section === "dashboard")
              .map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    location === item.href
                      ? "bg-gray-200 text-primary"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <i className={cn(item.icon, "mr-3", location === item.href ? "text-primary" : "text-gray-500 group-hover:text-primary")}></i>
                  {item.name}
                </Link>
              ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
              Gerenciamento
            </div>
            {navigationItems
              .filter(item => item.section === "management")
              .map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    location === item.href
                      ? "bg-gray-200 text-primary"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <i className={cn(item.icon, "mr-3", location === item.href ? "text-primary" : "text-gray-500 group-hover:text-primary")}></i>
                  {item.name}
                </Link>
              ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
              Relatórios
            </div>
            {navigationItems
              .filter(item => item.section === "reports")
              .map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    location === item.href
                      ? "bg-gray-200 text-primary"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <i className={cn(item.icon, "mr-3", location === item.href ? "text-primary" : "text-gray-500 group-hover:text-primary")}></i>
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
        
        <div className="flex flex-shrink-0 p-4 border-t">
          <div className="flex items-center">
            <div>
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <i className="fas fa-user text-gray-600"></i>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Administrador</p>
              <p className="text-xs font-medium text-gray-500">Gerente</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
