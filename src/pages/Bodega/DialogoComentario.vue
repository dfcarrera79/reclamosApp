<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAxios } from '../../services/useAxios';
import { Respuesta } from '../../components/models';

const $q = useQuasar();
const cambiar = defineModel<boolean>('editarComentario', { required: true });
const idReclamo = defineModel<number>('idReclamo', { required: true });

const comentario = ref<string>('');

const emits = defineEmits(['renovarMotivo']);

const { put } = useAxios();

const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

const handleCancelar = () => {
  comentario.value = '';
  cambiar.value = false;
};

const handleCambiar = async () => {
  const respuesta = await put(
    '/reclamo/insertar_comentario',
    {},
    JSON.parse(
      JSON.stringify({
        id_reclamo: idReclamo.value,
        comentario: comentario.value,
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
        <div class="text-h6">Comentario</div>
        <div class="q-pa-md" style="max-width: 300px">
          <q-input v-model="comentario" type="textarea" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="red" label="CANCELAR" @click="handleCancelar" />
        <q-btn
          flat
          label="MODIFICAR"
          @click="handleCambiar"
          :disable="!comentario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
