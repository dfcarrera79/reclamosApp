import { QTableProps } from 'quasar';
import { Filas, Producto } from '../components/models';

export const columnasVisibles = (est: string): string[] => {
  if (est === 'PEN') {
    return [
      'numero',
      'fecha',
      'ruc',
      'cliente',
      'factura',
      'fechaFactura',
      'reclamos',
    ];
  } else if (est === 'PRO') {
    return [
      'numero',
      'fecha',
      'ruc',
      'cliente',
      'factura',
      'fechaFactura',
      'reclamos',
      'fecha_enproceso',
    ];
  } else if (est === 'FIN') {
    return [
      'numero',
      'fecha',
      'ruc',
      'cliente',
      'factura',
      'fechaFactura',
      'reclamos',
      'fecha_finalizado',
    ];
  } else {
    return [''];
  }
};

export const columnasDetalleReclamo: QTableProps['columns'] = [
  {
    name: 'prioridad',
    required: true,
    label: 'Prioridad',
    align: 'center',
    field: (row: Filas) =>
      Math.min(...row.reclamos.map((el) => el.motivo.prioridad)) == 1
        ? 'Alta'
        : Math.min(...row.reclamos.map((el) => el.motivo.prioridad)) == 2
        ? 'Media'
        : 'Mínima',
    sortable: true,
  },
  {
    name: 'numero',
    label: 'Nro. reclamo',
    align: 'left',
    field: 'nro_reclamo',
    sortable: true,
  },
  {
    name: 'fecha',
    align: 'left',
    label: 'Fecha del reclamo',
    field: 'fecha_reclamo',
    sortable: true,
  },
  {
    name: 'cliente',
    align: 'left',
    label: 'Cliente',
    field: 'cliente',
    sortable: true,
  },
  { name: 'ruc', align: 'left', label: 'RUC', field: 'ruc' },
  {
    name: 'factura',
    label: 'Nro. factura',
    field: 'nro_factura',
    align: 'left',
  },
  {
    name: 'fechaFactura',
    label: 'Fecha factura',
    field: 'fecha_factura',
    align: 'left',
  },
  { name: 'detalle', label: 'Detalle', field: 'comentario', align: 'left' },
  { name: 'archivos', label: 'Archivos', field: 'archivos', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  {
    name: 'encargado',
    label: 'Encagado del reclamo',
    field: 'nombre_usuario',
    align: 'left',
  },
  {
    name: 'fecha_enproceso',
    label: 'Fecha del estado',
    field: 'fecha_enproceso',
    align: 'left',
  },
  {
    name: 'fecha_finalizado',
    label: 'Fecha del estado',
    field: 'fecha_finalizado',
    align: 'left',
  },
];

export const columnasRevisarReclamoMovil: QTableProps['columns'] = [
  {
    name: 'estado',
    label: 'Estado',
    align: 'left',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'numero',
    label: 'Nro. reclamo',
    align: 'left',
    field: 'nro_reclamo',
    sortable: true,
  },
  {
    name: 'fecha',
    align: 'left',
    label: 'Fecha del reclamo',
    field: 'fecha_reclamo',
    sortable: true,
  },
  {
    name: 'respuesta',
    label: 'Respuesta al reclamo',
    field: 'respuesta_finalizado',
    align: 'left',
  },
  {
    name: 'cliente',
    align: 'left',
    label: 'Cliente',
    field: 'cliente',
    sortable: true,
  },
  { name: 'ruc', align: 'left', label: 'RUC', field: 'ruc' },
  {
    name: 'factura',
    label: 'Nro. factura',
    field: 'nro_factura',
    align: 'left',
  },
  {
    name: 'fecha_finalizado',
    label: 'Fecha de respuesta al reclamo',
    field: 'fecha_finalizado',
    align: 'left',
  },
  {
    name: 'reclamos',
    label: 'Productos en reclamo',
    field: 'reclamos',
    align: 'left',
  },
];

export const columnasRevisarReclamo: QTableProps['columns'] = [
  {
    name: 'estado',
    label: 'Estado',
    align: 'left',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'numero',
    label: 'Nro. reclamo',
    align: 'left',
    field: 'nro_reclamo',
    sortable: true,
  },
  {
    name: 'fecha',
    align: 'left',
    label: 'Fecha del reclamo',
    field: 'fecha_reclamo',
    sortable: true,
  },
  {
    name: 'cliente',
    align: 'left',
    label: 'Cliente',
    field: 'cliente',
    sortable: true,
  },
  { name: 'ruc', align: 'left', label: 'RUC', field: 'ruc' },
  {
    name: 'factura',
    label: 'Nro. factura',
    field: 'nro_factura',
    align: 'left',
  },
  { name: 'detalle', label: 'Detalle', field: 'comentario', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  {
    name: 'encargado',
    label: 'Encagado del reclamo',
    field: 'nombre_usuario',
    align: 'left',
  },
  {
    name: 'fecha_enproceso',
    label: 'Fecha del estado',
    field: 'fecha_enproceso',
    align: 'left',
  },
  {
    name: 'fecha_finalizado',
    label: 'Fecha finalizado',
    field: 'fecha_finalizado',
    align: 'left',
  },
];

export const columnasEditarReclamo: QTableProps['columns'] = [
  { name: 'id', align: 'left', label: 'ID', field: 'id' },
  {
    name: 'nombre',
    align: 'left',
    label: 'Nombre',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'fecha',
    required: true,
    label: 'Fecha de vencimiento',
    align: 'center',
    field: (row: Producto) => row.otra_info[0].fecha_vencimiento,
    sortable: true,
  },
  { name: 'cantidad', align: 'center', label: 'Cantidad', field: 'cantidad' },
  {
    name: 'lote',
    required: true,
    label: 'Lote',
    align: 'center',
    field: (row: Producto) => row.otra_info[0].lote,
  },
  { name: 'reclamo', align: 'center', label: '', field: 'id' },
];
