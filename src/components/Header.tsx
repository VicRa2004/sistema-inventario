'use client';

import { FaPlus } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-indigo-100 text-indigo-700 px-6 py-4 flex justify-between items-center shadow-sm border-b border-indigo-200">
      {/* Título */}
      <h2 className="text-lg font-semibold">Menú Principal</h2>

      {/* Buscador */}
      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Buscar en el menú..."
          className="w-full max-w-lg px-4 py-2 rounded-full bg-white text-indigo-700 placeholder-indigo-400 focus:outline-none shadow focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Botón añadir */}
      <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full transition shadow-sm">
        <FaPlus className="text-sm" />
        Añadir
      </button>
    </header>
  );
}
