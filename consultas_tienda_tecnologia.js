// ============================================================================
// CURSO: Big Data (202016911) - UNAD
// TAREA 4: Almacenamiento y Consultas de Datos en Big Data (MongoDB)
// BASE DE DATOS: tienda_tecnologia
// ============================================================================

// 1. SELECCIÓN DE LA BASE DE DATOS
use tienda_tecnologia;

// 2. CREACIÓN E INSERCIÓN MASIVA EN LA COLECCIÓN 'productos' (100 documentos)
const categorias = ["Laptops", "Smartphones", "Audio", "Monitores", "Accesorios"];
const marcas = ["Lenovo", "Samsung", "Sony", "LG", "Logitech"];
let listaProductos = [];

for (let i = 1; i <= 100; i++) {
  let idx = i % categorias.length;
  listaProductos.push({
    codigo_prod: "PROD-" + String(i).padStart(3, '0'),
    nombre: categorias[idx] + " Serie Pro " + i,
    categoria: categorias[idx],
    precio: (i * 15000) + 120000,
    stock: (i % 35) + 5,
    especificaciones: {
      marca: marcas[idx],
      garantia_meses: (i % 2 === 0) ? 12 : 24
    },
    etiquetas: ["tecnologia", categorias[idx].toLowerCase(), "oferta"]
  });
}

db.productos.insertMany(listaProductos);
db.productos.countDocuments();

// 3. CREACIÓN E INSERCIÓN EN LA COLECCIÓN 'ventas' (6 documentos)
db.ventas.insertMany([
  { codigo_prod: "PROD-001", cliente: "Carlos Ruiz", ciudad: "Bogotá",
    cantidad: 2, total_venta: 270000, fecha: new Date("2026-11-02") },
  { codigo_prod: "PROD-002", cliente: "Laura Gómez", ciudad: "Medellín",
    cantidad: 1, total_venta: 150000, fecha: new Date("2026-11-04") },
  { codigo_prod: "PROD-005", cliente: "Andrés Díaz", ciudad: "Bogotá",
    cantidad: 3, total_venta: 585000, fecha: new Date("2026-11-07") },
  { codigo_prod: "PROD-010", cliente: "Sofía Castro", ciudad: "Cali",
    cantidad: 1, total_venta: 270000, fecha: new Date("2026-11-10") },
  { codigo_prod: "PROD-012", cliente: "Mateo Vargas", ciudad: "Barranquilla",
    cantidad: 2, total_venta: 600000, fecha: new Date("2026-11-14") },
  { codigo_prod: "PROD-020", cliente: "Valentina Ríos", ciudad: "Bogotá",
    cantidad: 1, total_venta: 420000, fecha: new Date("2026-11-16") }
]);

// 4. CONSULTAS BÁSICAS DE GESTIÓN (CRUD)
// Inserción
db.productos.insertOne({
  codigo_prod: "PROD-101",
  nombre: "Teclado Mecánico RGB",
  categoria: "Accesorios",
  precio: 320000,
  stock: 20,
  especificaciones: { marca: "Logitech", garantia_meses: 12 },
  etiquetas: ["gaming", "accesorios"]
});

// Selección
db.productos.find({ codigo_prod: "PROD-101" });

// Actualización
db.productos.updateOne(
  { codigo_prod: "PROD-101" },
  { $set: { precio: 295000 }, $inc: { stock: -2 } }
);

// Eliminación
db.productos.deleteOne({ codigo_prod: "PROD-101" });

// 5. CONSULTAS CON FILTROS Y OPERADORES ($in, $gte, $lte y subdocumentos)
db.productos.find({
  categoria: { $in: ["Laptops", "Monitores"] },
  precio: { $gte: 500000, $lte: 1200000 },
  "especificaciones.garantia_meses": 24
}).limit(2);

// 6. CRUCE ENTRE COLECCIONES (JOIN con $lookup)
db.ventas.aggregate([
  {
    $lookup: {
      from: "productos",
      localField: "codigo_prod",
      foreignField: "codigo_prod",
      as: "info_producto"
    }
  },
  { $unwind: "$info_producto" },
  {
    $project: {
      _id: 0,
      cliente: 1,
      ciudad: 1,
      producto: "$info_producto.nombre",
      cantidad: 1,
      total_venta: 1
    }
  }
]);

// 7. CONSULTAS ESTADÍSTICAS DE AGREGACIÓN (Contar, Sumar y Promediar)
db.productos.aggregate([
  {
    $group: {
      _id: "$categoria",
      total_productos: { $sum: 1 },
      stock_total: { $sum: "$stock" },
      precio_promedio: { $avg: "$precio" }
    }
  },
  { $sort: { precio_promedio: -1 } }
]);
