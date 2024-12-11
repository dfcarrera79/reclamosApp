<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { AuditoriaObject } from '../components/models';
import { columnasAuditoria, columnasDetalles } from '../components/columns';

// Data
const $q = useQuasar();
const columns = columnasAuditoria;
const detalles = columnasDetalles;
const expandedRow = ref<number | null>(null);
const rows = defineModel<AuditoriaObject[]>('auditoria', { required: true });

const columnasVisibles = ref([
  'doc_acro',
  'compro',
  'numitems',
  'monto',
  'concepto',
  'fecha',
  'fpago',
  'login',
]);

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 0,
});

// Methods
const toggleExpand = (rowId: number) => {
  expandedRow.value = expandedRow.value === rowId ? null : rowId;
};

// Function to parse "detalle"
interface ItemDetalle {
  codigo: string;
  descripcion: string;
  cantidad: number;
  subtotal: number;
}

const parseDetalle = (detalle: string): ItemDetalle[] => {
  const lines = detalle.trim().split('\n');
  const items: ItemDetalle[] = [];

  for (let i = 0; i < lines.length; i += 4) {
    items.push({
      codigo: lines[i] || '',
      descripcion: lines[i + 1] || '',
      cantidad: parseFloat(lines[i + 2]?.trim() || '0'),
      subtotal: parseFloat(lines[i + 3]?.trim() || '0'),
    });
  }

  return items;
};
// const parseDetalle = (detalle: string): ItemDetalle[] => {
//   const lines = detalle.trim().split('\n');
//   const items: ItemDetalle[] = [];

//   for (let i = 0; i < lines.length; i += 4) {
//     if (lines[i] && lines[i + 1] && lines[i + 2] && lines[i + 3]) {
//       items.push({
//         codigo: lines[i].trim(),
//         descripcion: lines[i + 1].trim(),
//         cantidad: parseFloat(lines[i + 2].trim()),
//         subtotal: parseFloat(lines[i + 3].trim()),
//       });
//     }
//   }

//   return items;
// };
</script>

<template>
  <div>
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="doc_codigo"
      :visible-columns="columnasVisibles"
      hide-pagination
      v-model:pagination="pagination"
      :dense="$q.screen.lt.md"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
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
              @click="toggleExpand(props.row.doc_codigo)"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
        <q-tr v-show="expandedRow === props.row.doc_codigo" :props="props">
          <q-td colspan="100%">
            <q-table
              flat
              bordered
              dense
              :rows="parseDetalle(props.row.detalle)"
              row-key="codigo"
              :columns="detalles"
              :grid="$q.screen.lt.md"
              v-model:pagination="pagination"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
