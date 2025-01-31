<script setup lang="ts">
import { ref } from 'vue';
import { QTableProps } from 'quasar';
import { useAppStore } from '../../stores/useAppStore';
import TablaAuditoria from '../../components/TablaAuditoria.vue';
import { AuditoriaObject, Producto } from '../../components/models';

// Data
const appStore = useAppStore();
const columnas: QTableProps['columns'] = [
  { name: 'id', align: 'left', label: 'ID', field: 'id' },
  {
    name: 'nombre',
    align: 'left',
    label: '',
    field: 'nombre',
    sortable: true,
  },
];

let objetoAuditoria = {
  id: 10000,
  nombre: 'Reclamo por auditoria',
  cantidad: 0,
  otra_info: [
    {
      cantidad_x_uni: 0,
      cantidad: 0,
      lote: '',
      fecha_vencimiento: '2100/12/31',
      r_sanitario: '',
      fecha_corta: false,
      subtotal: 0,
    },
  ],
};
const mostrarAuditoria = ref(false);
const filas = defineModel<Producto[]>('filas', { required: true });
const auditoria = defineModel<AuditoriaObject[]>('auditoria', {
  required: true,
});
const ruc = defineModel<string>('ruc', {
  required: true,
});
const factura = defineModel<string>('factura', {
  required: true,
});

/* defined emits*/
const emit = defineEmits(['agregarReclamo', 'quitarFila']);

// Methods
const enviarReclamo = (event: Producto) => {
  emit('agregarReclamo', event);
};

const enviarFila = (event: number) => {
  emit('quitarFila', event);
};

const filter = ref('');
const columnasVisibles = ref(['nombre']);

const pagination = {
  page: 1,
  rowsPerPage: 0, // 0 means all rows
};
</script>

<template>
  <div class="q-pa-none">
    <q-dialog v-model="mostrarAuditoria">
      <q-card class="my-card">
        <q-toolbar>
          <q-toolbar-title
            ><span class="text-h6 text-primary">AUDITORÍA</span>
          </q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="row items-center q-pt-xs">
          <div class="gt-xs">
            <strong class="text-weight-bold text-primary">RUC: </strong>
            {{ ruc }}
            <strong class="text-weight-bold text-primary q-ml-md"
              >Factura:
            </strong>
            {{ factura }}
          </div>

          <div class="column xs">
            <div>
              <strong class="text-weight-bold text-primary">RUC: </strong>
              {{ ruc }}
            </div>
            <div>
              <strong class="text-weight-bold text-primary">Factura: </strong>
              {{ factura }}
            </div>
            <q-btn
              class="q-mt-sm"
              outline
              color="primary"
              no-caps
              dense
              @click="
                enviarReclamo(objetoAuditoria);
                mostrarAuditoria = false;
              "
              v-show="appStore.appCodigo === appStore.APP_USUARIO"
            >
              <div class="row items-center no-wrap q-pa-none">
                <div class="text-center text-caption">
                  <strong>Agregar reclamo por auditoria</strong>
                </div>
              </div>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <TablaAuditoria v-model:auditoria="auditoria" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-table
      v-if="filas.length > 0"
      class="text-h6 text-grey-8 justify-center"
      style="max-height: 325px"
      flat
      bordered
      no-data-label="Datos no disponibles"
      hide-no-data
      :rows="filas"
      :columns="columnas"
      :filter="filter"
      row-key="id"
      :rows-per-page-options="[0]"
      v-model:pagination="pagination"
      :visible-columns="columnasVisibles"
      hide-header
      hide-bottom
    >
      <template v-slot:header-cell-reclamo="props">
        <q-th :props="props"> <q-icon name="add" /> Reclamo </q-th>
      </template>

      <template v-slot:top>
        <div class="fit row no-wrap q-pa-none">
          <p
            class="text-primary text-subtitle1"
            style="font-family: 'Bebas Neue'"
          >
            PRODUCTOS EN FACTURA
          </p>
          <div class="justify-end column">
            <q-input
              style="align-right"
              input-class="text-right"
              clearable
              clear-icon="close"
              dense
              debounce="350"
              borderless
              color="primary"
              v-model="filter"
              placeholder="Buscar..."
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              class="q-mb-md q-ml-md"
              outline
              color="primary"
              no-caps
              dense
              @click="mostrarAuditoria = !mostrarAuditoria"
              v-show="appStore.appCodigo === appStore.APP_USUARIO"
            >
              <div class="row items-center no-wrap q-pa-none">
                <div class="text-center text-caption">
                  <strong>Auditoria</strong>
                </div>
              </div>
            </q-btn>
          </div>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="col no-wrap nombre-column">
            <div>{{ props.row.nombre }}</div>
            <div class="row justify-between">
              <div><strong>Cantidad:</strong> {{ props.row.cantidad }}</div>
              <div>
                <strong>Lote:</strong>
                {{ props.row.otra_info[0].lote }}
              </div>
            </div>
            <div class="row justify-between">
              <div>
                <strong>Fecha de vencimiento:</strong>
                {{ props.row.otra_info[0].fecha_vencimiento }}
              </div>
              <div>
                <q-btn
                  size="sm"
                  color="primary"
                  round
                  dense
                  @click="enviarReclamo(props.row), enviarFila(props.row)"
                  icon="add"
                />
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style scoped lang="scss">
/* Estilos generales para la tabla */
.q-table {
  width: 100%;
  max-width: 450px; // Ancho máximo para pantallas grandes
}

/* Estilos específicos para pantallas pequeñas */
@media (max-width: 400px) {
  .q-table {
    max-width: 100%; // Ancho completo en pantallas pequeñas
  }

  .nombre-column {
    word-break: break-word; // Aplica el quiebre de palabras
    white-space: normal; // Permite el quiebre de línea
  }
}
</style>
