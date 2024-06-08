<script setup lang="ts">
import { provide, ref } from 'vue';
import { QTableProps } from 'quasar';
import { useAxios } from '../../services/useAxios';
import DialogComponent from './DialogComponent.vue';
import { ProductoLaboratorio, Documento } from '../../components/models';

// Data
/* defined props */
const props = defineProps<{
  filas: ProductoLaboratorio[];
  columnas: QTableProps['columns'];
}>();

const { get } = useAxios();
const selectedRowId = ref(0);
const showDialog = ref(false);
const filter = ref('');
const pagination = {
  page: 1,
  rowsPerPage: 0, // 0 means all rows
};
const documentos = ref<Documento[]>([]);
const registro = ref<Documento>({
  id_documento: 0,
  id_producto: 0,
  tipo: 0,
  modificado_en: '',
  path: '',
});

/* defined provide variables */
provide('showDialog', showDialog);
provide('documentos', documentos);
provide('registro', registro);

// Methods
const fetchDocumento = async (rowId: number) => {
  documentos.value = [];
  try {
    const respuesta = await get('/documentos/obtener_documento', {
      id_producto: rowId,
    });

    if (respuesta.error === 'S') {
      console.error(respuesta.mensaje);
      return;
    }

    if (respuesta.objetos.length > 0) {
      documentos.value = respuesta.objetos;
    }
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
  }
};

const fetchRegistro = async (rowId: number) => {
  registro.value = {
    id_documento: 0,
    id_producto: 0,
    tipo: 0,
    modificado_en: '',
    path: '',
  };
  try {
    const respuesta = await get('/registros/obtener_registro', {
      id_producto: rowId,
    });

    if (respuesta.error === 'S') {
      console.error(respuesta.mensaje);
      return;
    }

    if (respuesta.objetos.length > 0) {
      registro.value = respuesta.objetos[0];
    }
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
  }
};

const handleRowIdSelected = (event: number) => {
  consultarRegistro(event);
};

const consultarRegistro = (rowId: number) => {
  selectedRowId.value = rowId;
  showDialog.value = true;

  fetchDocumento(rowId);
  fetchRegistro(rowId);
};
</script>

<template>
  <div class="q-pa-md">
    <q-table
      v-if="props.filas.length > 0"
      class="text-h6 text-grey-8 justify-center"
      flat
      bordered
      no-data-label="Datos no disponibles"
      hide-no-data
      :rows="props.filas"
      :columns="props.columnas"
      :filter="filter"
      row-key="id"
      :rows-per-page-options="[0]"
      v-model:pagination="pagination"
    >
      <template v-slot:top>
        <div class="column">
          <div class="row">
            <p class="text-primary text-h6" style="font-family: 'Bebas Neue'">
              PRODUCTOS POR LABORATORIO
            </p>
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
          </div>

          <p class="text-caption">
            Utilice el botón a la izquierda del producto para ingresar el
            análisis de lote/registro sanitario
          </p>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.value == props.row.art_codigo">
              <q-btn
                size="sm"
                color="primary"
                round
                dense
                @click="consultarRegistro(props.row.art_codigo)"
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
    <DialogComponent
      :selectedRowId="selectedRowId"
      @rowIdSelected="handleRowIdSelected($event)"
    />
  </div>
</template>
