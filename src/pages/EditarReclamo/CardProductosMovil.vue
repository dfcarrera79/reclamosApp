<script setup lang="ts">
import ReclamoMovil from './ReclamoComponentMovil.vue';
import { Detalle } from '../../components/models';

const detalles = defineModel<Detalle[]>('detalles', { required: true });

const emits = defineEmits([
  'procesarEnvio',
  'reset',
  'insertarFila',
  'quitarReclamo',
  'renovarComentario',
  'renovarMotivo',
  'renovarArchivo1',
  'renovarArchivo2',
  'renovarArchivo3',
]);

const procesarEnvio = () => {
  emits('procesarEnvio');
};

const reset = () => {
  emits('reset');
};

const insertarFila = (event: number) => {
  emits('insertarFila', event);
};

const quitarReclamo = (event: number) => {
  emits('quitarReclamo', event);
};

const renovarComentario = (event: Detalle) => {
  emits('renovarComentario', event);
};

const renovarMotivo = (event: Detalle) => {
  emits('renovarMotivo', event);
};

const renovarArchivo1 = (event: Detalle) => {
  emits('renovarArchivo1', event);
};

const renovarArchivo2 = (event: Detalle) => {
  emits('renovarArchivo2', event);
};

const renovarArchivo3 = (event: Detalle) => {
  emits('renovarArchivo3', event);
};
</script>

<template>
  <q-card
    class="q-mt-md"
    style="max-height: 95vh"
    bordered
    flat
    v-if="detalles.length !== 0"
  >
    <q-card-section class="q-pa-none">
      <div class="row no-wrap items-start q-mt-sm q-ml-sm">
        <p
          class="text-primary text-subtitle1 q-ma-none"
          style="font-family: 'Bebas Neue'"
        >
          PRODUCTOS EN RECLAMOS
        </p>
        <q-space />
        <q-btn
          class="q-ma-none q-mt-xs"
          size="sm"
          color="primary"
          label="Enviar"
          :disable="
            detalles.map((el) => el.comentario).includes('') ||
            detalles.map((el) => el.motivo.id_motivo).includes(0)
          "
          @click="procesarEnvio"
        />
        <q-btn
          class="q-ml-sm q-mt-xs"
          color="primary"
          outline
          size="sm"
          label="cancelar"
          @click="reset"
        >
          <q-tooltip> Elimina todos los reclamos </q-tooltip>
        </q-btn>
      </div>
      <div class="row no-wrap q-ma-sm">
        <p class="text-caption text-grey-8">
          Al finalizar de detallar los reclamos, dar click en
          <strong> ENVIAR</strong>.
        </p>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section style="max-height: 80vh" class="scroll q-pa-none q-ma-none">
      <div v-for="(detalle, index) in detalles" :key="index">
        <ReclamoMovil
          :detalle="detalle"
          @agregarFila="insertarFila($event)"
          @eliminarReclamo="quitarReclamo($event)"
          @actualizarComentario="renovarComentario($event)"
          @actualizarMotivo="renovarMotivo($event)"
          @actualizarArchivo1="renovarArchivo1($event)"
          @actualizarArchivo2="renovarArchivo2($event)"
          @actualizarArchivo3="renovarArchivo3($event)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
