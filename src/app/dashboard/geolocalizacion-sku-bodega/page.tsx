'use client';

import { useState, useEffect } from 'react';
import {
  obtenerUbicacionesConDetalles,
  buscarUbicacionPorSku,
  obtenerMapaOcupacionBodega,
  obtenerEstadisticasBodegaDetalladas,
  obtenerBodegas,
  type UbicacionDetallada,
  type MapaOcupacion,
  type EstadisticasBodega,
  type FiltrosGeolocalizacion
} from '@/app/actions';

interface Bodega {
  idBodega: number;
  nombre: string | null;
  descripcion?: string;
}

export default function GeolocalizacionSkuBodegaPage() {
  // Estados principales
  const [ubicaciones, setUbicaciones] = useState<UbicacionDetallada[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [mapaOcupacion, setMapaOcupacion] = useState<MapaOcupacion[]>([]);
  const [estadisticasBodega, setEstadisticasBodega] = useState<EstadisticasBodega | null>(null);
  const [ubicacionBuscada, setUbicacionBuscada] = useState<UbicacionDetallada | null>(null);
  
  // Estados de búsqueda y filtros
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<number | ''>('');
  const [filtros, setFiltros] = useState<FiltrosGeolocalizacion>({});
  
  // Estados de UI
  const [cargando, setCargando] = useState(false);
  const [vistaActual, setVistaActual] = useState<'lista' | 'mapa' | 'estadisticas'>('lista');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar ubicaciones cuando cambien los filtros
  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      cargarUbicaciones();
    }
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      // Cargar bodegas
      const resultadoBodegas = await obtenerBodegas();
      if (resultadoBodegas.success && resultadoBodegas.data) {
        setBodegas(resultadoBodegas.data);
      }

      // Cargar ubicaciones iniciales
      await cargarUbicaciones();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const resultado = await obtenerUbicacionesConDetalles(filtros);
      if (resultado.success && resultado.data) {
        setUbicaciones(resultado.data);
      } else {
        setUbicaciones([]);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      setUbicaciones([]);
    }
  };

  const buscarPorCodigo = async () => {
    if (!codigoBusqueda.trim()) {
      alert('Por favor ingrese un código SKU');
      return;
    }

    setCargando(true);
    try {
      const resultado = await buscarUbicacionPorSku(codigoBusqueda.trim());
      if (resultado.success) {
        if (resultado.data) {
          setUbicacionBuscada(resultado.data);
          // También actualizar la bodega seleccionada para mostrar el mapa
          setBodegaSeleccionada(resultado.data.idBodega);
        } else {
          setUbicacionBuscada(null);
          alert(resultado.mensaje || 'SKU no tiene ubicación asignada');
        }
      } else {
        setUbicacionBuscada(null);
        alert(resultado.error || 'Error al buscar SKU');
      }
    } catch (error) {
      console.error('Error al buscar por código:', error);
      alert('Error interno del servidor');
    } finally {
      setCargando(false);
    }
  };

  const cargarMapaBodega = async (idBodega: number) => {
    setCargando(true);
    try {
      const resultado = await obtenerMapaOcupacionBodega(idBodega);
      if (resultado.success && resultado.data) {
        // Transformar los datos del modelo a la estructura esperada
        const mapaTransformado = resultado.data.mapa.map((item: any) => ({
          rack: item.ubicacion.rack || '',
          nivel: item.ubicacion.nivel || '',
          pasillo: item.ubicacion.pasillo || '',
          ocupado: item.sku !== null,
          idSku: item.sku?.idSku,
          codigoSku: item.sku?.codigo || undefined,
          descripcionSku: item.sku?.descripcion || undefined,
          fechaUbicacion: item.fechaUbicacion || undefined
        }));
        setMapaOcupacion(mapaTransformado);
      } else {
        setMapaOcupacion([]);
      }
    } catch (error) {
      console.error('Error al cargar mapa:', error);
      setMapaOcupacion([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticasBodega = async (idBodega: number) => {
    setCargando(true);
    try {
      const resultado = await obtenerEstadisticasBodegaDetalladas(idBodega);
      if (resultado.success && resultado.data) {
        setEstadisticasBodega(resultado.data);
      } else {
        setEstadisticasBodega(null);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setEstadisticasBodega(null);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    const nuevosFiltros: FiltrosGeolocalizacion = {};
    
    if (bodegaSeleccionada) {
      nuevosFiltros.idBodega = Number(bodegaSeleccionada);
    }
    
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setBodegaSeleccionada('');
    setUbicacionBuscada(null);
    setMapaOcupacion([]);
    setEstadisticasBodega(null);
    cargarUbicaciones();
  };

  const cambiarVista = (vista: 'lista' | 'mapa' | 'estadisticas') => {
    setVistaActual(vista);
    
    if (vista === 'mapa' && bodegaSeleccionada) {
      cargarMapaBodega(Number(bodegaSeleccionada));
    } else if (vista === 'estadisticas' && bodegaSeleccionada) {
      cargarEstadisticasBodega(Number(bodegaSeleccionada));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧭 Geolocalización SKU / Bodega
        </h1>
        <p className="text-gray-600">
          Consulta la ubicación exacta de productos y visualiza mapas de ocupación por bodega
        </p>
      </div>

      {/* Búsqueda por código SKU */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🔍 Buscar SKU</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código SKU
            </label>
            <input
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Ingrese el código del SKU"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && buscarPorCodigo()}
            />
          </div>
          <button
            onClick={buscarPorCodigo}
            disabled={cargando}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultado de búsqueda */}
        {ubicacionBuscada && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">✅ SKU Encontrado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Código:</span>
                <p className="text-gray-700">{ubicacionBuscada.codigoSku}</p>
              </div>
              <div>
                <span className="font-medium">Descripción:</span>
                <p className="text-gray-700">{ubicacionBuscada.descripcionSku}</p>
              </div>
              <div>
                <span className="font-medium">Bodega:</span>
                <p className="text-gray-700">{ubicacionBuscada.nombreBodega}</p>
              </div>
              <div>
                <span className="font-medium">Ubicación:</span>
                <p className="text-gray-700">{ubicacionBuscada.codigoUbicacion}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros y controles */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bodega
              </label>
              <select
                value={bodegaSeleccionada}
                onChange={(e) => setBodegaSeleccionada(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las bodegas</option>
                {bodegas.map((bodega) => (
                  <option key={bodega.idBodega} value={bodega.idBodega}>
                    {bodega.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Selector de vista */}
          <div className="flex gap-2">
            <button
              onClick={() => cambiarVista('lista')}
              className={`px-4 py-2 rounded-md ${
                vistaActual === 'lista'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => cambiarVista('mapa')}
              disabled={!bodegaSeleccionada}
              className={`px-4 py-2 rounded-md ${
                vistaActual === 'mapa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              🗺️ Mapa
            </button>
            <button
              onClick={() => cambiarVista('estadisticas')}
              disabled={!bodegaSeleccionada}
              className={`px-4 py-2 rounded-md ${
                vistaActual === 'estadisticas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              📊 Estadísticas
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {vistaActual === 'lista' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">📋 Lista de Ubicaciones</h2>
            {cargando ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando ubicaciones...</p>
              </div>
            ) : ubicaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bodega
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rack
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nivel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pasillo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código Ubicación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Ubicación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ubicaciones.map((ubicacion) => (
                      <tr key={ubicacion.idGeo} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ubicacion.codigoSku}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {ubicacion.descripcionSku}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ubicacion.nombreBodega}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ubicacion.rack || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ubicacion.nivel || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ubicacion.pasillo || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ubicacion.codigoUbicacion}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(ubicacion.fechaUbicacion).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron ubicaciones</p>
                <p className="text-sm text-gray-400 mt-1">
                  Seleccione una bodega o ajuste los filtros
                </p>
              </div>
            )}
          </div>
        )}

        {vistaActual === 'mapa' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">🗺️ Mapa de Ocupación</h2>
            {!bodegaSeleccionada ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Seleccione una bodega para ver el mapa</p>
              </div>
            ) : cargando ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando mapa...</p>
              </div>
            ) : mapaOcupacion.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mapaOcupacion.map((ubicacion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      ubicacion.ocupado
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {ubicacion.rack}-{ubicacion.nivel}-{ubicacion.pasillo}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ubicacion.ocupado
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ubicacion.ocupado ? '🔴 Ocupado' : '🟢 Libre'}
                      </span>
                    </div>
                    {ubicacion.ocupado && (
                      <div className="text-sm text-gray-600">
                        <p><strong>SKU:</strong> {ubicacion.codigoSku}</p>
                        <p><strong>Producto:</strong> {ubicacion.descripcionSku}</p>
                        {ubicacion.fechaUbicacion && (
                          <p><strong>Desde:</strong> {new Date(ubicacion.fechaUbicacion).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay datos de mapa disponibles</p>
              </div>
            )}
          </div>
        )}

        {vistaActual === 'estadisticas' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">📊 Estadísticas de Bodega</h2>
            {!bodegaSeleccionada ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Seleccione una bodega para ver las estadísticas</p>
              </div>
            ) : cargando ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
              </div>
            ) : estadisticasBodega ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Ubicaciones</h3>
                  <p className="text-3xl font-bold text-blue-600">{estadisticasBodega.totalUbicaciones}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Ubicaciones Ocupadas</h3>
                  <p className="text-3xl font-bold text-green-600">{estadisticasBodega.ubicacionesOcupadas}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Ubicaciones Libres</h3>
                  <p className="text-3xl font-bold text-yellow-600">{estadisticasBodega.ubicacionesLibres}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">% Ocupación</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {estadisticasBodega.porcentajeOcupacion.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Última Actualización</h3>
                  <p className="text-xl font-semibold text-gray-600">
                    {new Date(estadisticasBodega.ultimaActualizacion).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay estadísticas disponibles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}