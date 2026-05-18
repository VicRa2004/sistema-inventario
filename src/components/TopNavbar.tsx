import Link from 'next/link';
import { Warehouse, User } from 'lucide-react';

export default function TopNavbar() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <Warehouse className="h-7 w-7" />
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Sistema de Inventarios
          </h1>
          <p className="text-xs text-indigo-200">Control y Geolocalización</p>
        </div>
      </Link>

      <Link href="/login" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
        <User className="h-5 w-5" />
        <span className="text-sm font-medium">Iniciar sesión</span>
      </Link>
    </header>
  );
}
