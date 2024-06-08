<script setup lang="ts">
import { ref } from 'vue';
import { Producto } from '../../components/models';
import { columnasEditarReclamo } from '../../services/useColumnas';

// Data
const filas = defineModel<Producto[]>('filas', { required: true });
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
          <p class="text-primary text-h6" style="font-family: 'Bebas Neue'">
            PRODUCTOS EN FACTURA
          </p>
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
                @click="enviarReclamo(props.row), enviarFila(props.row.id)"
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
