<script setup lang="ts">
import moment from 'moment';
import { inject, ref } from 'vue';
import { Documento } from '../../components/models';

// Data
const replacedPath = ref<string>(process.env.REPLACED_PATH ?? '');
const path = process.env.DOCUMENT_PATH;
const registry = inject<Documento>('registro');
const showDialog = inject<boolean>('showDialog');
const documents = inject<Documento[]>('documentos');

// Methods
const formatDateTime = (dateTimeString: string | undefined) => {
  const date = moment(dateTimeString);
  const formattedDate = date.format('DD/MM/YY HH:mm');
  return formattedDate;
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
      <div
        class="text-left text-h6 text-grey-8"
        style="font-family: 'Bebas Neue'"
      >
        <strong>ARCHIVOS </strong>
      </div>

      <q-list>
        <div>
          <p class="text-grey-8"><strong>Análisis de lote: </strong></p>
        </div>
        <template
          v-for="(document, index) in documents"
          :key="document.id_documento"
        >
          <q-item
            :clickable="document?.modificado_en !== ''"
            @click="downloadDocument(document?.path)"
          >
            <q-item-section avatar>
              <q-icon
                :color="
                  document?.modificado_en === '' ? 'secondary' : 'primary'
                "
                name="picture_as_pdf"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-secondary text-body2">
                <strong>Análisis de lote {{ index + 1 }}</strong>
              </q-item-label>
              <q-item-label v-if="document?.modificado_en !== ''" caption
                >Última modificación:
                {{ formatDateTime(document?.modificado_en) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <hr />
        <div>
          <p class="text-grey-8"><strong>Registro sanitario: </strong></p>
        </div>

        <q-item
          :clickable="registry?.modificado_en !== ''"
          @click="downloadDocument(registry?.path)"
          v-if="registry?.modificado_en !== ''"
        >
          <q-item-section avatar>
            <q-icon
              :color="registry?.modificado_en === '' ? 'secondary' : 'primary'"
              name="picture_as_pdf"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-secondary text-body2"
              ><strong>Registro sanitario</strong></q-item-label
            >
            <q-item-label caption
              >Última modificación:
              {{ formatDateTime(registry?.modificado_en) }}</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>
