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
  columna: QTableProps['columns'];
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

    const registros = respuesta.objetos;
    if (registros.length > 0) {
      registro.value = respuesta.objetos[0];
    }
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
  }
};

const handleRowIdSelected = (event: number) => {
  consultarRegistro(event);
};

// Methods
const consultarRegistro = (rowId: number) => {
  selectedRowId.value = rowId;
  showDialog.value = true;
  fetchDocumento(rowId);
  fetchRegistro(rowId);
};
</script>

<template>
  <div class="q-pa-none">
    <q-table
      v-if="props.filas.length > 0"
      class="text-h6 text-grey-8 justify-center"
      flat
      bordered
      no-data-label="Datos no disponibles"
      hide-no-data
      :rows="props.filas"
      :columns="props.columna"
      :filter="filter"
      row-key="id"
      :rows-per-page-options="[0]"
      v-model:pagination="pagination"
      hide-header
    >
      <template v-slot:top>
        <div class="row no-wrap sq-pa-none">
          <div class="column">
            <p
              class="text-primary text-subtitle1"
              style="font-family: 'Bebas Neue'"
            >
              PRODUCTOS POR LABORATORIO
            </p>
            <p class="text-caption">
              Use el botón a la derecha del producto para ingresar el análisis
              de lote/registro sanitario.
            </p>
          </div>
          <div class="justify-end">
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
          </div>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="row no-wrap justify-between">
            <div style="max-width: 100px">{{ props.row.nombre_articulo }}</div>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="consultarRegistro(props.row.art_codigo)"
              icon="add"
            />
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
