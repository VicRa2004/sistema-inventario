'use client';

import { useState, useEffect } from 'react';
import {
  obtenerEntregasConDetalles,
  confirmarRecepcion,
  obtenerUsuarios
} from '@/app/actions';

interface Entrega {
  idEntrega: number;
  contenedor: { codigo: string; tipoPalet: string };
  bodega: { nombre: string };
  entregador: { nombre: string };
  receptor?: { nombre: string };
  fechaEntrega: string;
  observaciones?: string;
}

interface Usuario {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export default function PendientePorRecibirPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedEntrega, setSelectedEntrega] = useState<number | null>(null);
  const [recepcionForm, setRecepcionForm] = useState({
    idEntrega: 0,
    recibidoPor: 0,
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entregasRes, usuariosRes] = await Promise.all([
        obtenerEntregasConDetalles(),
        obtenerUsuarios()
      ]);

      if (entregasRes.success && entregasRes.data) {
        // Filtrar solo entregas pendientes (sin receptor)
        const entregasPendientes = entregasRes.data.filter((entrega: any) => !entrega.receptor);
        setEntregas(entregasPendientes);
      }
      if (usuariosRes.success && usuariosRes.data) setUsuarios(usuariosRes.data);
    } catch (error) {
      showMessage('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleConfirmarRecepcion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await confirmarRecepcion(
        recepcionForm.idEntrega,
        recepcionForm.recibidoPor,
        recepcionForm.observaciones
      );
      if (result.success) {
        showMessage('success', 'Recepción confirmada correctamente');
        setRecepcionForm({ idEntrega: 0, recibidoPor: 0, observaciones: '' });
        setSelectedEntrega(null);
        loadData();
      } else {
        showMessage('error', result.error || 'Error al confirmar recepción');
      }
    } catch (error) {
      showMessage('error', 'Error al confirmar recepción');
    } finally {
      setLoading(false);
    }
  };

  const openRecepcionModal = (entrega: Entrega) => {
    setSelectedEntrega(entrega.idEntrega);
    setRecepcionForm({
      idEntrega: entrega.idEntrega,
      recibidoPor: 0,
      observaciones: ''
    });
  };

  const closeRecepcionModal = () => {
    setSelectedEntrega(null);
    setRecepcionForm({ idEntrega: 0, recibidoPor: 0, observaciones: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">Pendiente por Recibir</h1>
        
        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Lista de entregas pendientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-indigo-800">Entregas Pendientes por Recibir</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {entregas.length} pendientes
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entregas.map((entrega) => (
              <div key={entrega.idEntrega} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {entrega.contenedor.codigo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo: {entrega.contenedor.tipoPalet}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium">
                    Pendiente
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Bodega:</span> {entrega.bodega.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Entregado por:</span> {entrega.entregador.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Fecha:</span> {new Date(entrega.fechaEntrega).toLocaleString()}
                  </p>
                  {entrega.observaciones && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Obs:</span> {entrega.observaciones}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => openRecepcionModal(entrega)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Confirmar Recepción
                </button>
              </div>
            ))}
          </div>
          
          {entregas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entregas pendientes</h3>
              <p className="text-gray-500">Todas las entregas han sido recibidas correctamente.</p>
            </div>
          )}
        </div>

        {/* Modal de confirmación de recepción */}
        {selectedEntrega && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Recepción</h3>
                <form onSubmit={handleConfirmarRecepcion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recibido por
                    </label>
                    <select
                      value={recepcionForm.recibidoPor}
                      onChange={(e) => setRecepcionForm({ ...recepcionForm, recibidoPor: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value={0}>Seleccionar usuario</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.idUsuario} value={usuario.idUsuario}>
                          {usuario.nombre} ({usuario.rol})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones de recepción
                    </label>
                    <textarea
                      value={recepcionForm.observaciones}
                      onChange={(e) => setRecepcionForm({ ...recepcionForm, observaciones: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Observaciones opcionales..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={closeRecepcionModal}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Confirmando...' : 'Confirmar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}