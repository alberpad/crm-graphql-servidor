import { Clientes, Productos, Pedidos, Usuarios } from "./db";
import { rejects } from "assert";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

import dotenv from "dotenv";
dotenv.config({ path: "variables.env" });
import jwt from "jsonwebtoken";
import { RequestCustom } from "../types";

// Configurando resolvers según requerimiento de grapgql-tools
export const resolvers = {
  Query: {
    // CLIENTES
    getClientes: (
      root: any,
      {
        limite,
        offset,
        idVendedor
      }: { limite: number; offset: number; idVendedor: string }
    ) => {
      let filtro: any;
      if (idVendedor) {
        filtro = { idVendedor: new ObjectId(idVendedor) };
      }
      return new Promise((resolve: any, object) => {
        Clientes.find(filtro, (error: any, clientes: ICliente[]) => {
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
    totalClientes: (root: any, { idVendedor }: { idVendedor: string }) => {
      let filtro: any;
      if (idVendedor) {
        filtro = { idVendedor: new ObjectId(idVendedor) };
      }
      return new Promise((resolve: any, object) => {
        Clientes.countDocuments(filtro, (error: any, count: number) => {
          if (error) rejects(error);
          else resolve(count);
        });
      });
    },
    topClientes: (root: any) => {
      return new Promise((resolve: any, object) => {
        Pedidos.aggregate(
          [
            {
              $match: { estado: "COMPLETADO" }
            },
            {
              $group: {
                // Crea una nueva tabla, por tanto cambia la situación del id del cliente que pasa de cliente a _id
                _id: "$cliente",
                total: { $sum: "$total" }
              }
            },
            {
              $lookup: {
                from: "clientes",
                localField: "_id",
                foreignField: "_id",
                as: "cliente"
              }
            },
            {
              $sort: { total: -1 } // orden descendente
            },
            {
              $limit: 10
            }
          ],
          (error: any, resultado: IMejorCliente) => {
            if (error) rejects(error);
            else resolve(resultado);
          }
        );
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
    },
    // AUTENTICACION Y USUARIOS
    getUsuario: (root: any, args: any, { usuarioActual }: RequestCustom) => {
      if (!usuarioActual) return null;
      // Obtener el usuario actual del request del JWT verificado
      const usuario = Usuarios.findOne({
        usuario: usuarioActual.nombre_usuario
      });
      // console.log(usuario);
      return usuario;
    },
    topVendedores: (root: any) => {
      return new Promise((resolve: any, object) => {
        Pedidos.aggregate(
          [
            {
              $match: { estado: "COMPLETADO" }
            },
            {
              $group: {
                // Crea una nueva tabla, por tanto cambia la situación del id del cliente que pasa de cliente a _id
                _id: "$idVendedor",
                total: { $sum: "$total" }
              }
            },
            {
              $lookup: {
                from: "usuarios",
                localField: "_id",
                foreignField: "_id",
                as: "vendedor"
              }
            },
            {
              $sort: { total: -1 } // orden descendente
            },
            {
              $limit: 10
            }
          ],
          (error: any, resultado: IMejorVendedor) => {
            if (error) rejects(error);
            else resolve(resultado);
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
        idVendedor: input.idVendedor,
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
        fecha: new Date(),
        idVendedor: input.idVendedor
      } as IPedidoInput);
      nuevoPedido.id = nuevoPedido._id;
      return new Promise((resolve: any, object) => {
        nuevoPedido.save((error: any) => {
          if (error) rejects(error);
          else resolve(nuevoPedido);
        });
      });
    },
    actualizarPedido: (root: any, { input }: { input: IPedido }) => {
      return new Promise((resolve: any, object) => {
        const { estado } = input;
        let instruccion: string;
        if (estado === "COMPLETADO") instruccion = "-";
        if (estado === "CANCELADO") instruccion = "+";
        //Actualizar las existencias
        input.productos.forEach(producto => {
          Productos.updateOne(
            { _id: producto.id },
            {
              $inc: { stock: `${instruccion}${producto.cantidad}` }
            },
            function(error) {
              if (error) return new Error(error);
            }
          );
        });
        Pedidos.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (error: any, pedido) => {
            if (error) rejects(error);
            else resolve(pedido);
          }
        );
      });
    },
    // USUARIOS
    crearUsuario: async (root: any, { input }: { input: IUsuarioInput }) => {
      const { usuario } = input;
      const existeUsuario = await Usuarios.findOne({ usuario });
      if (existeUsuario) {
        throw new Error("El usuario ya existe");
      }
      const nuevoUsuario = await new Usuarios(input).save();
      return "Usuario creado correctamente";
    },
    autenticarUsuario: async (
      root: any,
      { input }: { input: IAutenticarInput }
    ) => {
      const { usuario } = input;
      console.log(usuario);
      const nombreUsuario = await Usuarios.findOne({ usuario });
      if (!nombreUsuario) {
        throw new Error("Usuario no encontrado");
      }
      const passwordCorrecto = await bcrypt.compare(
        input.password,
        nombreUsuario.password
      );
      if (!passwordCorrecto) {
        throw new Error("Password Incorrecto");
      }
      const secreto = process.env.SECRETO;
      const expiresIn = "1d";
      const nombre_usuario = nombreUsuario.usuario;
      if (!secreto) throw new Error("No se puede generar el Token");
      return {
        token: jwt.sign({ nombre_usuario }, secreto, { expiresIn })
      };
    }
  }
};

// TYPES & INTERFACES
enum TipoCliente {
  BASICO,
  PREMIUM
}

interface IClienteInput {
  idVendedor: string;
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
interface IMejorCliente {
  total: number;
  cliente: ICliente[];
}

interface IMejorVendedor {
  total: number;
  vendedor: IUsuario[];
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
  idVendedor: string;
}
interface IPedido extends IPedidoInput {
  id: string;
}
interface IPedidoProductoInput {
  id: string;
  cantidad: number;
}
interface IUsuarioInput {
  usuario: string;
  password: string;
  nombre: string;
  rol: string;
}
interface IUsuario {
  usuario: string;
  nombre: string;
  id: string;
  rol: string;
}
interface IAutenticarInput {
  usuario: string;
  password: string;
}
