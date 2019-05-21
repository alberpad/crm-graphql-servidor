declare namespace Express {
  export interface Request {
    usuarioActual: TypesApp.IUsuarioActual;
  }
  export interface Response {}
}

declare namespace TypesApp {
  export interface IUsuarioActual {
    usuario: string;
    iat: Date;
    exp: Date;
  }
}
