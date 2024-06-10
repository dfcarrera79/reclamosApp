<script setup lang="ts">
import DialogoEstado from './DialogoEstado.vue';
import ArchivoDialog from './ArchivoDialog.vue';
import { useAxios } from '../../services/useAxios';
import { computed, nextTick, ref, watch } from 'vue';
import { useAppStore } from '../../stores/useAppStore';
import { procesarObjetos } from '../../services/useUtils';
import { useBodegaStore } from '../../stores/useBodegaStore';
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
const pageSize = 50;
const alert = ref(false);
const reclamos = ref([]);
const seleccion = ref([]);
const loading = ref(false);
const { get } = useAxios();
const filas = ref<Filas[]>([]);
const appStore = useAppStore();
const bodegaStore = useBodegaStore();
const fotos = ref<Archivo[]>([]);
const newFilas = ref<Filas[]>([]);
const pagination = { rowsPerPage: 0 };
const visibleColumns = ref<string[]>([]);
const replacedPath = ref('');
const columnas = columnasDetalleReclamo;

// Methods
const handleButton = (mail: string, id: number) => {
  appStore.dialogo.email = mail;
  appStore.dialogo.id = id;
};

watch(page, () => {
  whichQuery(page.value, pageSize);
});

watch(bodegaStore, async () => {
  if (bodegaStore.actualizarFilas === true) {
    rows.value = [];
    await whichQuery(1, pageSize);
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

whichQuery(1, pageSize);
// Definir una variable ref para rows que inicialmente es igual a newRows
const rows = ref([...newFilas.value]);

// Utilizar un watcher para actualizar rows cuando newRows cambie
watch(newFilas, (newValue) => {
  rows.value.push(...newValue);
});

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

const onScroll = ({ to, ref }: { to: number; ref: any }) => {
  const lastPage = Math.ceil(appStore.numFilas / pageSize);
  const lastIndex = rows.value.length - 1;

  if (loading.value !== true && page.value < lastPage && to === lastIndex) {
    loading.value = true;
    setTimeout(() => {
      page.value++;
      nextTick(() => {
        ref.refresh();
        loading.value = false;
      });
    }, 100);
  }
};

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
</script>

<template>
  <ArchivoDialog
    v-model:alert="alert"
    v-model:fotos="fotos"
    v-model:replacedPath="replacedPath"
  />

  <DialogoEstado />

  <div>
    <q-table
      class="my-sticky-header-table text-h6 text-grey-8"
      flat
      bordered
      :rows="rows"
      :columns="columnas"
      :loading="loading"
      row-key="nro_reclamo"
      :visible-columns="['prioridad', 'numero']"
      style="height: 410px"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      hide-bottom
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
              icon="open_in_new"
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
        <q-dialog v-model="props.expand" persistent>
          <q-card bordered flat class="q-pa-xs">
            <q-bar class="bg-grey-8 text-white row justify-center q-pa-none">
              <div class="q-pl-sm">
                <strong>RECLAMO</strong>
              </div>

              <q-space />

              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip>Close</q-tooltip>
              </q-btn>
            </q-bar>
            <q-card-section class="q-pa-xs">
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

              <q-list dense>
                <q-item>
                  <q-item-section>Usuario(vendedor): </q-item-section>
                  <q-item-section>
                    {{ props.row.reclamos[0]['usuario'] }}
                  </q-item-section>
                </q-item>

                <q-item v-show="estado !== 'PEN'">
                  <q-item-section>Encargado del reclamo: </q-item-section>
                  <q-item-section>
                    {{ props.row.nombre_usuario }}
                  </q-item-section>
                </q-item>

                <q-item v-show="estado !== 'PEN'">
                  <q-item-section>Respuesta al reclamo: </q-item-section>
                  <q-item-section>
                    <span v-html="props.row.respuesta_finalizado"></span>
                  </q-item-section>
                </q-item>

                <q-item
                  v-for="col in props.cols.filter(
                    (col: any) => col.name !== 'desc' && col.name !== 'reclamos'
                  )"
                  :key="col.name"
                >
                  <q-item-section>
                    <q-item-label>{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="col.name === 'prioridad'">
                    <q-item-label v-if="col.value === 'Alta'">
                      <q-badge rounded color="negative">
                        {{ col.value }}
                      </q-badge>
                    </q-item-label>
                    <q-item-label v-else-if="col.value === 'Media'">
                      <q-badge rounded color="warning">
                        {{ col.value }}
                      </q-badge>
                    </q-item-label>
                    <q-item-label v-else>
                      <q-badge rounded color="grey-5">
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

            <q-card-section class="flex flex-center column q-pa-xs">
              <div>
                <strong>Productos en reclamo</strong>
              </div>
              <div
                v-for="reclamo in props.row.reclamos"
                :key="reclamo.producto.id"
              >
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
                <q-separator />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </template>
    </q-table>
  </div>
</template>

<style scoped lang="scss">
@import '../../css/sticky.header.table.mobile.scss';
</style>
