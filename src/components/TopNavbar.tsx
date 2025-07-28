import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';

export default function TopNavbar() {
  return (
    <header className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Nombre de la app */}
      <Link href="/" className="">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight hover:text-indigo-200 transition">
        Geolocalización bodegas T0012
        </h1>
      </Link>

      {/* Menú de usuario (placeholder) */}
      <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-200 transition">
        <FaUserCircle className="text-2xl" />
        <span className="hidden md:inline text-sm">Cuenta</span>
      </div>
    </header>
  );
}
