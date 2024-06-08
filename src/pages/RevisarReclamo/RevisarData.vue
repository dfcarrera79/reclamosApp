<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/useAppStore';

// Datos
const appStore = useAppStore();
const ruc = ref(appStore.ruc);
ruc.value =
  appStore.appCodigo === appStore.APP_CLIENTE
    ? appStore.usuario.ruc_cliente
    : '';
</script>

<template>
  <div>
    <h4
      class="text-grey-8 q-my-md q-ml-none q-mr-md"
      style="font-family: 'Bebas Neue'"
      :class="{ 'q-ma-sm q-mt-md': $q.screen.lt.md }"
    >
      REVISAR RECLAMOS
    </h4>
    <div class="row wrap q-col-gutter-md" style="max-width: 800px">
      <div class="q-pr-sm q-pb-md">
        <q-input
          debounce="350"
          v-model="appStore.ruc"
          type="text"
          label="RUC"
          outlined
          dense
          clearable
          clear-icon="close"
          options-dense
          style="max-width: 210px"
        />
      </div>

      <div
        class="row no-wrap"
        :class="{ 'q-pa-none q-ml-sm': $q.screen.lt.md }"
      >
        <div class="q-pr-md q-pl-sm" style="max-width: 210px">
          <q-input
            v-model="appStore.desde"
            mask="date"
            outlined
            dense
            options-dense
            label="Fecha desde:"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="appStore.desde">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="q-pl-md" style="max-width: 200px">
          <q-input
            v-model="appStore.hasta"
            mask="date"
            outlined
            dense
            options-dense
            label="Fecha hasta:"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="appStore.hasta">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>
