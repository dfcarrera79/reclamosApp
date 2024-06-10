<script setup lang="ts">
import {
  Archivo,
  FilasReclamos,
  RespuestaArchivo,
} from '../../components/models';
import { computed, ref } from 'vue';
import { useAxios } from '../../services/useAxios';
import { columnasRevisarReclamoMovil } from '../../services/useColumnas';

// Data
const alert = ref(false);
const { get } = useAxios();
const fotos = ref<Archivo[]>([]);
const path = process.env.IMAGE_PATH;
const replacedPath = process.env.REPLACED_PATH;
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
  <div class="q-pa-none">
    <q-dialog v-model="alert" maximized>
      <q-card>
        <q-card-section>
          <div
            class="text-left text-h6 text-grey-8"
            style="font-family: 'Bebas Neue'"
          >
            <strong>ARCHIVOS:</strong>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-xs">
          <div v-if="fotos.length >= 1">
            <div v-for="(foto, index) in fotos" :key="index">
              <img
                class="q-ma-sm"
                :src="foto.path.replace(path as string, replacedPath as string)"
                style="max-height: 380px; max-width: 380px"
              />
              <q-separator inset />
            </div>
          </div>
          <div v-else>Ningún archivo adjunto</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cerrar"
            color="primary"
            @click="
              alert = false;
              fotos = [];
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

  <div>
    <q-table
      class="text-grey-8"
      :rows="filas"
      :columns="columnas"
      :visible-columns="columnasVisibles"
      row-key="name"
      grid
      hide-pagination
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <p class="text-primary text-h5" style="font-family: 'Bebas Neue'">
          RECLAMOS
        </p>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card bordered flat>
            <q-card-section>
              <q-list dense>
                <q-item
                  v-for="col in props.cols.filter(
                    (col: any) => col.name !== 'desc' && col.name !== 'reclamos'
                  )"
                  :key="col.name"
                >
                  <q-item-section>
                    <q-item-label>{{ col.label }}: </q-item-label>
                  </q-item-section>
                  <q-item-section v-if="col.name === 'estado'">
                    <q-item-label v-if="col.value === 'Finalizado'">
                      <q-badge rounded color="positive">
                        {{ col.value }}
                      </q-badge>
                    </q-item-label>
                    <q-item-label v-else-if="col.value === 'Pendiente'">
                      <q-badge rounded color="negative">
                        {{ col.value }}
                      </q-badge>
                    </q-item-label>
                    <q-item-label v-else>
                      <q-badge rounded color="orange">
                        {{ col.value }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section v-else>
                    <q-item-label caption> {{ col.value }} </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator />
            <q-card-section class="column flex flex-center q-pa-xs">
              <strong>Productos en reclamo</strong>
              <div
                v-for="col in props.cols.filter(
                  (col: any) => col.name == 'reclamos'
                )"
                :key="col.name"
              >
                <div v-for="reclamo in col.value" :key="reclamo.producto.id">
                  <q-separator />
                  <p>
                    {{ reclamo.producto.nombre }}
                  </p>
                  <p>
                    <strong>Motivo:</strong> {{ reclamo.motivo.nombre_motivo }}
                  </p>
                  <p>
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
                  <q-separator class="q-mt-xs" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
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
