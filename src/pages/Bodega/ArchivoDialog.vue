<script setup lang="ts">
import { ref } from 'vue';
import { Archivo } from '../../components/models';

// Data
const path = ref<string>(process.env.IMAGE_PATH ?? '');
const alert = defineModel<boolean>('alert', { required: true });
const fotos = defineModel<Archivo[]>('fotos', { required: true });
const replacedPath = defineModel<string>('replacedPath', { required: true });
</script>

<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div
            class="text-left text-h6 text-grey-8"
            style="font-family: 'Bebas Neue'"
          >
            <strong>ARCHIVOS:</strong>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="fotos.length >= 1">
            <div v-for="(foto, index) in fotos" :key="index">
              <img
                class="q-ma-sm"
                :src="foto.path.replace(path as string, replacedPath as string)"
                style="max-height: 500px; max-width: 500px"
              />
              <q-separator inset />
            </div>
          </div>
          <div v-else>Ningún archivo adjunto</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cerrar"
            color="primary"
            @click="
              alert = false;
              fotos = [];
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
