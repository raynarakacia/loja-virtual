import { Link, useLocation } from "wouter";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 z-50 md:hidden">
      <div className="bg-white w-64 h-full overflow-y-auto">
        <div className="p-4 flex justify-between items-center border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white">
              BP
            </div>
            <h1 className="font-bold text-lg text-primary-800">BarberPro</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-4">
          <div className="px-4 py-2 text-sm font-medium text-secondary-400">
            Menu Principal
          </div>

          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location === "/"
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/barbers"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/barbers")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Barbeiros</span>
          </Link>

          <Link
            href="/services"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/services")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span>Serviços</span>
          </Link>

          <Link
            href="/clients"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/clients")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Clientes</span>
          </Link>

          <Link
            href="/appointments"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/appointments")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Agendamentos</span>
          </Link>

          <Link
            href="/products"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/products")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Produtos</span>
          </Link>

          <Link
            href="/sales"
            onClick={onClose}
            className={`flex items-center px-4 py-3 ${
              location.startsWith("/sales")
                ? "text-secondary-900 bg-secondary-100 border-l-4 border-primary-500"
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 text-lg h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Vendas</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
