import { Clientes, Productos } from "./db";
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
      { limite, offset }: { limite: number; offset: number }
    ) => {
      return new Promise((resolve: any, object) => {
        Productos.find({}, (error: any, productos: IProducto[]) => {
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
        tipo: input.tipo,
        pedidos: input.pedidos
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
    }
  }
};

// TYPES & INTERFACES
enum TipoCliente {
  BASICO,
  PREMIUM
}

interface IPedidoInput {
  producto: string;
  precio: number;
}
interface IClienteInput {
  nombre: string;
  apellido: string;
  empresa: string;
  emails: Email[];
  edad: number;
  tipo: TipoCliente;
  pedidos: IPedidoInput[];
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

type TClientesDB = {
  [id: string]: IClienteInput;
};
