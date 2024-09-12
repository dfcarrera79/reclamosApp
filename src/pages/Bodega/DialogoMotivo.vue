<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';
import { useAxios } from '../../services/useAxios';
import { Motivo, Respuesta } from '../../components/models';

const $q = useQuasar();
const cambiar = defineModel<boolean>('cambiar', { required: true });
const idProducto = defineModel<boolean>('idProducto', { required: true });
const numReclamo = defineModel<boolean>('numReclamo', { required: true });

const emits = defineEmits(['renovarMotivo']);

const motivo = ref<Motivo>({
  id_motivo: 0,
  nombre_motivo: '',
  prioridad: 0,
});

const motivos = ref<Motivo[]>([]);

const { get, put } = useAxios();

const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

onMounted(async () => {
  const respuesta = await get('/motivo/obtener_motivos', {});
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return;
  }
  motivos.value = respuesta.objetos;
});

const handleCancelar = () => {
  motivo.value = {
    id_motivo: 0,
    nombre_motivo: '',
    prioridad: 0,
  };
  cambiar.value = false;
};

const handleCambiar = async () => {
  const respuesta = await put(
    '/reclamo/cambiar_motivo',
    {},
    JSON.parse(
      JSON.stringify({
        id_producto: idProducto.value,
        id_motivo: motivo.value.id_motivo,
        prioridad: motivo.value.prioridad,
        nombre_motivo: motivo.value.nombre_motivo,
        id_reclamo: numReclamo.value,
      })
    )
  );

  if (respuesta.error === 'N') {
    emits('renovarMotivo');
    deducirMensaje(respuesta);
  }

  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return;
  }
  cambiar.value = false;
};
</script>

<template>
  <q-dialog
    v-model="cambiar"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="bg-teal text-white" style="width: 300px">
      <q-card-section>
        <div class="text-h6">Cambiar Motivo</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Seleccione el nuevo motivo:
        <q-select
          class="col-4 bg-white"
          debounce="350"
          label="Motivo"
          v-model="motivo"
          :options="motivos"
          option-value="id_motivo"
          option-label="nombre_motivo"
          outlined
          dense
          options-dense
        />
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn
          flat
          label="CAMBIAR"
          :disable="motivo.id_motivo == 0"
          @click="handleCambiar"
        />
        <q-btn flat label="CANCELAR" @click="handleCancelar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
