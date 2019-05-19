// DB MONGOOSE
import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
  cliente: mongoose.Types.ObjectId,
  estado: String
});

// Definir el schema de usuario
const usuariosSchema = new mongoose.Schema({
  usuario: String,
  password: String
});

// Hashear password
usuariosSchema.pre<IUsuario>("save", function(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

const Clientes = mongoose.model("clientes", clientesSchema);
const Productos = mongoose.model("productos", productosSchema);
const Pedidos = mongoose.model("pedidos", pedidosSchema);
const Usuarios = mongoose.model<IUsuario>("usuarios", usuariosSchema);

export { Clientes, Productos, Pedidos, Usuarios };

// interface IProductoInput {
//   nombre: string;
//   precio: number;
//   stock: number;
// }
// interface IProducto extends IProductoInput {
//   id: string;
// }
interface IUsuario extends mongoose.Document {
  usuario: string;
  password: string;
}
