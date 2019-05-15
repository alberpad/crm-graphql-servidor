// DB MONGOOSE
import mongoose, { mongo } from "mongoose";

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/clientes", { useNewUrlParser: true });
mongoose.connect("mongodb://localhost/productos", { useNewUrlParser: true });
mongoose.set("useFindAndModify", false); // Deshabilita mensaje de deprecated por usar FindAndModify

// Definir el schema de clientes
const clientesSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  empresa: String,
  emails: Array,
  edad: Number,
  tipo: String,
  pedidos: Array
});
// Definir el schema de productos
const productosSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number
});
// Definir el schema de pedidos
const pedidosSchema = new mongoose.Schema({
  productos: Array,
  total: Number,
  fecha: Date,
  cliente: String,
  estado: String
});

const Clientes = mongoose.model("clientes", clientesSchema);
const Productos = mongoose.model("productos", productosSchema);
const Pedidos = mongoose.model("pedidos", pedidosSchema);

export { Clientes, Productos, Pedidos };

interface IProductoInput {
  nombre: string;
  precio: number;
  stock: number;
}
interface IProducto extends IProductoInput {
  id: string;
}
