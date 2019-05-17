import { Clientes, Productos, Pedidos } from "./db";
import { rejects } from "assert";

// Configurando resolvers según requerimiento de grapgql-tools
export const resolvers = {
  Query: {
    // CLIENTES
    getClientes: (
      root: any,
      { limite, offset }: { limite: number; offset: number }
    ) => {
      return new Promise((resolve: any, object) => {
        Clientes.find({}, (error: any, clientes: ICliente[]) => {
          if (error) rejects(error);
          else resolve(clientes);
        })
          .limit(limite)
          .skip(offset);
      });
    },
    getCliente: (root: any, { id }: { id: string }) => {
      return new Promise((resolve: any, object) => {
        Clientes.findById(id, (error: any, cliente: ICliente) => {
          if (error) rejects(error);
          else resolve(cliente);
        });
      });
    },
    totalClientes: (root: any) => {
      return new Promise((resolve: any, object) => {
        Clientes.countDocuments({}, (error: any, count: number) => {
          if (error) rejects(error);
          else resolve(count);
        });
      });
    },
    // PRODUCTOS
    getProductos: (
      root: any,
      {
        limite,
        offset,
        stock
      }: { limite: number; offset: number; stock: boolean }
    ) => {
      let filtro: any;
      if (stock) {
        filtro = { stock: { $gt: 0 } };
      }
      return new Promise((resolve: any, object) => {
        Productos.find(filtro, (error: any, productos: IProducto[]) => {
          if (error) rejects(error);
          else resolve(productos);
        })
          .limit(limite)
          .skip(offset);
      });
    },
    getProducto: (root: any, { id }: { id: string }) => {
      return new Promise((resolve: any, object) => {
        Productos.findById(id, (error: any, producto: IProducto) => {
          if (error) rejects(error);
          else resolve(producto);
        });
      });
    },
    totalProductos: (root: any) => {
      return new Promise((resolve: any, object) => {
        Productos.countDocuments({}, (error: any, count: number) => {
          if (error) rejects(error);
          else resolve(count);
        });
      });
    },
    // PEDIDOS
    getPedidos: (root: any, { clienteId }: { clienteId: string }) => {
      return new Promise((resolve: any, object) => {
        Pedidos.find(
          { cliente: clienteId },
          (error: any, pedidos: IPedido[]) => {
            if (error) rejects(error);
            else resolve(pedidos);
          }
        );
      });
    }
  },
  Mutation: {
    // CLIENTES
    crearCliente: (root: any, { input }: { input: IClienteInput }) => {
      const nuevoCliente = new Clientes({
        nombre: input.nombre,
        apellido: input.apellido,
        empresa: input.empresa,
        emails: input.emails,
        edad: input.edad,
        tipo: input.tipo
      });
      nuevoCliente.id = nuevoCliente._id;
      return new Promise((resolve: any, object) => {
        nuevoCliente.save((error: any) => {
          if (error) rejects(error);
          else resolve(nuevoCliente);
        });
      });
    },
    actualizarCliente: (root: any, { input }: { input: ICliente }) => {
      return new Promise((resolve: any, object) => {
        Clientes.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (error, cliente) => {
            if (error) rejects(error);
            else resolve(cliente);
          }
        );
      });
    },
    eliminarCliente: (root: any, { id }: ICliente) => {
      return new Promise((resolve: any, object) => {
        Clientes.findOneAndRemove({ _id: id }, error => {
          if (error) rejects(error);
          else resolve(`Cliente ${id} eliminado`);
        });
      });
    },
    // PRODUCTOS
    nuevoProducto: (root: any, { input }: { input: IProductoInput }) => {
      const nuevoProducto = new Productos({
        nombre: input.nombre,
        precio: input.precio,
        stock: input.stock
      });
      nuevoProducto.id = nuevoProducto._id;
      return new Promise((resolve: any, object) => {
        nuevoProducto.save((error: any) => {
          if (error) rejects(error);
          else resolve(nuevoProducto);
        });
      });
    },
    actualizarProducto: (root: any, { input }: { input: IProducto }) => {
      return new Promise((resolve: any, object) => {
        Productos.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (error: any, producto) => {
            if (error) rejects(error);
            else resolve(producto);
          }
        );
      });
    },
    eliminarProducto: (root: any, { id }: IProducto) => {
      return new Promise((resolve: any, object) => {
        Productos.findOneAndRemove({ _id: id }, error => {
          if (error) rejects(error);
          else resolve(`Producto ${id} eliminado`);
        });
      });
    },
    // PEDIDOS
    nuevoPedido: (root: any, { input }: { input: IPedidoInput }) => {
      const nuevoPedido = new Pedidos({
        productos: input.productos,
        total: input.total,
        cliente: input.cliente,
        estado: "PENDIENTE", // Default value
        fecha: new Date()
      } as IPedidoInput);
      nuevoPedido.id = nuevoPedido._id;
      return new Promise((resolve: any, object) => {
        //Actualizar las existencias
        input.productos.forEach(producto => {
          Productos.updateOne(
            { _id: producto.id },
            {
              $inc: { stock: -producto.cantidad }
            },
            function(error) {
              if (error) return new Error(error);
            }
          );
        });
        nuevoPedido.save((error: any) => {
          if (error) rejects(error);
          else resolve(nuevoPedido);
        });
      });
    }
  }
};

// TYPES & INTERFACES
enum TipoCliente {
  BASICO,
  PREMIUM
}

interface IClienteInput {
  nombre: string;
  apellido: string;
  empresa: string;
  emails: Email[];
  edad: number;
  tipo: TipoCliente;
}
interface Email {
  email: String;
}
interface ICliente extends IClienteInput {
  id: string;
}

interface IProductoInput {
  nombre: string;
  precio: number;
  stock: number;
}
interface IProducto extends IProductoInput {
  id: string;
}
interface IPedidoInput {
  productos: IPedidoProductoInput[];
  total: number;
  fecha: Date;
  cliente: string;
  estado: string;
}
interface IPedido extends IPedidoInput {
  id: string;
}
interface IPedidoProductoInput {
  id: string;
  cantidad: number;
}
