import moment from 'moment';
import { Detalle, Filas, Objetos } from '../components/models';

export const mergeObjectsByNroReclamo = (dataArray: Filas[]) => {
  const mergedObjects: { [key: number]: Filas } = {};

  dataArray.forEach((obj) => {
    const nroReclamo = obj.nro_reclamo;

    if (!mergedObjects[nroReclamo]) {
      mergedObjects[nroReclamo] = { ...obj, reclamos: [] };
    }

    mergedObjects[nroReclamo].reclamos.push(...obj.reclamos);
  });

  return Object.values(mergedObjects);
};

export const procesarObjetos = (objetos: Objetos[]) => {
  const processedFilas = objetos.map((objeto) => ({
    nro_reclamo: objeto.id_reclamo,
    fecha_reclamo: moment(objeto.fecha_reclamo).format('DD-MM-YYYY'),
    fecha_enproceso: moment(objeto.fecha_enproceso).format('DD-MM-YYYY'),
    fecha_finalizado: moment(objeto.fecha_finalizado).format('DD-MM-YYYY'),
    ruc: objeto.ruc_reclamante,
    cliente: objeto.nombre_reclamante,
    email: objeto.email,
    nro_factura: objeto.no_factura,
    fecha_factura: moment(objeto.fecha_factura).format('DD-MM-YYYY'),
    nombre_usuario: objeto.nombre_usuario,
    respuesta_enproceso: objeto.respuesta_enproceso,
    respuesta_finalizado: objeto.respuesta_finalizado,
    reclamos: objeto.reclamos,
    retraso: objeto.retraso,
    comentario: objeto.comentario,
  }));

  return mergeObjectsByNroReclamo(processedFilas);
};

export const funcionIr = (code: number) => {
  const baseUrl = 'http://192.168.1.50:3006/#/login/';

  switch (code) {
    case 1:
      window.open(`${baseUrl}1`, '_blank');
      break;
    case 2:
      window.open(`${baseUrl}2`, '_blank');
      break;
    case 3:
      window.open(`${baseUrl}3`, '_blank');
      break;
    case 4:
      window.open(`${baseUrl}4`, '_blank');
      break;
    default:
      break;
  }
};

export const funcionIrReclamos = () => {
  const baseUrl = 'http://192.168.1.50:3006/#/loginReclamos';
  window.open(baseUrl, '_blank');
};

export const funcionIrDocumentos = () => {
  const baseUrl = 'http://192.168.1.50:3006/#/loginDocumentos';
  window.open(baseUrl, '_blank');
};

export const obtenerMotivosConPrioridadMasBaja = (
  reclamos: Detalle[]
): string => {
  if (!reclamos || reclamos.length === 0) {
    return '';
  }

  // Encontrar la prioridad más baja
  const prioridadMinima = reclamos.reduce<number>((minPrioridad, reclamo) => {
    return Math.min(minPrioridad, reclamo.motivo.prioridad);
  }, Infinity);

  // Usar un Set para almacenar motivos únicos con la prioridad más baja
  const motivosUnicos = new Set(
    reclamos
      .filter((reclamo) => reclamo.motivo.prioridad === prioridadMinima)
      .map((reclamo) => reclamo.motivo.nombre_motivo)
  );

  // Unir los motivos únicos en una cadena separada por comas
  return Array.from(motivosUnicos).join(', ');
};
