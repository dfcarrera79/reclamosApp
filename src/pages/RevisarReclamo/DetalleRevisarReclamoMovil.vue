<script setup lang="ts">
import {
  Archivo,
  FilasReclamos,
  RespuestaArchivo,
} from '../../components/models';
import { computed, ref } from 'vue';
import { useAxios } from '../../services/useAxios';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import { columnasRevisarReclamoMovil } from '../../services/useColumnas';

// Data
const filter = ref('');
const alert = ref(false);
const { get } = useAxios();
const fotos = ref<Archivo[]>([]);
const filas = defineModel<FilasReclamos[]>('filas', { required: true });
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 20,
});

const columnasVisibles = [
  'estado',
  'numero',
  'fecha',
  'respuesta',
  'cliente',
  'factura',
  'reclamos',
];

const columnas = columnasRevisarReclamoMovil;

// Methods
const mostrarArchivos = async (archivos: [number, number, number]) => {
  for (const archivo of archivos) {
    if (archivo != 0) {
      const newQuery = `/reclamo/obtener_archivos/${archivo}`;
      const respuesta: RespuestaArchivo = await get(newQuery, {});
      if (respuesta.error === 'S') {
        console.error(respuesta.mensaje);
        return;
      }
      fotos.value.push(respuesta.objetos[0]);
    }
  }
  alert.value = true;
};

const pagesNumber = computed(() => {
  return Math.ceil(filas.value.length / pagination.value.rowsPerPage);
});
</script>

<template>
  <ArchivoDialog v-model:alert="alert" v-model:fotos="fotos" />
  <div>
    <q-table
      class="text-grey-8"
      :rows="filas"
      :columns="columnas"
      :visible-columns="columnasVisibles"
      :filter="filter"
      row-key="name"
      grid
      hide-pagination
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <p
          class="text-primary text-h5 q-pt-md"
          style="font-family: 'Bebas Neue'"
        >
          RECLAMOS
        </p>
      </template>

      <template v-slot:top-right>
        <q-input
          outlined
          input-class="text-right"
          clearable
          clear-icon="close"
          dense
          debounce="350"
          borderless
          color="primary"
          v-model="filter"
          placeholder="Buscar..."
          style="max-width: 170px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <q-card class="q-my-sm" bordered flat>
          <q-card-section>
            <span
              v-for="col in props.cols.filter(
                  (col: any) => col.name !== 'desc' && col.name !== 'reclamos'
                )"
              :key="col.name"
            >
              <div class="q-my-sm" v-if="col.name === 'estado'">
                <strong>{{ col.label }}: </strong>
                <span v-if="col.value === 'Finalizado'">
                  <q-badge rounded color="positive">
                    {{ col.value }}
                  </q-badge>
                </span>
                <span v-else-if="col.value === 'Pendiente'">
                  <q-badge rounded color="negative">
                    {{ col.value }}
                  </q-badge>
                </span>
                <span v-else>
                  <q-badge rounded color="orange">
                    {{ col.value }}
                  </q-badge>
                </span>
              </div>
              <div class="q-my-sm" v-else>
                <strong>{{ col.label }}:</strong> {{ col.value }}
              </div>
            </span>
          </q-card-section>
          <q-separator />
          <q-card-section class="column flex q-px-md">
            <div class="flex flex-center">
              <strong>Productos en reclamo</strong>
            </div>
            <div
              v-for="col in props.cols.filter(
                  (col: any) => col.name == 'reclamos'
                )"
              :key="col.name"
            >
              <div v-for="reclamo in col.value" :key="reclamo.producto.id">
                <q-separator />
                <p class="q-pt-md">
                  {{ reclamo.producto.nombre }}
                </p>
                <p class="q-py-xs q-mb-none">
                  <strong>Motivo:</strong> {{ reclamo.motivo.nombre_motivo }}
                </p>
                <p class="q-py-xs q-mb-none">
                  <strong>Detalle: </strong>
                  <span v-html="reclamo.comentario"></span>
                </p>
                <p
                  class="text-left q-py-xs q-mb-none"
                  style="width: 310px"
                  v-if="reclamo.archivos.every((item: number) => item === 0)"
                >
                  <strong>Archivos:</strong> Ningún archivo adjunto
                </p>
                <q-btn
                  v-if="!reclamo.archivos.every((item: number) => item === 0)"
                  size="11px"
                  outline
                  color="primary"
                  @click="mostrarArchivos(reclamo.archivos)"
                  >Archivos</q-btn
                >
                <q-separator class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </q-table>
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-if="pagesNumber > 1"
        size="12px"
        v-model="pagination.page"
        :max="pagesNumber"
        direction-links
        boundary-links
        icon-first="skip_previous"
        icon-last="skip_next"
        icon-prev="fast_rewind"
        icon-next="fast_forward"
        text-color="grey"
        color="primary"
        unelevated
        flat
        active-design="flat"
        active-color="white"
        active-text-color="primary"
      />
    </div>
  </div>
</template>

<style scoped>
@import '../../css/detalle.reclamo.scss';
</style>
