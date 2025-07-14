const items = [
  {
    title: "Entrega a Bodegas",
    image: "/img/entrega.png",
  },
  {
    title: "Pendiente por Recibir",
    image: "/img/pendiente.png",
  },
  {
    title: "Geolocalizados SKU",
    image: "/img/sku.png",
  },
  {
    title: "GeoLocalizacion-SKU/BODEGA",
    image: "/img/rack.png",
  },
];

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded shadow hover:shadow-md transition cursor-pointer p-4 text-center"
        >
          <img src={item.image} alt={item.title} className="h-40 mx-auto object-contain mb-4" />
          <p className="font-semibold">{item.title}</p>
        </div>
      ))}
    </div>
  );
}
