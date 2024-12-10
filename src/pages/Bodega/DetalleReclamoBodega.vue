<script setup lang="ts">
import {
  Filas,
  Archivo,
  Objetos,
  AuditoriaObject,
  RespuestaBodega,
  RespuestaArchivo,
} from '../../components/models';
import {
  columnasVisibles,
  columnasDetalleReclamo,
} from '../../services/useColumnas';
import { computed, ref, watch } from 'vue';
import DialogoEstado from './DialogoEstado.vue';
import DialogoMotivo from './DialogoMotivo.vue';
import { useAxios } from '../../services/useAxios';
import MotivosPrioridad from './MotivosPrioridad.vue';
import { useAppStore } from '../../stores/useAppStore';
import { useMensajes } from '../../services/useMensajes';
import { procesarObjetos } from '../../services/useUtils';
import { useBodegaStore } from '../../stores/useBodegaStore';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import TablaAuditoria from '../../components/TablaAuditoria.vue';

/* Defined props */
const props = defineProps<{
  estado: string;
  query: string;
}>();

// Data
const page = ref(1);
const alert = ref(false);
const cambiar = ref(false);
const idProducto = ref(0);
const numReclamo = ref(0);
const reclamos = ref([]);
const seleccion = ref('');
const { get } = useAxios();
const audit = ref(false);
const { formatearFactura } = useMensajes();
const appStore = useAppStore();
const bodegaStore = useBodegaStore();
const auditoria = ref<AuditoriaObject[]>([]);
const filas = ref<Filas[]>([]);
const fotos = ref<Archivo[]>([]);
const newFilas = ref<Filas[]>([]);
const visibleColumns = ref<string[]>([]);

const expandedRow = ref<number | null>(null);

const pagination = ref({
  sortBy: 'numero',
  descending: true,
  page: page.value,
  rowsPerPage: 50,
  rowsNumber: appStore.numFilas,
});
const columnas = columnasDetalleReclamo;

// Methods
const toggleExpand = (rowId: number) => {
  expandedRow.value = expandedRow.value === rowId ? null : rowId;
};

const handleButton = (mail: string, id: number) => {
  appStore.dialogo.email = mail;
  appStore.dialogo.id = id;
};

const mostrarAuditoria = async (trimmedRuc: string, trimmedFactura: string) => {
  const formulario = {
    ruc_reclamante: trimmedRuc,
    no_factura: formatearFactura(trimmedFactura),
  };

  const audi = await get('/reclamo/obtener_auditoria', formulario);

  auditoria.value = audi.objetos;
  audit.value = !audit.value;
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

const handleEditarMotivo = (id: number, nroReclamo: number) => {
  cambiar.value = true;
  idProducto.value = id;
  numReclamo.value = nroReclamo;
};

const renovarMotivo = async () => {
  await whichQuery(page.value, pagination.value.rowsPerPage);
};
</script>

<template>
  <ArchivoDialog v-model:alert="alert" v-model:fotos="fotos" />
  <DialogoEstado />
  <DialogoMotivo
    v-model:cambiar="cambiar"
    v-model:idProducto="idProducto"
    v-model:numReclamo="numReclamo"
    @renovarMotivo="renovarMotivo"
  />
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
                toggleExpand(props.row.nro_reclamo);
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
              <template v-if="col.value == 'Muy alta'">
                <q-badge rounded color="negative"> {{ col.value }} </q-badge>
                <br />
                <MotivosPrioridad :reclamos="props.row.reclamos" />
              </template>
              <template v-else-if="col.value == 'Alta'">
                <q-badge rounded color="amber-10"> {{ col.value }} </q-badge>
                <br />
                <MotivosPrioridad :reclamos="props.row.reclamos" />
              </template>
              <template v-else-if="col.value == 'Media'">
                <q-badge rounded color="warning"> {{ col.value }} </q-badge>
                <br />
                <MotivosPrioridad :reclamos="props.row.reclamos" />
              </template>
              <template v-else-if="col.value == 'Baja'">
                <q-badge rounded color="positive"> {{ col.value }} </q-badge>
                <br />
                <MotivosPrioridad :reclamos="props.row.reclamos" />
              </template>
              <template v-else>
                <q-badge rounded color="grey-5"> {{ col.value }} </q-badge>
                <br />
                <MotivosPrioridad :reclamos="props.row.reclamos" />
              </template>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
        <q-tr v-show="expandedRow === props.row.nro_reclamo" :props="props">
          <q-dialog v-model="audit">
            <q-card class="audit-card">
              <q-toolbar>
                <q-toolbar-title
                  ><span class="text-h6 text-primary">AUDITORÍA</span>
                </q-toolbar-title>

                <q-btn flat round dense icon="close" v-close-popup />
              </q-toolbar>
              <q-card-section class="row items-center q-pt-xs">
                <div class="gt-xs">
                  <strong class="text-weight-bold text-primary">RUC: </strong>
                  {{ props.row.ruc }}
                  <strong class="text-weight-bold text-primary q-ml-md"
                    >Factura:
                  </strong>
                  {{ props.row.nro_factura }}
                </div>

                <div class="column xs">
                  <div>
                    <strong class="text-weight-bold text-primary">RUC: </strong>
                    {{ props.row.ruc }}
                  </div>
                  <div>
                    <strong class="text-weight-bold text-primary"
                      >Factura:
                    </strong>
                    {{ props.row.nro_factura }}
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <TablaAuditoria v-model:auditoria="auditoria" />
              </q-card-section>
            </q-card>
          </q-dialog>
          <q-td colspan="100%">
            <div class="column">
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

              <q-btn
                class="q-ml-none q-mt-sm"
                outline
                color="primary"
                no-caps
                dense
                @click="mostrarAuditoria(props.row.ruc, props.row.nro_factura)"
                v-show="appStore.appCodigo === appStore.APP_USUARIO"
                style="max-width: 250px"
              >
                <div class="row items-center no-wrap q-pa-none">
                  <div class="text-center text-caption">
                    <strong>Auditoria</strong>
                  </div>
                </div>
              </q-btn>
            </div>

            <div class="text-left">
              <strong>Usuario(vendedor): </strong>
              {{ props.row.reclamos[0]['usuario'] }}
            </div>
            <div class="text-left" v-show="estado !== 'PEN'">
              <strong>Encargado del reclamo: </strong>
              {{ props.row.nombre_usuario }}
            </div>
            <div
              class="text-left"
              v-show="estado !== 'PEN' && estado !== 'FIN'"
            >
              <strong>Respuesta al reclamo: </strong>
              <span
                v-if="props.row.respuesta_enproceso"
                v-html="props.row.respuesta_enproceso"
              ></span>
              <span v-else v-html="props.row.respuesta_finalizado"></span>
            </div>
            <div class="text-left" v-show="estado == 'FIN'">
              <div v-if="props.row.respuesta_enproceso">
                <strong> Respuesta al reclamo (En proceso): </strong>
                <span v-html="props.row.respuesta_enproceso"></span>
              </div>
              <div>
                <strong>Respuesta al reclamo (Finalizado): </strong>
                <span v-html="props.row.respuesta_finalizado"></span>
              </div>
            </div>

            <div class="row wrap">
              <div
                class="q-ma-sm"
                v-for="(reclamo, index) in props.row.reclamos"
                :key="index"
              >
                <q-card bordered flat class="bg-grey-1 my-card">
                  <q-card-section>
                    <p class="q-mb-none text-h7">
                      {{ reclamo.producto.nombre }}
                    </p>
                    <q-btn
                      size="xs"
                      color="primary"
                      round
                      dense
                      icon="edit"
                      @click="
                        handleEditarMotivo(
                          reclamo.producto.id,
                          props.row.nro_reclamo
                        )
                      "
                    >
                      <q-tooltip>Editar el motivo</q-tooltip>
                    </q-btn>
                  </q-card-section>

                  <q-separator inset />

                  <q-card-section>
                    <p class="q-mb-none text-left">
                      <strong>Motivo:</strong>
                      {{ reclamo.motivo.nombre_motivo }}
                    </p>

                    <p class="q-mb-none text-left">
                      <strong>Detalle: </strong>
                      <span v-html="reclamo.comentario"></span>
                    </p>
                    <p
                      class="q-mb-none text-left"
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
