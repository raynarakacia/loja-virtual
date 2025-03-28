interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <div className="md:hidden bg-primary shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <h1 className="text-xl font-semibold text-white">BarberHub</h1>
        <button onClick={onMobileMenuToggle} className="text-white focus:outline-none">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </div>
  );
}
