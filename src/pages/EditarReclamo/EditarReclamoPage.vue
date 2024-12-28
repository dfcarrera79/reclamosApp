<script setup lang="ts">
import {
  Arch,
  Item,
  Motivo,
  Detalle,
  Reclamos,
  Producto,
  Respuesta,
  AuditoriaObject,
} from 'components/models';
import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';
import FormComponent from './FormComponent.vue';
import CardProductos from './CardProductos.vue';
import { useAxios } from '../../services/useAxios';
import { obtenerArchivos } from '../../utils/AppUtils';
import { useAppStore } from '../../stores/useAppStore';
import { useMensajes } from '../../services/useMensajes';
import CardProductosMovil from './CardProductosMovil.vue';
import VerificarVersion from '../../components/VerificarVersion.vue';
import ProductosComponent from 'src/pages/EditarReclamo/ProductosComponent.vue';
import ProductosComponentMovil from 'src/pages/EditarReclamo/ProductosComponentMovil.vue';

// Datos
const appStore = useAppStore();
const { get, post, deletes, put } = useAxios();
const { formatearFactura, mostrarError } = useMensajes();
const motivos = ref<Motivo[]>([]);
const $q = useQuasar();
const ruc = ref(
  appStore.appCodigo === appStore.APP_CLIENTE
    ? appStore.usuario.ruc_cliente
    : ''
);
const factura = ref('');
const nuevaFactura = ref('');
const auditoria = ref<AuditoriaObject[]>([]);
const filasOriginales = ref<Producto[]>([]);
let originalRows: Producto[];
const filas = ref(filasOriginales);
const archivos = ref<number[]>([]);
const arch = ref<Arch>({ id_detalle: 0, id_archivo: 0 });
const idDetalle = ref(0);
const reclamos = ref<Reclamos>({
  tipo: 0,
  no_factura: '',
  ruc_reclamante: '',
  reclamos: '',
});
const detalles = ref<Detalle[]>([]);

// Methods
const verificarProductoEnReclamo = async (rowId: number) => {
  try {
    const respuesta = await get('/reclamo/verificar_reclamo_existente', {
      idProducto: rowId,
      nroFactura: factura.value,
    });

    if (respuesta.error === 'N') {
      return respuesta.objetos[0];
    } else {
      return { id_reclamo: 0 };
    }
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
  }
};

onMounted(async () => {
  const respuesta = await get('/motivo/obtener_motivos', {});
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return;
  }
  motivos.value = respuesta.objetos;
});

const procesarFormulario = async () => {
  // Trim leading and trailing spaces
  const trimmedRuc = ruc.value.trim();
  const trimmedFactura = factura.value.trim();

  // Verificar que trimmedRuc y trimmedFactura no estén vacíos
  if (trimmedRuc.length === 0) {
    mostrarError('Es necesario llenar el campo RUC.', 'center');
    return;
  }

  if (trimmedFactura.length === 0) {
    mostrarError('Es necesario llenar el campo número de factura.', 'center');
    return;
  }

  if (detalles.value.length !== 0) {
    mostrarError(
      'No puede consultar productos en otra factura mientras tenga productos en proceso de reclamo. Debe enviar o cancelar el reclamo para continuar.',
      'center'
    );
    return;
  }

  // Verificar que el trimmedRuc tenga una longitud de 10 o de 13
  if (trimmedRuc.length !== 10 && trimmedRuc.length !== 13) {
    mostrarError(
      'Revise el número de RUC. Debe tener 10 o 13 dígitos.',
      'center'
    );
    return;
  }

  nuevaFactura.value = formatearFactura(trimmedFactura);
  const formulario = {
    ruc_reclamante: trimmedRuc,
    no_factura: nuevaFactura.value,
  };

  try {
    const productos = await get('/reclamo/obtener_productos/', formulario);
    const audi = await get('/reclamo/obtener_auditoria', formulario);

    auditoria.value = audi.objetos;

    if (!productos || !productos.objetos) {
      throw new Error('La respuesta del servidor no contiene productos.');
    }

    filasOriginales.value = productos.objetos.map((item: Item) => {
      let otra_info = item.conteo_pedido ? item.conteo_pedido : '';
      if (otra_info.trim().length === 0) {
        otra_info = JSON.stringify([
          {
            cantidad: item.dt_cant,
            cantidad_x_uni: 13,
            fecha_corta: false,
            fecha_vencimiento: item.dt_fecha,
            lote: item.dt_lote,
            r_sanitario: '',
          },
        ]);
      } else {
        // Si ya existe otra_info, asegúrate de agregar o reemplazar el subtotal al parsearlo
        interface Otra_Info {
          cantidad: number;
          subtotal: number;
          cantidad_x_uni: number;
          fecha_corta: boolean;
          fecha_vencimiento: string;
          lote: string;
          r_sanitario: string;
        }

        const parsedInfo = JSON.parse(otra_info);
        parsedInfo.forEach((info: Otra_Info) => {
          info.subtotal = item.dt_monto;
        });
        otra_info = JSON.stringify(parsedInfo);
      }
      return {
        id: item.art_codigo,
        nombre: item.art_nomlar,
        cantidad: item.dt_cant,
        otra_info: JSON.parse(otra_info),
      };
    });
    originalRows = filasOriginales.value;
  } catch (error) {
    mostrarError(
      'Hubo un error al obtener los productos. Por favor, revise el RUC y el número de factura e inténtelo de nuevo.',
      'center'
    );
  }
};

const reset = async () => {
  const reclamosIDs = detalles.value.map((el) => el.producto.id);

  if (reclamosIDs.length > 0) {
    for (let reclamoID of reclamosIDs) {
      insertarFila(reclamoID);
    }
  }

  detalles.value = [];
  await deletes('/reclamo/eliminar_archivos', {}, {});
};

const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

const grabarReclamo = async (tipoReclamo: number) => {
  reclamos.value.tipo = tipoReclamo;
  reclamos.value.no_factura = factura.value.trim();
  reclamos.value.reclamos = JSON.stringify(detalles.value);
  reclamos.value.ruc_reclamante = ruc.value.trim();

  const respuesta = await post(
    '/reclamo/crear_detalle',
    {},
    JSON.parse(JSON.stringify(reclamos.value))
  );
  deducirMensaje(respuesta);
  idDetalle.value = respuesta.objetos;

  arch.value.id_detalle = idDetalle.value;

  for (let i = 0; i < archivos.value.length; i++) {
    arch.value.id_archivo = archivos.value[i];
    await put(
      '/reclamo/actualizar_archivos',
      {},
      JSON.parse(JSON.stringify(arch.value))
    );
  }

  await deletes('/reclamo/eliminar_archivos', {}, {});
  archivos.value = [];
};

const procesarEnvio = () => {
  archivos.value = obtenerArchivos(detalles.value);
  grabarReclamo(appStore.appCodigo);
  const ids = detalles.value.map((el) => el.producto.id);

  for (const id of ids) {
    detalles.value = detalles.value.filter((el) => el.producto.id !== id);
  }

  reclamos.value = {
    tipo: 0,
    no_factura: '',
    ruc_reclamante: '',
    reclamos: '',
  };

  filasOriginales.value = [];
};

const agregarReclamo = async (event: Producto) => {
  const existeProducto = detalles.value.some(
    (detalle) => detalle.producto.id === 10000
  );

  if (existeProducto) {
    mostrarError('Ya se ha ingresado un reclamo por auditoria', 'center');
    return;
  }

  let producto = await verificarProductoEnReclamo(event.id);

  if (producto.id_reclamo != 0) {
    mostrarError(
      `Ya existe un reclamo para este producto en el ticket de reclamo  ${producto.id_reclamo}. Por favor, seleccione otro producto.`,
      'center'
    );
    return;
  } else {
    detalles.value.push({
      producto: event,
      motivo: {
        id_motivo: 0,
        nombre_motivo: '',
        prioridad: 3,
      },
      comentario: '',
      usuario: appStore.usuario.razon_social,
      archivos: [0, 0, 0],
    });
  }
};

const insertarFila = (event: number) => {
  const index = originalRows.findIndex((x) => x.id === event);
  const row = originalRows[index];
  const newRow = { ...row };
  filas.value = [
    ...filas.value.slice(0, index),
    newRow,
    ...filas.value.slice(index),
  ];
};

const quitarFila = async (event: Producto) => {
  let producto = await verificarProductoEnReclamo(event.id);

  if (producto.id_reclamo == 0) {
    const index = filas.value.findIndex((x) => x.id === event.id);
    if (index > -1) {
      // only splice array when item is found
      filas.value = [
        ...filas.value.slice(0, index),
        ...filas.value.slice(index + 1),
      ];
    }
  }
};

const quitarReclamo = (event: number) => {
  detalles.value = detalles.value.filter((el) => el.producto.id !== event);
};

const renovarComentario = (event: Detalle) => {
  detalles.value = detalles.value.map((detalle) => {
    if (detalle.producto.id === event.producto.id) {
      detalle = event;
    }
    return detalle;
  });
};

const renovarMotivo = (event: Detalle) => {
  detalles.value = detalles.value.map((detalle) => {
    if (detalle.producto.id === event.producto.id) {
      detalle = event;
    }
    return detalle;
  });
};

const renovarArchivo1 = (event: Detalle) => {
  detalles.value = detalles.value.map((detalle) => {
    if (detalle.producto.id === event.producto.id) {
      detalle.archivos[0] = event.archivos[0];
    }
    return detalle;
  });
};

const renovarArchivo2 = (event: Detalle) => {
  detalles.value = detalles.value.map((detalle) => {
    if (detalle.producto.id === event.producto.id) {
      detalle.archivos[1] = event.archivos[1];
    }
    return detalle;
  });
};

const renovarArchivo3 = (event: Detalle) => {
  detalles.value = detalles.value.map((detalle) => {
    if (detalle.producto.id === event.producto.id) {
      detalle.archivos[2] = event.archivos[2];
    }
    return detalle;
  });
};
</script>

<template>
  <q-page padding :class="{ 'q-pt-none': $q.screen.lt.md }">
    <VerificarVersion />
    <h4
      class="text-grey-8 q-my-md q-ml-none q-mr-md"
      style="font-family: 'Bebas Neue'"
      :class="{ 'q-ma-xs': $q.screen.lt.md }"
    >
      INGRESAR RECLAMO
    </h4>

    {{ detalles }}

    <FormComponent
      v-model:ruc="ruc"
      v-model:factura="factura"
      @procesarFormulario="procesarFormulario"
    />

    <div
      class="fit row no-wrap justify-start items-start content-start"
      v-if="filas.length === 0 && detalles.length === 0"
    >
      <div class="column no-wrap items-center" style="margin-top: 20px">
        <p class="text-secondary text-h5" style="font-family: 'Bebas Neue'">
          COMENCEMOS
        </p>
        <p class="text-secondary text-body2">
          <strong
            >Ingrese el ruc y el número de factura para consultar los productos
          </strong>
        </p>
      </div>
    </div>

    <div class="fit row wrap justify-start" style="max-height: 800px">
      <div class="q-pa-xs">
        <div class="fit row no-wrap justify-evenly gt-xs">
          <ProductosComponent
            v-if="filas.length > 0"
            v-model:filas="filas"
            v-model:auditoria="auditoria"
            v-model:ruc="ruc"
            v-model:factura="factura"
            @agregarReclamo="agregarReclamo($event)"
            @quitarFila="quitarFila($event)"
          />

          <CardProductos
            v-model:detalles="detalles"
            @procesarEnvio="procesarEnvio"
            @reset="reset"
            @insertarFila="insertarFila"
            @quitarReclamo="quitarReclamo"
            @renovarComentario="renovarComentario"
            @renovarMotivo="renovarMotivo"
            @renovarArchivo1="renovarArchivo1"
            @renovarArchivo2="renovarArchivo2"
            @renovarArchivo3="renovarArchivo3"
          />
        </div>
        <div class="fit column wrap content-center xs">
          <ProductosComponentMovil
            class="xs"
            :filas="filas"
            v-model:auditoria="auditoria"
            v-model:ruc="ruc"
            v-model:factura="factura"
            @agregarReclamo="agregarReclamo($event)"
            @quitarFila="quitarFila($event)"
          />

          <CardProductosMovil
            v-model:detalles="detalles"
            @procesarEnvio="procesarEnvio"
            @reset="reset"
            @insertarFila="insertarFila"
            @quitarReclamo="quitarReclamo"
            @renovarComentario="renovarComentario"
            @renovarMotivo="renovarMotivo"
            @renovarArchivo1="renovarArchivo1"
            @renovarArchivo2="renovarArchivo2"
            @renovarArchivo3="renovarArchivo3"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
