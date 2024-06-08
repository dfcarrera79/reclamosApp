import { Dialog, Notify } from 'quasar';

export function formatearFactura(numero: string): string {
  const partes = numero.split('-').map((part) => part.replace(/^0+/, '')); // Eliminar ceros a la izquierda
  const primeraParte = partes[0].padStart(3, '0'); // Rellenar con ceros a la izquierda si es necesario
  const segundaParte = partes[1].padStart(3, '0'); // Rellenar con ceros a la izquierda si es necesario
  const terceraParte = partes[2].replace(/^0+/, ''); // Eliminar ceros a la izquierda
  return `${primeraParte}-${segundaParte}-${terceraParte}`;
}

export function useMensajes() {
  const mostrarMensaje = (titulo: string, mensaje: string) =>
    Dialog.create({
      title: titulo,
      message: mensaje,
      html: true,
    });

  const mostrarConfirmacion = (
    mensaje: string,
    posicion:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
      | undefined
  ) => {
    if (mensaje.trim().length === 0) {
      return;
    }
    Notify.create({
      message: mensaje,
      color: 'grey-8',
      multiLine: true,
      position: posicion === undefined ? 'center' : posicion,
      icon: 'info',
      html: true,
      actions: [{ label: 'Cerrar', color: 'white', handler: () => undefined }],
    });
  };

  const mostrarError = (
    mensaje: string,
    posicion:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
      | undefined
  ) => {
    if (mensaje.trim().length === 0) {
      return;
    }
    Notify.create({
      message: mensaje,
      color: 'red-4',
      textColor: 'white',
      multiLine: true,
      position: posicion === undefined ? 'center' : posicion,
      icon: 'error',
      html: true,
      actions: [{ label: 'Cerrar', color: 'white', handler: () => undefined }],
    });
  };

  return {
    formatearFactura,
    mostrarMensaje,
    mostrarConfirmacion,
    mostrarError,
  };
}
