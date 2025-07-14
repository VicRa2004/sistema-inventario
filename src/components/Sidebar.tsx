'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaUsers,
  FaBoxOpen,
  FaBarcode,
  FaBullhorn
} from 'react-icons/fa';

const menuItems = [
  { label: 'Menu Principal', icon: <FaUsers />, href: '/app' },
  { label: 'Entrega a Bodegas', icon: <FaBoxOpen />, href: '/app/entrega' },
  { label: 'Geolocalizado SKU', icon: <FaBarcode />, href: '/app/geolocalizado' },
  { label: 'Pendientes por Recibir', icon: <FaBullhorn />, href: '/app/pendientes' }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group h-screen bg-white border-r border-gray-200 transition-all duration-300 w-16 hover:w-60 overflow-hidden shadow-md">
      <nav className="flex flex-col py-6 space-y-1">
        {menuItems.map(({ label, icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-l-full transition-all duration-200
                ${isActive ? 'bg-indigo-100 text-indigo-600 font-semibold' : 'text-gray-700'}
                hover:bg-indigo-50 hover:text-indigo-600
              `}
            >
              <span className={`text-xl min-w-[24px] ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                {icon}
              </span>
              <span className="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
