<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/useAppStore';
import TablaAuditoria from '../../components/TablaAuditoria.vue';
import { columnasEditarReclamo } from '../../services/useColumnas';
import { AuditoriaObject, Producto } from '../../components/models';

// Data
const appStore = useAppStore();
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

const columnas = columnasEditarReclamo;

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
const columnasVisibles = ref([
  'nombre',
  'cantidad',
  'lote',
  'fecha',
  'reclamo',
]);

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
          </div>

          <q-btn
            class="q-ml-md"
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
        </q-card-section>

        <q-card-section class="q-pt-none">
          <TablaAuditoria v-model:auditoria="auditoria" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table
      v-if="filas.length > 0"
      class="text-h6 text-grey-8 justify-center"
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
    >
      <template v-slot:header-cell-reclamo="props">
        <q-th :props="props"> <q-icon name="add" /> Reclamo </q-th>
      </template>

      <template v-slot:top>
        <div class="column">
          <div class="row">
            <p class="text-primary text-h6" style="font-family: 'Bebas Neue'">
              PRODUCTOS EN FACTURA
            </p>
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

          <p class="text-caption">
            Utilice el botón a la derecha del producto para detallar el reclamo
          </p>
        </div>
        <q-space />
        <q-input
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
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.value == props.row.id">
              <q-btn
                size="sm"
                color="primary"
                round
                dense
                @click="enviarReclamo(props.row), enviarFila(props.row)"
                icon="add"
              />
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 1100px; // Puedes ajustar este tamaño según lo que necesites
  margin: auto;
}
</style>
