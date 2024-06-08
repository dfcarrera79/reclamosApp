<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import {
  Archivo,
  FilasReclamos,
  ObjetosReclamos,
  RespuestaReclamos,
} from '../../components/models';
import RevisarData from './RevisarData.vue';
import VerificarVersion from '../VerificarVersionPage.vue';
import DetalleRevisarReclamo from './DetalleRevisarReclamo.vue';
import DetalleRevisarReclamoMovil from './DetalleRevisarReclamoMovil.vue';
import { useQuasar } from 'quasar';
import moment from 'moment';

// Data
const appStore = useAppStore();
const { get } = useAxios();
const $q = useQuasar();
$q.screen.setSizes({ sm: 300, md: 500, lg: 1000, xl: 2000 });
const estado = ref(null);
const reclamo = ref<ObjetosReclamos>({
  fecha_factura: '',
  ruc_reclamante: '',
  detalles: [],
});
const nombreEstado = ref('');
const alert = ref(false);
const fotos = ref<Archivo[]>([]);
const filas = ref<FilasReclamos[]>([]);

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
    nombreEstado.value = nuevoEstado(reclamo.value.detalles[0].estado);
    filas.value.push({
      estado: nombreEstado.value,
      ruc: reclamo.value.ruc_reclamante,
      nro_factura: reclamo.value.detalles[0].no_factura,
      nro_reclamo: reclamo.value.detalles[0].id_reclamo,
      fecha_reclamo: moment(reclamo.value.detalles[0].fecha_reclamo).format(
        'DD-MM-YYYY'
      ),
      fecha_enproceso: moment(reclamo.value.detalles[0].fecha_enproceso).format(
        'DD-MM-YYYY'
      ),
      fecha_finalizado: moment(
        reclamo.value.detalles[0].fecha_finalizado
      ).format('DD-MM-YYYY'),
      cliente: reclamo.value.detalles[0].nombre_reclamante,
      nombre_usuario: reclamo.value.detalles[0].nombre_usuario,
      respuesta_finalizado: reclamo.value.detalles[0].respuesta_finalizado,
      id_detalle: reclamo.value.detalles[0].id_detalle,
      reclamos: reclamo.value.detalles[0].reclamos,
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
      <DetalleRevisarReclamoMovil
        v-if="filas.length > 0 && $q.screen.lt.md"
        :filas="filas"
      />
      <DetalleRevisarReclamo
        v-if="filas.length > 0 && !($q.screen.lt.md || $q.screen.lt.sm)"
        :filas="filas"
      />
    </div>
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
                  :src="
                    foto.path.replace(
                      'C:\\Users\\dfcar\\Dropbox\\Developer\\Projects\\Reclamos\\fastapi_reclamos\\public\\imagenes_reclamos\\',
                      'http://localhost:8000/static/'
                    )
                  "
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
  </q-page>
</template>

<style scoped>
.my-card {
  width: 100%;
  max-width: 350px;
}

p {
  word-break: break-all;
  white-space: normal;
}
</style>