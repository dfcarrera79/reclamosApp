<script setup lang="ts">
import {
  Archivo,
  FilasReclamos,
  ObjetosReclamos,
  RespuestaReclamos,
} from '../../components/models';
import moment from 'moment';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import RevisarData from './RevisarData.vue';
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import VerificarVersion from '../VerificarVersionPage.vue';
import ArchivoDialog from '../../components/ArchivoDialog.vue';
import DetalleRevisarReclamo from './DetalleRevisarReclamo.vue';
import DetalleRevisarReclamoMovil from './DetalleRevisarReclamoMovil.vue';

// Data
const reclamo = ref<ObjetosReclamos>({
  fecha_factura: '',
  ruc_reclamante: '',
  detalles: [],
});
const $q = useQuasar();
const estado = ref(null);
const alert = ref(false);
const { get } = useAxios();
const nombreEstado = ref('');
const appStore = useAppStore();
const fotos = ref<Archivo[]>([]);
const filas = ref<FilasReclamos[]>([]);
$q.screen.setSizes({ sm: 300, md: 500, lg: 1000, xl: 2000 });

// Methods
const whichEstado = computed(() => {
  if (
    appStore.desde !== null &&
    appStore.hasta !== null &&
    appStore.ruc !== ''
  ) {
    return `/reclamo/obtener_reclamo_por_ruc/${appStore.ruc}?desde=${appStore.desde}&hasta=${appStore.hasta}`;
  } else if (estado.value !== null && appStore.ruc !== '') {
    return `/reclamo/obtener_reclamo_por_ruc/${appStore.ruc}?estado=${estado.value}`;
  } else if (appStore.ruc !== '') {
    return `/reclamo/obtener_reclamo_por_ruc/${appStore.ruc}`;
  } else {
    return '';
  }
});

const query = ref(whichEstado);

const nuevoEstado = (est: string) => {
  if (est === 'PEN') {
    return 'Pendiente';
  } else if (est === 'PRO') {
    return 'En proceso';
  } else if (est === 'FIN') {
    return 'Finalizado';
  } else {
    return '';
  }
};

const whichQuery = async () => {
  const respuesta: RespuestaReclamos = await get(query.value, {});
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return '';
  }
  reclamo.value = respuesta.objetos;
  filas.value = [];
  if (reclamo.value.fecha_factura !== undefined) {
    reclamo.value.detalles.forEach((detalle) => {
      nombreEstado.value = nuevoEstado(detalle.estado);
      filas.value.push({
        estado: nombreEstado.value,
        ruc: reclamo.value.ruc_reclamante,
        nro_factura: detalle.no_factura,
        nro_reclamo: detalle.id_reclamo,
        fecha_reclamo: moment(detalle.fecha_reclamo).format('DD-MM-YYYY'),
        fecha_enproceso: detalle.fecha_enproceso
          ? moment(detalle.fecha_enproceso).format('DD-MM-YYYY')
          : null,
        fecha_finalizado: detalle.fecha_finalizado
          ? moment(detalle.fecha_finalizado).format('DD-MM-YYYY')
          : null,
        cliente: detalle.nombre_reclamante,
        nombre_usuario: detalle.nombre_usuario,
        respuesta_finalizado: detalle.respuesta_finalizado,
        id_detalle: detalle.id_detalle,
        reclamos: detalle.reclamos,
      });
    });
  }
};

watch(query, () => whichQuery());
</script>

<template>
  <q-page padding :class="{ 'q-pt-none': $q.screen.lt.md }">
    <VerificarVersion />
    <RevisarData />
    <q-btn
      outline
      rounded
      color="primary"
      label="Consultar"
      @click="whichQuery"
      v-show="false"
    />
    <div
      class="fit row no-wrap justify-start items-start content-start"
      v-if="filas.length === 0"
    >
      <div class="column no-wrap items-center" style="margin-top: 20px">
        <p class="text-secondary text-h5" style="font-family: 'Bebas Neue'">
          CONSULTE EL ESTADO DE SUS RECLAMOS
        </p>
        <p class="text-secondary text-body2">
          <strong>Ingrese el ruc para consultar el reclamo </strong>
        </p>
        <p class="text-secondary text-body2">
          <strong
            >OPCIONAL: Puede filtrar su consulta ingresando un rango de fechas
            (desde - hasta)
          </strong>
        </p>
      </div>
    </div>

    <div class="q-pa-none">
      <DetalleRevisarReclamo
        v-if="filas.length > 0 && !($q.screen.lt.md || $q.screen.lt.sm)"
        v-model:filas="filas"
      />
      <DetalleRevisarReclamoMovil
        v-if="filas.length > 0 && $q.screen.lt.md"
        v-model:filas="filas"
      />
    </div>
    <ArchivoDialog v-model:alert="alert" v-model:fotos="fotos" />
  </q-page>
</template>

<style scoped>
@import '../../css/detalle.reclamo.scss';
</style>
