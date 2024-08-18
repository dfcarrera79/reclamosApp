export interface user {
  id: string;
  nombre_comercial: string;
  clave: string;
  ruc_cliente: string;
  razon_social: string;
}

export interface Motivo {
  id_motivo: number;
  nombre_motivo: string;
  prioridad: number;
}

export interface Arch {
  id_detalle: number;
  id_archivo: number;
}

export interface Archivo {
  path: string;
}

interface Otra_Info {
  cantidad: number;
  cantidad_x_uni: number;
  fecha_corta: boolean;
  fecha_vencimiento: string;
  lote: string;
  r_sanitario: string;
}

export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  otra_info: Otra_Info[];
}

export interface ProductoLaboratorio {
  art_codigo: number;
  seccion: string;
  laboratorio: string;
  codigo_interno: string;
  codigo_barras: string;
  nombre_articulo: string;
  presentacion: string;
}

export interface Cols {
  name: string;
  align: string;
  label: string;
  field: string;
  sortable: boolean;
  __iconClass: string;
  __thClass: string;
  value: string | number;
}

interface Map {
  name: string;
  align: string;
  label: string;
  field: string;
  sortable: boolean;
  __iconClass: string;
  __thClass: string;
}

interface ColsMap {
  nombre: Map;
  fecha: Map;
  cantidad: Map;
  lote: Map;
  reclamo: Map;
}

export interface TablaEditarReclamo {
  key: number;
  row: Producto;
  pageIndex: number;
  __trClass: string;
  cols: Cols[];
  colsMap: ColsMap;
  rowIndex: number;
  color: string;
  dark: boolean;
  dense: boolean;
  expand: boolean;
}

export interface Detalle {
  producto: Producto;
  motivo: Motivo;
  comentario: string;
  usuario: string;
  archivos: [number, number, number];
}

export interface Reclamos {
  tipo: number;
  no_factura: string;
  ruc_reclamante: string;
  reclamos: string;
}

export interface Item {
  art_codigo: number;
  art_codbar: string;
  art_nomlar: string;
  dt_cant: number;
  dt_lote: string;
  dt_fecha: string;
  conteo_pedido: string;
}

export interface Productos {
  art_codigo: number;
  art_nomlar: string;
}

interface NumeroProductos {
  num_productos: number;
}

export interface RespuestaNumeroProductos {
  error: string;
  mensaje: string;
  objetos: NumeroProductos[];
}

export interface Respuesta {
  error: string;
  mensaje: string;
  objetos: number;
}

export interface RespuestaArchivo {
  error: string;
  mensaje: string;
  objetos: Archivo[];
}

export interface FilasReclamos {
  estado: string;
  ruc: string;
  nro_factura: string;
  nro_reclamo: number;
  fecha_reclamo: string;
  fecha_enproceso: string | null;
  fecha_finalizado: string | null;
  cliente: string;
  nombre_usuario: string | null;
  respuesta_enproceso: string | null;
  respuesta_finalizado: string | null;
  id_detalle: number;
  reclamos: Detalle[];
}

export interface Filas {
  nro_reclamo: number;
  fecha_reclamo: string;
  fecha_enproceso: string;
  fecha_finalizado: string;
  ruc: string;
  cliente: string;
  email: string;
  nro_factura: string;
  fecha_factura: string;
  nombre_usuario: string | null;
  respuesta_enproceso: string | null;
  respuesta_finalizado: string | null;
  reclamos: Detalle[];
}

export interface Objetos {
  id_detalle: number;
  id_reclamo: number;
  fecha_reclamo: string;
  nombre_reclamante: string;
  ruc_reclamante: string;
  no_factura: string;
  email: string;
  fecha_factura: string;
  fecha_enproceso: string | null;
  fecha_finalizado: string | null;
  respuesta_enproceso: string | null;
  respuesta_finalizado: string | null;
  nombre_usuario: string | null;
  reclamos: Detalle[];
}

export interface RespuestaBodega {
  error: string;
  mensaje: string;
  objetos: Objetos[];
}

export interface DetallesReclamos {
  estado: string;
  ruc_reclamante: string;
  no_factura: string;
  id_reclamo: number;
  fecha_reclamo: string;
  fecha_factura?: string;
  nombre_reclamante: string;
  id_detalle: number;
  nombre_usuario: string | null;
  fecha_enproceso: string | null;
  fecha_finalizado: string | null;
  respuesta_enproceso: string | null;
  respuesta_finalizado: string | null;
  reclamos: Detalle[];
}

export interface ObjetosReclamos {
  fecha_factura: string;
  ruc_reclamante: string;
  detalles: DetallesReclamos[];
}

export interface RespuestaReclamos {
  error: string;
  mensaje: string;
  objetos: ObjetosReclamos;
}

export interface ReclamoActualizado {
  id_reclamo: number;
  estado: string;
  login_usuario: string;
  nombre_usuario: string;
  respuesta_finalizado: string;
}

export interface File {
  __key: string;
}

export interface Documento {
  id_documento: number;
  id_producto: number;
  tipo: number;
  modificado_en: string;
  path: string;
}

interface LaboratorioResponse {
  pkey_laboratorio: number;
  nombre_laboratorio: string;
}

export interface ResponseData {
  error: string;
  mensaje: string;
  objetos: LaboratorioResponse[]; // Adjust the type of 'objetos' based on the expected array elements
}

interface Objeto {
  razon_social: string;
}

export interface RespuestaResponse {
  error: string;
  mensaje: string;
  objetos: Objeto[];
}

export interface SessionData {
  usuario: {
    id: string;
    nombre_comercial: string;
    clave: string;
    ruc_cliente: string;
    razon_social: string;
  };
  estaLogeado: boolean;
  appCodigo: number;
  appVersion: string;
  currentURL: string;
}

export interface Meses {
  nombre: string;
  codigo: number;
}

export interface Reporte {
  nombre_motivo: string;
  count: number;
}

export interface RespuestaReporte {
  error: string;
  mensaje: string;
  objetos: Reporte[];
}

export interface Opcion {
  label: string;
  valor: number;
}
