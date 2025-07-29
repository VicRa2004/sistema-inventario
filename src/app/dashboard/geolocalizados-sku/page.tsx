'use client';

import { useState, useEffect } from 'react';
import { 
  obtenerSkusGeolocalizados,
  buscarSkuPorCodigo,
  moverSku,
  eliminarUbicacionSku,
  obtenerBodegas,
  type SkuConUbicacion,
  type FiltrosSkuGeolocalizados 
} from '@/app/actions';

interface Bodega {
  idBodega: number;
  nombre: string;
}

export default function GeolocalizadosSkuPage() {
  const [skus, setSkus] = useState<SkuConUbicacion[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosSkuGeolocalizados>({});
  const [busquedaCodigo, setBusquedaCodigo] = useState('');
  const [skuSeleccionado, setSkuSeleccionado] = useState<SkuConUbicacion | null>(null);
  const [mostrarModalMover, setMostrarModalMover] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState({
    idBodega: 0,
    rack: '',
    nivel: '',
    pasillo: ''
  });

  useEffect(() => {
    const cargarBodegas = async () => {
      try {
        const resultado = await obtenerBodegas();
        if (resultado.success) {
          setBodegas((resultado.data || []).map(b => ({ idBodega: b.idBodega, nombre: b.nombre || 'Sin nombre' })));
        } else {
          console.error('Error al cargar bodegas:', resultado.error);
        }
      } catch (error) {
        console.error('Error al cargar bodegas:', error);
      }
    };
    
    cargarBodegas();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resultado = await obtenerSkusGeolocalizados(filtros);
      if (resultado.success) {
        setSkus(resultado.data || []);
      } else {
        console.error('Error al cargar SKUs:', resultado.error);
        setSkus([]);
      }
    } catch (error) {
      console.error('Error al cargar SKUs:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };



  const buscarPorCodigo = async () => {
    if (!busquedaCodigo.trim()) {
      cargarDatos();
      return;
    }

    setLoading(true);
    try {
      const resultado = await buscarSkuPorCodigo(busquedaCodigo);
      if (resultado.success && resultado.data) {
        setSkus([resultado.data.sku]);
      } else {
        setSkus([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setBusquedaCodigo('');
    cargarDatos();
  };

  const abrirModalMover = (sku: SkuConUbicacion) => {
    setSkuSeleccionado(sku);
    setNuevaUbicacion({
      idBodega: sku.idBodega || 0,
      rack: sku.rack || '',
      nivel: sku.nivel || '',
      pasillo: sku.pasillo || ''
    });
    setMostrarModalMover(true);
  };

  const confirmarMover = async () => {
    if (!skuSeleccionado || !nuevaUbicacion.idBodega || !nuevaUbicacion.rack || !nuevaUbicacion.nivel || !nuevaUbicacion.pasillo) {
      alert('Por favor complete todos los campos de ubicación');
      return;
    }

    try {
      const resultado = await moverSku(skuSeleccionado.idSku, {
        idBodega: nuevaUbicacion.idBodega,
        rack: nuevaUbicacion.rack,
        nivel: nuevaUbicacion.nivel,
        pasillo: nuevaUbicacion.pasillo
      });
      if (resultado.success) {
        setMostrarModalMover(false);
        setSkuSeleccionado(null);
        setNuevaUbicacion({ idBodega: 0, rack: '', nivel: '', pasillo: '' });
        cargarDatos();
        alert('SKU movido exitosamente');
      } else {
        alert('Error al mover SKU: ' + resultado.error);
      }
    } catch (error) {
      console.error('Error al mover SKU:', error);
      alert('Error al mover SKU');
    }
  };

  const eliminarUbicacion = async (idSku: number) => {
    if (!confirm('¿Está seguro de eliminar la ubicación de este SKU?')) return;

    try {
      const resultado = await eliminarUbicacionSku(idSku);
      if (resultado.success) {
        cargarDatos();
        alert('Ubicación eliminada exitosamente');
      } else {
        alert('Error al eliminar ubicación: ' + resultado.error);
      }
    } catch (error) {
      console.error('Error al eliminar ubicación:', error);
      alert('Error al eliminar ubicación');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Geolocalizados SKU</h1>
        <p className="text-gray-600">Consulta y gestiona la ubicación de productos por SKU</p>
      </div>

      {/* Búsqueda por código */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Búsqueda por Código SKU</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ingrese código SKU"
            value={busquedaCodigo}
            onChange={(e) => setBusquedaCodigo(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && buscarPorCodigo()}
          />
          <button
            onClick={buscarPorCodigo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filtros.idBodega || ''}
            onChange={(e) => setFiltros({...filtros, idBodega: e.target.value ? Number(e.target.value) : undefined})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las bodegas</option>
            {bodegas.map(bodega => (
              <option key={bodega.idBodega} value={bodega.idBodega}>
                {bodega.nombre}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Rack"
            value={filtros.rack || ''}
            onChange={(e) => setFiltros({...filtros, rack: e.target.value || undefined})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <input
            type="text"
            placeholder="Pasillo"
            value={filtros.pasillo || ''}
            onChange={(e) => setFiltros({...filtros, pasillo: e.target.value || undefined})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex gap-4 mt-4">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Lista de SKUs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">SKUs Geolocalizados ({skus.length})</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        ) : skus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No se encontraron SKUs geolocalizados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bodega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skus.map((sku) => (
                  <tr key={sku.idSku} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sku.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sku.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sku.nombreBodega}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sku.rack || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sku.codigoUbicacion || `${sku.pasillo}-${sku.rack}-${sku.nivel}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sku.codigoContenedor || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sku.fechaUbicacion ? new Date(sku.fechaUbicacion).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => abrirModalMover(sku)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Mover
                      </button>
                      <button
                        onClick={() => eliminarUbicacion(sku.idSku)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para mover SKU */}
      {mostrarModalMover && skuSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Mover SKU: {skuSeleccionado.codigo}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
                <select
                  value={nuevaUbicacion.idBodega}
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, idBodega: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>Seleccionar bodega</option>
                  {bodegas.map(bodega => (
                    <option key={bodega.idBodega} value={bodega.idBodega}>
                      {bodega.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                <input
                  type="text"
                  value={nuevaUbicacion.rack}
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, rack: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                <input
                  type="text"
                  value={nuevaUbicacion.nivel}
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, nivel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pasillo</label>
                <input
                  type="text"
                  value={nuevaUbicacion.pasillo}
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, pasillo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={confirmarMover}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setMostrarModalMover(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}