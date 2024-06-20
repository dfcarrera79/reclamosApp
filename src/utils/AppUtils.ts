import { Detalle } from '../components/models';

export function capitalizeWords(sentence: string): string {
  return sentence
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function deducirMensajeError(o_error) {
  let mensaje = '';
  let hubo = false;
  if (o_error.message) {
    mensaje =
      o_error.message === 'Network Error'
        ? 'La aplicación no logra conectarse con el servidor, revise si su dispositivo esta con internet o si el servidor esta disponible.'
        : o_error.message;
    hubo = true;
  }
  if (o_error.config) {
    if (o_error.config.url) {
      mensaje =
        mensaje +
        "<br><span style='color:red'>" +
        o_error.config.url +
        '</span>';
      hubo = true;
    }
  }
  if (hubo === false) {
    mensaje = JSON.stringify(o_error);
  }
  return mensaje;
}

export const obtenerArchivos = (detalles: Detalle[]): number[] => {
  const archivos: number[] = [];

  if (detalles.length > 0) {
    const arch = detalles.map((el) => el.archivos);
    for (let i = 0; i < arch.length; i++) {
      for (let j = 0; j < arch[i].length; j++) {
        if (arch[i][j] != 0) {
          archivos.push(arch[i][j]);
        }
      }
    }
  }

  return archivos;
};
