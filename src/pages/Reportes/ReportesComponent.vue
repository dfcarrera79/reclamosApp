<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useAxios } from '../../services/useAxios';
import { useMensajes } from '../../services/useMensajes';
import VerificarVersion from '../../components/VerificarVersion.vue';
import { getCurrentYear, monthOptions } from '../../services/useDateTime';
import { Meses, Reporte, RespuestaReporte } from '../../components/models';

// Data
const $q = useQuasar();
const { get } = useAxios();
const selectedYear = ref(null);
const reportes = ref<Reporte[]>([]);
const yearOptions = ref<number[]>([]);
const { mostrarError } = useMensajes();
const selectedMonth = ref<Meses | null>(null);

// Methods
const procesarFormulario = async () => {
  if (selectedMonth.value === null || selectedYear.value === null) {
    mostrarError(
      'Es necesario seleccionar un mes y un año para generar el reporte.',
      'center'
    );
    return;
  }

  const respuesta: RespuestaReporte = await get('/reclamo/obtener_reporte', {
    mes: selectedMonth.value.codigo,
    anio: selectedYear.value,
  });

  reportes.value = respuesta.objetos;
};

const sumarCount = (array: Reporte[]) => {
  return array.reduce((suma, item) => suma + item.count, 0);
};

onMounted(() => {
  const currentYear = getCurrentYear();
  const maxYear = currentYear + 2;
  for (let year = currentYear - 2; year <= maxYear; year++) {
    yearOptions.value.push(year);
  }
});
</script>

<template>
  <q-page padding :class="{ 'q-pt-none': $q.screen.lt.md }">
    <VerificarVersion />
    <q-form
      class="row"
      style="max-width: 800px"
      enctype="multipart/form-data"
      @submit.prevent="procesarFormulario"
    >
      <div
        :class="$q.screen.lt.md ? 'q-pa-xs q-ma-none' : 'q-ma-sm'"
        style="width: 120px"
      >
        <q-select
          dense
          outlined
          v-model="selectedMonth"
          :options="monthOptions"
          emit-value
          label="Mes"
          option-label="nombre"
        />
      </div>
      <div
        :class="$q.screen.lt.md ? 'q-pa-xs q-ma-none' : 'q-ma-sm'"
        style="width: 90px"
      >
        <q-select
          dense
          outlined
          v-model="selectedYear"
          :options="yearOptions"
          label="Año"
        />
      </div>
      <div :class="$q.screen.lt.md ? 'q-pa-xs q-ma-none' : 'q-ma-sm'">
        <q-btn
          outline
          color="primary"
          style="height: 40px; width: 148px"
          type="submit"
        >
          <div class="row items-center no-wrap q-pa-none">
            <div class="text-center text-caption">
              <strong>Generar reporte</strong>
            </div>
          </div>
        </q-btn>
      </div>
    </q-form>

    <div class="q-pa-md">
      <div v-for="(item, index) in reportes" :key="index" class="q-mt-sm">
        <q-linear-progress
          size="30px"
          :value="item.count / sumarCount(reportes)"
          color="secondary"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              text-color="primary"
              :label="item.nombre_motivo + ' (' + item.count + ')'"
            />
          </div>
        </q-linear-progress>
      </div>
    </div>
  </q-page>
</template>
