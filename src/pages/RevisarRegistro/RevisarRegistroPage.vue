<script setup lang="ts">
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import { useQuasar, QTableProps } from 'quasar';
import { ref } from 'vue';
import { useMensajes } from '../../services/useMensajes';
import ProductosComponent from './ProductosComponent.vue';
import VerificarVersion from '../VerificarVersionPage.vue';
import ProductosComponentMovil from './ProductosComponentMovil.vue';
import {
  Item,
  Producto,
} from '../../components/models';

// Datos
const appStore = useAppStore();
const { get } = useAxios();
const $q = useQuasar();
const factura = ref('');
const nuevaFactura = ref('');
const filasOriginales = ref<Producto[]>([]);
const filas = ref(filasOriginales);
const ruc = ref(
  appStore.appCodigo === appStore.APP_USER ? appStore.usuario.ruc_cliente : ''
);
const { formatearFactura, mostrarError } = useMensajes();
const columna: QTableProps['columns'] = [
  { name: 'id', align: 'left', label: 'ID', field: 'id' },
  {
    name: 'nombre',
    align: 'left',
    label: '',
    field: 'nombre',
    sortable: true,
  },
];
const columnas: QTableProps['columns'] = [
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
  { name: 'archivos', align: 'center', label: 'Archivos', field: 'id' },
];

// Methods
const procesarFormulario = async () => {
  if (ruc.value.trim().length === 0 || factura.value.trim().length === 0) {
    mostrarError(
      'Es necesario llenar los campos Ruc y número de factura',
      'center'
    );
    return;
  }

  nuevaFactura.value = formatearFactura(factura.value);
  const formulario = {
    ruc_reclamante: ruc.value,
    no_factura: factura.value,
  };

  const productos = await get('/reclamo/obtener_productos', formulario);
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
    }
    return {
      id: item.art_codigo,
      nombre: item.art_nomlar,
      cantidad: item.dt_cant,
      otra_info: JSON.parse(otra_info),
    };
  });
};
</script>

<template>
  <q-page padding>
    <VerificarVersion />
    <h4
      class="text-grey-8"
      style="font-family: 'Bebas Neue'"
      v-if="!($q.screen.lt.md || $q.screen.lt.sm)"
    >
      CONSULTAR ANÁLISIS DE LOTE - REGISTRO SANITARIO
    </h4>
    <h4
      class="text-grey-8 q-ma-xs"
      style="font-family: 'Bebas Neue'"
      v-if="$q.screen.lt.md"
    >
      CONSULTAR REGISTROS
    </h4>

    <q-form
      class="row"
      style="max-width: 800px"
      enctype="multipart/form-data"
      @submit.prevent="procesarFormulario"
    >
      <div
        class="col-12 text-grey-8"
        v-if="!($q.screen.lt.md || $q.screen.lt.sm)"
      ></div>
      <div v-if="!($q.screen.lt.md || $q.screen.lt.sm)" class="row">
        <q-input
          class="q-ma-sm"
          debounce="350"
          v-model="ruc"
          type="text"
          label="RUC"
          :disable="appStore.appCodigo === appStore.APP_USER"
          outlined
          dense
          options-dense
          clearable
          clear-icon="close"
        />
        <q-input
          class="q-ma-sm"
          debounce="350"
          label="Número de factura"
          v-model="factura"
          hint="Ej: 001-003-421"
          outlined
          clearable
          clear-icon="close"
          dense
          options-dense
        />
        <q-btn
          class="q-ma-sm"
          outline
          color="primary"
          style="height: 40px; width: 183px"
          type="submit"
        >
          <div class="row items-center no-wrap q-pa-none">
            <div class="text-center text-caption">
              <strong>Consultar productos</strong>
            </div>
          </div>
        </q-btn>
      </div>
      <div v-if="$q.screen.lt.md">
        <div class="row no-wrap">
          <q-input
            class="q-ma-sm"
            debounce="350"
            v-model="ruc"
            type="text"
            label="RUC"
            :disable="appStore.appCodigo === appStore.APP_CLIENTE"
            outlined
            dense
            options-dense
            clearable
            clear-icon="close"
          />
          <q-input
            class="q-ma-sm"
            debounce="350"
            label="Número de factura"
            v-model="factura"
            hint="Ej: 001-003-421"
            outlined
            clearable
            clear-icon="close"
            dense
            options-dense
          />
          <q-btn
            class="q-ma-sm"
            round
            color="primary"
            style="height: 40px; width: 40px"
            type="submit"
            icon="search"
          />
        </div>
      </div>
    </q-form>

    <div
      class="fit row no-wrap justify-start items-start content-start"
      v-if="filas.length === 0"
    >
      <div class="column no-wrap items-center" style="margin-top: 20px">
        <p class="text-secondary text-h5" style="font-family: 'Bebas Neue'">
          COMENCEMOS
        </p>
        <p class="text-secondary text-body2">
          <ol>
            <strong>
              <li v-if="!($q.screen.lt.md || $q.screen.lt.sm)">
                Ingrese el número de factura en el campo correspondiente y de click en el botón CONSULTAR PRODUCTOS.
              </li>
              <li v-if="$q.screen.lt.md">
                Ingrese el número de factura en el campo correspondiente y de click en el botón <q-icon name="search" />.
              </li>
              <li>Seleccione un producto de la lista que aparece para consultar y descargar el análisis de lote y el registro sanitario específico para ese producto.</li>
            </strong>
          </ol>
        </p>
      </div>
    </div>
    <div
      class="fit row no-wrap justify-start items-start content-start"
      v-if="!($q.screen.lt.md || $q.screen.lt.sm)"
    >
      <ProductosComponent
        v-if="filas.length > 0"
        :filas="filas"
        :columnas="columnas"
      />
    </div>
    <div class="fit column wrap content-center scroll"  v-if="$q.screen.lt.md" style="max-height: 80vh">
      <ProductosComponentMovil
        v-if="$q.screen.lt.md"
        :filas="filas"
        :columna="columna"
      />
    </div>
  </q-page>
</template>




