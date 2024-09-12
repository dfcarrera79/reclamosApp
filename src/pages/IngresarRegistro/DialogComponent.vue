<script setup lang="ts">
import moment from 'moment';
import { useQuasar } from 'quasar';
import { useAxios } from '../../services/useAxios';
import { inject, ref, computed, watch } from 'vue';
import { Documento, Respuesta } from '../../components/models';

// Data
/* defined props */
const props = defineProps({
  selectedRowId: {
    type: Number,
    required: true,
  },
});

/* defined emits */
const emit = defineEmits(['rowIdSelected']);

/* defined injected variables */
const registry = inject<Documento>('registro');
const showDialog = inject<boolean>('showDialog');
const documents = inject<Documento[]>('documentos');

const path = process.env.DOCUMENT_PATH;
const replacedPath = ref<string>(process.env.REPLACED_PATH ?? '');
const $q = useQuasar();
const registro = ref<File | null>(null);
const { post, put, deletes } = useAxios();
const documentosActualizados = ref<File[]>([]);
const documentos = ref<FileList | null>(null);

watch(
  () => inject<Documento[]>('documents')?.length,
  (newLength) => {
    documentosActualizados.value = Array.from(
      { length: newLength },
      () => null
    );
  }
);

// Computed
const registroSeleccionado = computed(() => registro.value !== null);
const documentoSeleccionado = computed(() => documentos.value !== null);

// Methods
const triggerConsultarRegistro = (event: number) => {
  emit('rowIdSelected', event);
};

const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

const subirDocumento = async (doc: File) => {
  const formData = new FormData();
  formData.append('file', doc);
  const respt = await post('/documentos/subir_documento/', {}, formData);
  return respt.files.file.filepath;
};

const subirRegistro = async (doc: File) => {
  const formData = new FormData();
  formData.append('file', doc);
  const respt = await post('/registros/subir_registro/', {}, formData);
  return respt.files.file.filepath;
};

const formatDateTime = (dateTimeString: string | undefined) => {
  const date = moment(dateTimeString);
  const formattedDate = date.format('DD/MM/YY HH:mm');
  return formattedDate;
};

const registrarDocumento = async (doc: File | null) => {
  if (doc) {
    const filepath = await subirDocumento(doc);
    const respuesta = await post(
      '/documentos/registrar_documento',
      {},
      JSON.parse(
        JSON.stringify({
          id_producto: props.selectedRowId,
          filepath: filepath,
        })
      )
    );
    deducirMensaje(respuesta);
    if (respuesta.error === 'S') {
      deducirMensaje(respuesta);
      return;
    }
  }
};

const confirmDialog = ref(false);
let deleteDocumentId: number | undefined = 0;

const confirmDelete = (id: number | undefined) => {
  deleteDocumentId = id;
  confirmDialog.value = true;
};

const deleteConfirmed = async () => {
  confirmDialog.value = false;

  if (deleteDocumentId !== 0) {
    const respuesta = await deletes(
      '/documentos/eliminar_documento',
      {
        id_documento: deleteDocumentId,
      },
      {}
    );
    triggerConsultarRegistro(props.selectedRowId);
    deducirMensaje(respuesta);
    if (respuesta.error === 'S') {
      deducirMensaje(respuesta);
      return;
    }
  }
};

const registrarDocumentos = async () => {
  if (documentos.value) {
    const docs = Array.from(documentos.value);
    for (const doc of docs) {
      await registrarDocumento(doc);
    }
    documentos.value = null;
  }
};

const grabarRegistro = async (doc: File | null) => {
  if (doc) {
    const filepath = await subirRegistro(doc);
    const respuesta = await post(
      '/registros/grabar_registro',
      {},
      JSON.parse(
        JSON.stringify({
          id_producto: props.selectedRowId,
          filepath: filepath,
        })
      )
    );
    deducirMensaje(respuesta);
    if (respuesta.error === 'S') {
      deducirMensaje(respuesta);
      return;
    }
    registro.value = null;
  }
};

const actualizarDocumento = async (
  doc: File | null,
  index: number,
  id: number
) => {
  if (doc) {
    const filepath = await subirDocumento(doc);
    const respuesta = await put(
      '/documentos/actualizar_documento',
      {},
      JSON.parse(
        JSON.stringify({
          id_producto: props.selectedRowId,
          filepath: filepath,
          id_documento: id,
        })
      )
    );
    deducirMensaje(respuesta);
    if (respuesta.error === 'S') {
      deducirMensaje(respuesta);
      return;
    }
    documentosActualizados.value[index] = null;
  }
};

const actualizarRegistro = async (doc: File | null) => {
  if (doc) {
    const filepath = await subirRegistro(doc);
    const respuesta = await put(
      '/registros/actualizar_registro',
      {},
      JSON.parse(
        JSON.stringify({
          id_producto: props.selectedRowId,
          filepath: filepath,
        })
      )
    );
    deducirMensaje(respuesta);
    if (respuesta.error === 'S') {
      deducirMensaje(respuesta);
      return;
    }
    registro.value = null;
  }
};

const downloadDocument = (filePath: string | undefined) => {
  const url = filePath?.replace(path as string, replacedPath.value);
  // Open the URL in a new window to trigger the download
  window.open(url, '_blank');
};
</script>

<template>
  <q-dialog v-model="showDialog">
    <q-card class="my-card q-pa-sm" flat bordered>
      <div class="row justify-between">
        <div
          class="text-left text-h6 text-grey-8"
          style="font-family: 'Bebas Neue'"
        >
          <strong>ARCHIVOS:</strong>
        </div>
        <q-btn
          @click="triggerConsultarRegistro(props.selectedRowId)"
          size="sm"
          round
          color="primary"
          icon="update"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-list>
        <div class="q-pa-sm">
          <template v-for="(document, index) in documents" :key="document.id">
            <p
              v-if="document.modificado_en !== ''"
              class="text-primary text-body2"
            >
              <strong>Actualizar Análisis de Lote</strong>
            </p>
            <p
              v-if="document.modificado_en !== ''"
              class="text-secondary text-body2"
            >
              <strong>Modificado:</strong>
              {{ formatDateTime(document.modificado_en) }}
            </p>
            <q-file
              filled
              bottom-slots
              accept=".pdf, image/*"
              v-model="documentosActualizados[index]"
              label="Análisis de lote"
              counter
              max-files="1"
            >
              <template v-slot:after>
                <q-btn
                  round
                  size="sm"
                  v-if="document.modificado_en !== ''"
                  @click="confirmDelete(document.id_documento)"
                  color="negative"
                  icon="delete"
                >
                  <q-tooltip>Eliminar documento</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  size="sm"
                  v-if="document.modificado_en !== ''"
                  @click="downloadDocument(document.path)"
                  color="positive"
                  icon="visibility"
                >
                  <q-tooltip>Visualizar documento</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  size="sm"
                  v-if="document.modificado_en !== ''"
                  @click="
                    actualizarDocumento(
                      documentosActualizados[index],
                      index,
                      document.id_documento
                    )
                  "
                  :disable="documentosActualizados[index] == null"
                  color="primary"
                  icon="cloud_upload"
                >
                  <q-tooltip>Actualizar documento</q-tooltip>
                </q-btn>
              </template>

              <template v-slot:append>
                <q-icon
                  name="close"
                  @click.stop.prevent="documentosActualizados[index] = null"
                  class="cursor-pointer"
                />
              </template>

              <template v-slot:hint>Archivos PDF</template>

              <template v-slot:prepend>
                <q-icon
                  :color="
                    document.modificado_en === '' ? 'secondary' : 'primary'
                  "
                  name="picture_as_pdf"
                />
              </template>
            </q-file>
          </template>
        </div>

        <div class="q-pa-sm">
          <p class="text-secondary text-body2">
            <strong>Ingresar Análisis de Lote</strong>
          </p>

          <q-file
            filled
            multiple
            append
            bottom-slots
            v-model="documentos"
            accept=".pdf, image/*"
            label="Análisis de lote"
            counter
          >
            <template v-slot:after>
              <q-btn
                round
                size="sm"
                @click="registrarDocumentos()"
                :disable="!documentoSeleccionado"
                color="primary"
                icon="cloud_upload"
              />
            </template>

            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop.prevent="documentos = null"
                class="cursor-pointer"
              />
            </template>

            <template v-slot:hint> Archivos PDF </template>

            <template v-slot:prepend>
              <q-icon color="secondary" name="picture_as_pdf" />
            </template>
          </q-file>
        </div>

        <hr />

        <div class="q-pa-sm">
          <p
            v-if="registry?.modificado_en === ''"
            class="text-secondary text-body2"
          >
            <strong>Ingresar Registro Sanitario</strong>
          </p>
          <p v-else class="text-primary text-body2">
            <strong>Actualizar Registro Sanitario</strong>
          </p>
          <p
            v-if="registry?.modificado_en !== ''"
            class="text-secondary text-body2"
          >
            <strong>Modificado:</strong>
            {{ formatDateTime(registry?.modificado_en) }}
          </p>
          <q-file
            filled
            bottom-slots
            v-model="registro"
            accept=".pdf, image/*"
            label="Registro sanitario"
            counter
            max-files="1"
          >
            <template v-slot:after>
              <q-btn
                round
                size="sm"
                v-if="registry?.modificado_en !== ''"
                @click="confirmDelete(registry?.id_documento)"
                color="negative"
                icon="delete"
              >
                <q-tooltip>Eliminar documento</q-tooltip>
              </q-btn>
              <q-btn
                round
                size="sm"
                v-if="registry?.modificado_en !== ''"
                @click="downloadDocument(registry?.path)"
                color="positive"
                icon="visibility"
              >
                <q-tooltip>Visualizar registro</q-tooltip>
              </q-btn>
              <q-btn
                round
                v-if="registry?.modificado_en === ''"
                size="sm"
                @click="grabarRegistro(registro)"
                color="primary"
                :disable="!registroSeleccionado"
                icon="cloud_upload"
              />
              <q-btn
                round
                v-else
                size="sm"
                @click="actualizarRegistro(registro)"
                color="primary"
                :disable="!registroSeleccionado"
                :icon="
                  registry?.modificado_en === '' ? 'cloud_upload' : 'update'
                "
              />
            </template>

            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop.prevent="registro = null"
                class="cursor-pointer"
              />
            </template>

            <template v-slot:hint> Archivos PDF </template>

            <template v-slot:prepend>
              <q-icon
                :color="
                  registry?.modificado_en === '' ? 'secondary' : 'primary'
                "
                name="picture_as_pdf"
              />
            </template>
          </q-file>
        </div>
      </q-list>
    </q-card>

    <q-dialog v-model="confirmDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6 text-grey-8">Confirmar Eliminación</div>
          <div class="q-mt-md text-grey-8">
            ¿Estás seguro que deseas eliminar este documento?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            color="primary"
            @click="confirmDialog = false"
          />
          <q-btn label="Eliminar" color="negative" @click="deleteConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>
