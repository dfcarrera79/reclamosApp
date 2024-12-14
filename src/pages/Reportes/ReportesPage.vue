<script setup lang="ts">
import { ref } from 'vue';
import ReportesComponent from './ReportesComponent.vue';
import ReportesVendedoresComponent from './ReportesVendedoresComponent.vue';

// Data
const tab = ref('');
</script>

<template>
  <div class="q-pt-sm">
    <h4
      class="row text-uppercase justify-center content-center q-my-sm q-pb-md"
      style="font-family: 'Bebas Neue'"
    >
      <div class="q-pt-sm gt-xs">REPORTES DE RECLAMOS</div>
    </h4>
  </div>
  <div class="q-gutter-y-sm">
    <q-card flat>
      <q-tabs
        v-model="tab"
        dense
        active-color="primary"
        indicator-color="primary"
        style="font-family: 'Oswald'"
        align="justify"
        narrow-indicator
      >
        <q-tab name="reportes" label="General" />
        <q-tab name="vendedores" label="Por vendedores" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="reportes">
          <ReportesComponent />
        </q-tab-panel>
        <q-tab-panel name="vendedores">
          <ReportesVendedoresComponent />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
