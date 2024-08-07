import moment from 'moment';
import { Filas, Objetos } from '../components/models';

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
  }));

  return mergeObjectsByNroReclamo(processedFilas);
};
