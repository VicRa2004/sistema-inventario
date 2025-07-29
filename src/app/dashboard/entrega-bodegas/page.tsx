'use client';

import { useState, useEffect } from 'react';
import {
  registrarEntrega,
  crearContenedor,
  crearBodega,
  obtenerEntregasConDetalles,
  obtenerContenedores,
  obtenerBodegas,
  obtenerUsuarios,
  type RegistrarEntregaData,
  type CrearContenedorData
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

interface Contenedor {
  idContenedor: number;
  codigo: string;
  tipoPalet: string;
  fechaLlegada: string;
}

interface Bodega {
  idBodega: number;
  nombre: string;
}

interface Usuario {
  idUsuario: number;
  nombre: string;
  rol: string;
}

export default function EntregaBodegasPage() {
  const [activeTab, setActiveTab] = useState('entregas');
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [contenedores, setContenedores] = useState<Contenedor[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para formularios
  const [entregaForm, setEntregaForm] = useState<RegistrarEntregaData>({
    codigoContenedor: '',
    idBodega: 0,
    entregadoPor: 0,
    observaciones: ''
  });

  const [contenedorForm, setContenedorForm] = useState<CrearContenedorData>({
    codigo: '',
    tipoPalet: 'C'
  });

  const [bodegaForm, setBodegaForm] = useState({ nombre: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entregasRes, contenedoresRes, bodegasRes, usuariosRes] = await Promise.all([
        obtenerEntregasConDetalles(),
        obtenerContenedores(),
        obtenerBodegas(),
        obtenerUsuarios()
      ]);

      console.log(entregasRes);

      if (entregasRes.success) setEntregas(entregasRes.data);
      if (contenedoresRes.success) setContenedores(contenedoresRes.data);
      if (bodegasRes.success) setBodegas(bodegasRes.data);
      if (usuariosRes.success) setUsuarios(usuariosRes.data);
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

  const handleRegistrarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await registrarEntrega(entregaForm);
      if (result.success) {
        showMessage('success', 'Entrega registrada correctamente');
        setEntregaForm({ codigoContenedor: '', idBodega: 0, entregadoPor: 0, observaciones: '' });
        loadData();
      } else {
        showMessage('error', result.error || 'Error al registrar entrega');
      }
    } catch (error) {
      showMessage('error', 'Error al registrar entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearContenedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await crearContenedor(contenedorForm);
      if (result.success) {
        showMessage('success', 'Contenedor creado correctamente');
        setContenedorForm({ codigo: '', tipoPalet: 'C' });
        loadData();
      } else {
        showMessage('error', result.error || 'Error al crear contenedor');
      }
    } catch (error) {
      showMessage('error', 'Error al crear contenedor');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearBodega = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await crearBodega(bodegaForm.nombre);
      if (result.success) {
        showMessage('success', 'Bodega creada correctamente');
        setBodegaForm({ nombre: '' });
        loadData();
      } else {
        showMessage('error', result.error || 'Error al crear bodega');
      }
    } catch (error) {
      showMessage('error', 'Error al crear bodega');
    } finally {
      setLoading(false);
    }
  };

  const tiposPalet = ['C', 'A', 'S', 'Q', 'I', 'E', 'B'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">Entrega a Bodegas</h1>
        
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'entregas', label: 'Gestión de Entregas' },
                { id: 'contenedores', label: 'Contenedores' },
                { id: 'bodegas', label: 'Bodegas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'entregas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de registro de entrega */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Registrar Nueva Entrega</h2>
              <form onSubmit={handleRegistrarEntrega} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Contenedor
                  </label>
                  <input
                    type="text"
                    value={entregaForm.codigoContenedor}
                    onChange={(e) => setEntregaForm({ ...entregaForm, codigoContenedor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bodega Destino
                  </label>
                  <select
                    value={entregaForm.idBodega}
                    onChange={(e) => setEntregaForm({ ...entregaForm, idBodega: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value={0}>Seleccionar bodega</option>
                    {bodegas.map((bodega) => (
                      <option key={bodega.idBodega} value={bodega.idBodega}>
                        {bodega.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entregado por
                  </label>
                  <select
                    value={entregaForm.entregadoPor}
                    onChange={(e) => setEntregaForm({ ...entregaForm, entregadoPor: parseInt(e.target.value) })}
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
                    Observaciones
                  </label>
                  <textarea
                    value={entregaForm.observaciones}
                    onChange={(e) => setEntregaForm({ ...entregaForm, observaciones: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Entrega'}
                </button>
              </form>
            </div>

            {/* Lista de entregas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Entregas Recientes</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entregas.map((entrega) => (
                  <div key={entrega.idEntrega} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          Contenedor: {entrega.contenedor.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tipo: {entrega.contenedor.tipoPalet}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        entrega.receptor 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entrega.receptor ? 'Recibido' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Bodega: {entrega.bodega.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      Entregado por: {entrega.entregador.nombre}
                    </p>
                    {entrega.receptor && (
                      <p className="text-sm text-gray-600">
                        Recibido por: {entrega.receptor.nombre}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(entrega.fechaEntrega).toLocaleString()}
                    </p>
                    {entrega.observaciones && (
                      <p className="text-sm text-gray-600 mt-1">
                        Obs: {entrega.observaciones}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contenedores' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de contenedor */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Crear Nuevo Contenedor</h2>
              <form onSubmit={handleCrearContenedor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Contenedor
                  </label>
                  <input
                    type="text"
                    value={contenedorForm.codigo}
                    onChange={(e) => setContenedorForm({ ...contenedorForm, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Palet
                  </label>
                  <select
                    value={contenedorForm.tipoPalet}
                    onChange={(e) => setContenedorForm({ ...contenedorForm, tipoPalet: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {tiposPalet.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Contenedor'}
                </button>
              </form>
            </div>

            {/* Lista de contenedores */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Contenedores Registrados</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contenedores.map((contenedor) => (
                  <div key={contenedor.idContenedor} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {contenedor.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tipo: {contenedor.tipoPalet}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(contenedor.fechaLlegada).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bodegas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de bodega */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Crear Nueva Bodega</h2>
              <form onSubmit={handleCrearBodega} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Bodega
                  </label>
                  <input
                    type="text"
                    value={bodegaForm.nombre}
                    onChange={(e) => setBodegaForm({ nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Bodega General, Telefonía, Deportes"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Bodega'}
                </button>
              </form>
            </div>

            {/* Lista de bodegas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Bodegas Registradas</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bodegas.map((bodega) => (
                  <div key={bodega.idBodega} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {bodega.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {bodega.idBodega}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}