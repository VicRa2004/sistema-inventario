'use client';

import { useRouter } from 'next/navigation';
import { FaWarehouse } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <section className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full text-center border-t-8 border-indigo-700">
        <div className="flex justify-center mb-6">
          <FaWarehouse className="text-indigo-700 text-6xl" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Sistema de Control de Inventarios
        </h1>

        <p className="text-gray-600 text-md md:text-lg mb-6 leading-relaxed">
          Bienvenido a la plataforma diseñada para optimizar la recepción, clasificación y localización de mercancía en tiendas departamentales como <strong>Liverpool</strong>.
          Esta herramienta permite llevar un control preciso de los manifiestos y contenedores mediante escaneo y geolocalización, reduciendo errores y pérdidas operativas.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          Iniciar sesión
        </button>
      </section>
    </main>
  );
}
