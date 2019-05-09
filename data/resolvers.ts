import mongoose, { ModelOptions } from "mongoose";
import { Clientes } from "./db";
import { rejects } from "assert";

class Cliente implements ICliente {
  nombre: string;
  apellido: string;
  empresa: string;
  emails: string[];
  id: string;
  edad: number;
  tipo: TipoCliente;
  pedidos: IPedidoInput[];

  constructor(id: string, clienteInput: IClienteInput) {
    this.id = id;
    this.nombre = clienteInput.nombre;
    this.apellido = clienteInput.apellido;
    this.emails = clienteInput.emails;
    this.empresa = clienteInput.empresa;
    this.edad = clienteInput.edad;
    this.tipo = clienteInput.tipo;
    this.pedidos = clienteInput.pedidos;
  }
}

// const clientesDB: TClientesDB = {};

// Configurando resolvers según requerimiento de grapgql-tools
export const resolvers = {
  Query: {
    getClientes: (root: any, { limite }: { limite: number }) => {
      return new Promise((resolve: any, object) => {
        Clientes.find({}, (error: any, clientes: ICliente[]) => {
          if (error) rejects(error);
          else resolve(clientes);
        });
      });
    },
    getCliente: (root: any, { id }: { id: string }) => {
      return new Promise((resolve: any, object) => {
        Clientes.findById(id, (error: any, cliente: ICliente) => {
          if (error) rejects(error);
          else resolve(cliente);
        });
      });
    }
  },
  Mutation: {
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
  emails: string[];
  edad: number;
  tipo: TipoCliente;
  pedidos: IPedidoInput[];
}

interface ICliente extends IClienteInput {
  id: string;
}

type TClientesDB = {
  [id: string]: IClienteInput;
};
