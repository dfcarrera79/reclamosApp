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
      :visible-columns="columnasVisibles"
      hide-header
    >
      <template v-slot:top>
        <div class="row no-wrap sq-pa-none">
          <div class="column">
            <p
              class="text-primary text-subtitle1"
              style="font-family: 'Bebas Neue'"
            >
              PRODUCTOS EN FACTURA
            </p>
            <p class="text-caption">
              Use el botón a la derecha de cada producto para consultar y
              descargar el análisis de lote/registro sanitario.
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
          <q-td class="col no-wrap">
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
                  @click="consultarRegistro(props.row.id)"
                  icon="picture_as_pdf"
                />
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <DialogComponent />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';
import { QTableProps } from 'quasar';
import { useAxios } from '../../services/useAxios';
import { Producto, Documento } from '../../components/models';
import DialogComponent from './DialogComponent.vue';

// Data
/* defined props */
const props = defineProps<{
  filas: Producto[];
  columna: QTableProps['columns'];
}>();
const { get } = useAxios();
const selectedRowId = ref(0);
const showDialog = ref(false);
const filter = ref('');
const columnasVisibles = ref(['nombre']);
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

/* provided variables */
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

    const documents = respuesta.objetos;
    if (documents.length > 0) {
      documentos.value = documents;
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
      registro.value = registros[0];
    }
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
  }
};

const consultarRegistro = async (rowId: number) => {
  selectedRowId.value = rowId;
  showDialog.value = true;
  await fetchDocumento(rowId);
  await fetchRegistro(rowId);
};
</script>
