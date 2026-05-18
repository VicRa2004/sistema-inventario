'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    const titles: Record<string, string> = {
      '/dashboard': 'Menú Principal',
      '/dashboard/entrega-bodegas': 'Entrega a Bodegas',
      '/dashboard/pendiente-por-recibir': 'Pendiente por Recibir',
      '/dashboard/geolocalizados-sku': 'Geolocalizados SKU',
      '/dashboard/geolocalizacion-sku-bodega': 'Geolocalización SKU/Bodega',
    };
    setPageTitle(titles[pathname] || 'Dashboard');
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Título */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona tu inventario</p>
        </div>

        {/* Buscador y acciones */}
        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botón añadir */}
          <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>
    </header>
  );
}