<script setup lang="ts">
import { QTableProps } from 'quasar';
import { ref, onMounted, watch } from 'vue';
import { useAxios } from '../../services/useAxios';
import VerificarVersion from '../../components/VerificarVersion.vue';
import { ProductoLaboratorio, ResponseData } from '../../components/models';
import ProductosComponent from './ProductosComponent.vue';
import ProductosComponentMovil from './ProductosComponentMovil.vue';

// Data
const { get } = useAxios();
const stringOptions = ref<string[]>([]);

// Methods
onMounted(async () => {
  const respuesta: ResponseData = await get(
    '/archivos/obtener_laboratorios',
    {}
  );
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return;
  }
  stringOptions.value = respuesta.objetos.map((el) => el.nombre_laboratorio);
});

const options = ref<string[]>([]);
const model = ref(null);

const filas = ref<ProductoLaboratorio[]>([]);
const columna: QTableProps['columns'] = [
  { name: 'id', align: 'left', label: 'ARCHIVOS', field: 'art_codigo' },
  {
    name: 'nombre',
    align: 'left',
    label: 'Artículo',
    field: 'nombre_articulo',
    sortable: true,
  },
];
const columnas: QTableProps['columns'] = [
  { name: 'id', align: 'left', label: 'ARCHIVOS', field: 'art_codigo' },
  {
    name: 'nombre',
    align: 'left',
    label: 'Artículo',
    field: 'nombre_articulo',
    sortable: true,
  },
  {
    name: 'presentacion',
    align: 'left',
    label: 'Presentación',
    field: 'presentacion',
    sortable: true,
  },
];

const filterFn = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      options.value = stringOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options.value = stringOptions.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1
    );
  });
};

// Watcher for model variable
watch(model, async (newValue) => {
  const response = await get('/archivos/obtener_productos_laboratorio', {
    laboratorio: newValue,
  });
  filas.value = response.objetos;
});
</script>

<template>
  <q-page padding>
    <VerificarVersion />
    <h4
      class="text-grey-8"
      style="font-family: 'Bebas Neue'"
      :class="{ 'q-ma-xs': $q.screen.lt.md }"
    >
      INGRESAR REGISTROS
    </h4>

    <div class="q-pa-md">
      <div class="q-gutter-md">
        <q-select
          filled
          v-model="model"
          clearable
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          label="Laboratorios"
          :options="options"
          @filter="filterFn"
          style="width: 250px"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay resultados
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <div
      v-if="filas.length === 0"
      class="column no-wrap justify-start"
      style="margin-top: 20px"
    >
      <p class="text-secondary text-body2">
        <strong
          >Seleccione el laboratorio de la lista desplegable para filtrar los
          productos por laboratorio.</strong
        >
      </p>
      <p class="text-secondary text-body2">
        <strong
          >Si no encuentra el laboratorio que busca de la lista desplegable,
          puede ingresar el nombre del laboratorio.</strong
        >
      </p>
    </div>
    <div class="fit row no-wrap justify-start items-start content-start gt-xs">
      <ProductosComponent
        v-if="filas.length > 0"
        :filas="filas"
        :columnas="columnas"
      />
    </div>
    <div
      class="fit column wrap content-center scroll xs"
      style="max-height: 80vh"
    >
      <ProductosComponentMovil :filas="filas" :columna="columna" />
    </div>
  </q-page>
</template>
