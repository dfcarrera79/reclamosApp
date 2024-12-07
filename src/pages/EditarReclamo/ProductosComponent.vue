<script setup lang="ts">
import { ref } from 'vue';
import { columnasEditarReclamo } from '../../services/useColumnas';
import { AuditoriaObject, Producto } from '../../components/models';
import TablaAuditoria from '../../components/TablaAuditoria.vue';

// Data
const mostrarAuditoria = ref(false);

const filas = defineModel<Producto[]>('filas', { required: true });
const auditoria = defineModel<AuditoriaObject[]>('auditoria', {
  required: true,
});

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
    <q-dialog v-model="mostrarAuditoria" full-width>
      <q-card class="row justify-center">
        <q-card-section class="row items-center no-wrap">
          <div class="column">
            <div class="text-h6 text-primary">AUDITORÍA</div>
            <TablaAuditoria v-model:auditoria="auditoria" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section> </q-card-section>
        <!-- <q-card-actions vertical>
          <q-item
            clickable
            v-ripple
            active-class="my-menu-link"
            @click="eliminarEmpresa"
          >
            <q-item-section avatar>
              <q-icon name="delete" color="red-5" />
            </q-item-section>
            <q-item-section>
              <span class="text-subtitle1"> Eliminar Empresa </span>
            </q-item-section>
          </q-item>
        </q-card-actions> -->
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
