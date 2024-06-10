<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DialogoEstado from './DialogoEstado.vue';
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import { procesarObjetos } from '../../services/useUtils';
import { useBodegaStore } from '../../stores/useBodegaStore';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import {
  columnasVisibles,
  columnasDetalleReclamo,
} from '../../services/useColumnas';
import {
  Archivo,
  Filas,
  RespuestaArchivo,
  RespuestaBodega,
  Objetos,
} from '../../components/models';

/* Defined props */
const props = defineProps<{
  estado: string;
  query: string;
}>();

// Data
const page = ref(1);
const alert = ref(false);
const reclamos = ref([]);
const seleccion = ref('');
const { get } = useAxios();
const appStore = useAppStore();
const bodegaStore = useBodegaStore();
const filas = ref<Filas[]>([]);
const fotos = ref<Archivo[]>([]);
const newFilas = ref<Filas[]>([]);
const visibleColumns = ref<string[]>([]);

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: page.value,
  rowsPerPage: 50,
  rowsNumber: appStore.numFilas,
});
const columnas = columnasDetalleReclamo;

// Methods
const handleButton = (mail: string, id: number) => {
  appStore.dialogo.email = mail;
  appStore.dialogo.id = id;
};

watch(page, () => {
  whichQuery(page.value, pagination.value.rowsPerPage);
});

watch(bodegaStore, async () => {
  if (bodegaStore.actualizarFilas === true) {
    newFilas.value = [];
    await whichQuery(page.value, pagination.value.rowsPerPage);
    bodegaStore.actualizarFilas = false;
  }
});

const whichQuery = async (pagina: number, rowsNumber: number) => {
  const respuesta: RespuestaBodega = await get(props.query, {
    numeroDePagina: pagina,
    registrosPorPagina: rowsNumber, // 0 means all rows
  });
  const objetos: Objetos[] = respuesta.objetos;
  if (respuesta.error === 'S') {
    console.error('Error', respuesta.mensaje);
    return '';
  }
  filas.value = [];
  reclamos.value = [];
  newFilas.value = [];
  if (respuesta.error === 'N') {
    if (objetos.length >= 1) {
      newFilas.value = procesarObjetos(objetos);
    } else {
      return '';
    }
  }
};

whichQuery(1, pagination.value.rowsPerPage);

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
visibleColumns.value = columnasVisibles(props.estado);

// Computed
const filtro = computed(() => {
  if (props.estado === 'PEN') {
    return [{ label: 'En proceso', value: 'PRO' }];
  } else if (props.estado === 'PRO') {
    return [{ label: 'Finalizado', value: 'FIN' }];
  } else {
    return [];
  }
});

const estadosFiltrados = ref(filtro);

const pagesNumber = computed(() => {
  return Math.ceil(appStore.numFilas / pagination.value.rowsPerPage);
});
</script>

<template>
  <ArchivoDialog v-model:alert="alert" v-model:fotos="fotos" />

  <DialogoEstado />

  <div>
    <q-table
      flat
      bordered
      class="my-sticky-header-table text-h6 text-grey-8"
      :rows="newFilas"
      :columns="columnas"
      row-key="nro_reclamo"
      hide-bottom
      v-model:pagination="pagination"
      hide-pagination
      :visible-columns="visibleColumns"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            style="text-align: center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label.toUpperCase() }}
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
              @click="
                props.expand = !props.expand;
                handleButton(props.row.email, props.row.nro_reclamo);
              "
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td
            style="text-align: center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <template v-if="col.name === 'prioridad'">
              <template v-if="col.value == 'Alta'">
                <q-badge rounded color="negative"> {{ col.value }} </q-badge>
              </template>
              <template v-else-if="col.value == 'Media'">
                <q-badge rounded color="warning"> {{ col.value }} </q-badge>
              </template>
              <template v-else>
                <q-badge rounded color="grey-5"> {{ col.value }} </q-badge>
              </template>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <q-select
              v-show="estado !== 'FIN'"
              outlined
              dense
              options-dense
              v-model="seleccion"
              :options="estadosFiltrados"
              label="Cambiar estado"
              emit-value
              map-options
              style="max-width: 250px"
            >
              <template v-slot:option="{ itemProps, opt, toggleOption }">
                <q-item v-bind="itemProps">
                  <q-item-section>
                    <q-item-label> {{ opt.label }} </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle
                      :model-value="appStore.select"
                      checked-icon="check"
                      @update:model-value="
                        toggleOption(opt),
                          opt.value === 'FIN' || opt.value === 'PRO'
                            ? (appStore.confirmarFinalizado = true)
                            : (appStore.confirmarFinalizado = false),
                          (appStore.dialogo.estado = opt.value)
                      "
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="text-left">
              <strong>Usuario(vendedor): </strong>
              {{ props.row.reclamos[0]['usuario'] }}
            </div>
            <div class="text-left" v-show="estado !== 'PEN'">
              <strong>Encargado del reclamo: </strong>
              {{ props.row.nombre_usuario }}
            </div>
            <div class="text-left" v-show="estado !== 'PEN'">
              <strong>Respuesta al reclamo: </strong>
              <span v-html="props.row.respuesta_finalizado"></span>
            </div>

            <div class="row wrap">
              <div
                class="q-ma-sm"
                v-for="(reclamo, index) in props.row.reclamos"
                :key="index"
              >
                <q-card bordered flat class="bg-grey-1 my-card">
                  <q-card-section>
                    <p class="text-h7">{{ reclamo.producto.nombre }}</p>
                  </q-card-section>

                  <q-separator inset />

                  <q-card-section>
                    <p class="text-left">
                      <strong>Motivo:</strong>
                      {{ reclamo.motivo.nombre_motivo }}
                    </p>
                    <p class="text-left">
                      <strong>Detalle: </strong>
                      <span v-html="reclamo.comentario"></span>
                    </p>
                    <p
                      class="text-left"
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
        v-model="page"
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

<style scoped lang="scss">
@import '../../css/sticky.header.table.scss';
</style>
