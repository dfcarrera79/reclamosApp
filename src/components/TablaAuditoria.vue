<script setup lang="ts">
import { ref } from 'vue';
import { AuditoriaObject } from '../components/models';
import { columnasAuditoria } from '../components/columns';

// Data
const columns = columnasAuditoria;
const expandedRow = ref<number | null>(null);
const rows = defineModel<AuditoriaObject[]>('auditoria', { required: true });

const columnasVisibles = ref([
  'doc_acro',
  'compro',
  'fecreg',
  'numitems',
  'monto',
  'concepto',
  'fecha',
  'fpago',
]);

// Methods
const toggleExpand = (rowId: number) => {
  expandedRow.value = expandedRow.value === rowId ? null : rowId;
};
</script>

<template>
  <div>
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="name"
      :visible-columns="columnasVisibles"
      hide-bottom
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
        {{ props.row.doc_codigo }}
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
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">
              This is expand slot for row above: {{ props.row.name }}.
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
