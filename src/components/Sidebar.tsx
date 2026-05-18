'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Clock, MapPin, Compass, Menu, Users } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Entrega Bodegas', icon: Package, href: '/dashboard/entrega-bodegas' },
  { label: 'Pendiente Recibir', icon: Clock, href: '/dashboard/pendiente-por-recibir' },
  { label: 'Geolocalizados SKU', icon: MapPin, href: '/dashboard/geolocalizados-sku' },
  { label: 'Geolocalización', icon: Compass, href: '/dashboard/geolocalizacion-sku-bodega' },
  { label: 'Usuarios', icon: Users, href: '/dashboard/usuarios' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen flex flex-col`}
    >
      {/* Toggle button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-sm transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`text-xs text-gray-500 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? 'v1.0' : 'Sistema de Inventarios\nv1.0'}
        </div>
      </div>
    </aside>
  );
}
