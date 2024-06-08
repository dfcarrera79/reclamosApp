<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore';

const appStore = useAppStore();
const ruc = defineModel<string>('ruc', { required: true });
const factura = defineModel<string>('factura', { required: true });

/* defined emits*/
const emit = defineEmits(['procesarFormulario']);

const enviarFormulario = () => {
  emit('procesarFormulario');
};
</script>

<template>
  <q-form
    class="row"
    style="max-width: 800px"
    enctype="multipart/form-data"
    @submit.prevent="enviarFormulario"
  >
    <div class="col-12 text-grey-8 gt-xs">
      <p>
        <strong>Nota:</strong> Una vez enviado el reclamo, este no se puede
        editar.
      </p>
    </div>
    <div class="row gt-xs">
      <q-input
        class="q-ma-sm"
        debounce="350"
        v-model="ruc"
        type="text"
        label="RUC"
        :disable="appStore.appCodigo === appStore.APP_CLIENTE"
        outlined
        dense
        options-dense
        clearable
        clear-icon="close"
      />
      <q-input
        class="q-ma-sm"
        debounce="350"
        label="Número de factura"
        v-model="factura"
        hint="Ej: 001-003-421"
        outlined
        clearable
        clear-icon="close"
        dense
        options-dense
      />
      <q-btn
        class="q-ma-sm"
        outline
        color="primary"
        style="height: 40px; width: 183px"
        type="submit"
      >
        <div class="row items-center no-wrap q-pa-none">
          <div class="text-center text-caption">
            <strong>Consultar productos</strong>
          </div>
        </div>
      </q-btn>
    </div>
    <div class="xs">
      <div class="row no-wrap">
        <q-input
          class="q-ma-sm"
          debounce="350"
          v-model="ruc"
          type="text"
          label="RUC"
          :disable="appStore.appCodigo === appStore.APP_CLIENTE"
          outlined
          dense
          options-dense
          clearable
          clear-icon="close"
        />
        <q-input
          class="q-ma-sm"
          debounce="350"
          label="Número de factura"
          v-model="factura"
          hint="Ej: 001-003-421"
          outlined
          clearable
          clear-icon="close"
          dense
          options-dense
        />
        <q-btn
          class="q-ma-sm"
          round
          color="primary"
          style="height: 40px; width: 40px"
          type="submit"
          icon="search"
        />
      </div>
    </div>
  </q-form>
</template>
