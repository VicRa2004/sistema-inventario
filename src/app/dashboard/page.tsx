import { Package, Clock, MapPin, Compass, Warehouse } from 'lucide-react';

const menuItems = [
  {
    title: 'Entrega a Bodegas',
    description: 'Registrar arribo de contenedores',
    icon: Package,
    url: '/dashboard/entrega-bodegas',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Pendiente por Recibir',
    description: 'Recepciones confirmadas',
    icon: Clock,
    url: '/dashboard/pendiente-por-recibir',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Geolocalizados SKU',
    description: 'Productos por ubicación',
    icon: MapPin,
    url: '/dashboard/geolocalizados-sku',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Geolocalización Bodega',
    description: 'Mapa de bodegas y racks',
    icon: Compass,
    url: '/dashboard/geolocalizacion-sku-bodega',
    color: 'from-purple-500 to-purple-600',
  },
];

export const metadata = {
  title: 'Dashboard - Sistema de Inventarios',
  description: 'Panel principal de control de inventarios',
};

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Warehouse className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Control de Inventarios
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus bodegas y geolocalización de productos
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">24</span>
          </div>
          <p className="text-sm text-gray-600">Entregas Hoy</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">8</span>
          </div>
          <p className="text-sm text-gray-600">Pendientes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">156</span>
          </div>
          <p className="text-sm text-gray-600">SKUs Ubicados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Warehouse className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <p className="text-sm text-gray-600">Bodegas</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              href={item.url}
              key={idx}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-br ${item.color} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
