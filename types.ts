import { Request } from "express";
export interface RequestCustom extends Request {
  usuarioActual: IUsuarioActual;
}
export interface IUsuarioActual {
  nombre_usuario: string;
  iat: Date;
  exp: Date;
}
