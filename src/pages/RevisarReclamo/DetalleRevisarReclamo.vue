<script setup lang="ts">
import {
  Archivo,
  RespuestaArchivo,
  FilasReclamos,
} from '../../components/models';
import { computed, ref } from 'vue';
import { useAxios } from '../../services/useAxios';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import { columnasRevisarReclamo } from '../../services/useColumnas';

// Data
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

const visibleColumns = [
  'estado',
  'numero',
  'fecha',
  'ruc',
  'cliente',
  'factura',
];

const columnas = columnasRevisarReclamo;

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

// Computed
const pagesNumber = computed(() => {
  return Math.ceil(filas.value.length / pagination.value.rowsPerPage);
});
</script>

<template>
  <ArchivoDialog v-model:alert="alert" v-model:fotos="fotos" />
  <div>
    <q-table
      v-if="filas.length > 0"
      class="text-h6 text-grey-8 justify-center"
      flat
      bordered
      no-data-label="Datos no disponibles"
      hide-no-data
      :rows="filas"
      :columns="columnas"
      row-key="name"
      :visible-columns="visibleColumns"
      v-model:pagination="pagination"
      hide-pagination
    >
      <template v-slot:top-left>
        <p class="text-primary text-h5" style="font-family: 'Bebas Neue'">
          RECLAMOS
        </p>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            style="text-align: center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td
            style="text-align: center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <template v-if="col.name === 'estado'">
              <template v-if="col.value === 'Finalizado'">
                <q-badge rounded color="positive"> {{ col.value }} </q-badge>
              </template>
              <template v-else-if="col.value === 'Pendiente'">
                <q-badge rounded color="negative"> {{ col.value }} </q-badge>
              </template>
              <template v-else>
                <q-badge rounded color="orange"> {{ col.value }} </q-badge>
              </template>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left" v-show="props.row.estado !== 'Pendiente'">
              <strong>Encargado del reclamo:</strong>
              {{ props.row.nombre_usuario }}
            </div>
            <div class="text-left" v-show="props.row.estado !== 'Pendiente'">
              <strong>Respuesta al reclamo:</strong>
              {{ props.row.respuesta_finalizado }}
            </div>
            <div class="row wrap">
              <div
                class="q-ma-sm"
                v-for="reclamo in props.row.reclamos"
                :key="reclamo.producto.id"
              >
                <q-card bordered flat class="my-card">
                  <q-card-section>
                    <p class="text-h7 wrap">{{ reclamo.producto.nombre }}</p>
                  </q-card-section>

                  <q-separator inset />

                  <q-card-section>
                    <p class="text-left" style="width: 310px">
                      <strong>Motivo:</strong>
                      {{ reclamo.motivo.nombre_motivo }}
                    </p>
                    <p class="text-left" style="width: 310px">
                      <strong>Detalle: </strong>
                      <span v-html="reclamo.comentario"></span>
                    </p>
                    <p
                      class="text-left"
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
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-td>
        </q-tr>
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
