<script setup lang="ts">
import DialogoEstado from './DialogoEstado.vue';
import { useAxios } from '../../services/useAxios';
import { computed, nextTick, ref, watch } from 'vue';
import { useAppStore } from '../../stores/useAppStore';
import { procesarObjetos } from '../../services/useUtils';
import { useBodegaStore } from '../../stores/useBodegaStore';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import {
  columnasDetalleReclamoMovil,
  columnasVisiblesMovil,
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

interface TableColumn {
  name: string;
  required: boolean;
  label: string;
  align: 'left' | 'center' | 'right';
  sortable: boolean;
  __iconClass: string;
  __thClass: string;
}

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
const columnas = columnasDetalleReclamoMovil;

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

const rows = ref([...newFilas.value]);
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

visibleColumns.value = columnasVisiblesMovil(props.estado);

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
      dense
      bordered
      :rows="rows"
      :columns="columnas"
      :loading="loading"
      row-key="nro_reclamo"
      :visible-columns="visibleColumns"
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
          <q-card bordered flat class="q-pa-xs text-grey-8">
            <q-bar class="bg-grey-8 text-white row justify-center q-pa-none">
              <div class="q-pl-sm">
                <strong>RECLAMO {{ props.row.nro_reclamo }} </strong>
                <span
                  class="q-ml-md"
                  style="text-align: center"
                  v-for="col in props.cols.filter(
                    (col: TableColumn) => col.name !== 'numero'
                  )"
                  :key="col.name"
                >
                  <template v-if="col.name === 'prioridad'">
                    <template v-if="col.value == 'Alta'">
                      <q-badge rounded color="negative">
                        {{ col.value }}
                      </q-badge>
                    </template>
                    <template v-else-if="col.value == 'Media'">
                      <q-badge rounded color="warning">
                        {{ col.value }}
                      </q-badge>
                    </template>
                    <template v-else>
                      <q-badge rounded color="grey-5">
                        {{ col.value }}
                      </q-badge>
                    </template>
                  </template>
                </span>
              </div>

              <q-space />

              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip>Cerrar</q-tooltip>
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

              <div class="q-mt-sm">
                <p class="q-mb-sm">
                  <strong>Usuario(vendedor):</strong>
                  {{ props.row.reclamos[0]['usuario'] }}
                </p>
                <p class="q-mb-sm">
                  <strong>Cliente:</strong>
                  {{ props.row.cliente }}
                </p>
                <p class="q-mb-sm">
                  <strong>RUC: </strong>
                  {{ props.row.ruc }}
                </p>
                <p class="q-mb-sm">
                  <strong>Nro. Factura: </strong>
                  {{ props.row.nro_factura }}
                </p>
                <p class="q-mb-sm">
                  <strong>Fecha de factura: </strong>
                  {{ props.row.fecha_factura }}
                </p>
                <p class="q-mb-sm">
                  <strong>Fecha del reclamo: </strong>
                  {{ props.row.fecha_reclamo }}
                </p>
                <p class="q-mb-sm" v-show="estado !== 'PEN'">
                  <strong>Encargado del reclamo: </strong>
                  {{ props.row.nombre_usuario }}
                </p>
                <p class="q-mb-sm" v-show="estado !== 'PEN'">
                  <strong>Respuesta al reclamo: </strong>
                  <span v-html="props.row.respuesta_finalizado"></span>
                </p>
              </div>
            </q-card-section>

            <q-card-section class="flex column q-pa-xs">
              <div class="flex flex-center">
                <strong>Productos en reclamo</strong>
              </div>
              <div
                v-for="reclamo in props.row.reclamos"
                :key="reclamo.producto.id"
              >
                <q-separator />
                <p class="q-pt-xs">
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
