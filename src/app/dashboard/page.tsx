const items = [
  {
    title: "Entrega a Bodegas",
    image: "/img-menu-1.png",
    url: "/entrega-bodegas",
  },
  {
    title: "Pendiente por Recibir",
    image: "/img-menu-2.png",
    url: "/pendiente-recibir",
  },
  {
    title: "Geolocalizados SKU",
    image: "/img-menu-3.png",
    url: "/geolocalizados-sku", 
  },
  {
    title: "GeoLocalizacion-SKU/BODEGA",
    image: "/img-menu-4.png",
    url: "/geolocalizacion-sku-bodega",
  },
];

export const metadata = {
  title: 'Menu Principal',
  description: 'Descripción de mi aplicación',
};


export default function Home() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <a
            href={`/dashboard${item.url}`}
            key={idx}
            className="bg-white rounded shadow hover:shadow-md transition cursor-pointer p-4 text-center hover:transform hover:scale-105 transition-all duration-300 p-4"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-40 mx-auto object-contain mb-4"
            />
            <p className="font-semibold">{item.title}</p>
          </a>
        ))}
      </div>
    </>
  );
}
