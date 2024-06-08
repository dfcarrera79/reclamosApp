<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import { useBodegaStore } from '../../stores/useBodegaStore';
import { ReclamoActualizado, Respuesta } from '../../components/models';

// Data
const $q = useQuasar();
const appStore = useAppStore();
const bodegaStore = useBodegaStore();
const { put } = useAxios();
const reclamoActualizado = ref<ReclamoActualizado>({
  id_reclamo: 0,
  estado: '',
  login_usuario: '',
  nombre_usuario: '',
  respuesta_finalizado: '',
});
const respuestaFinalizado = ref('');

// Methods
const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

const enviarEmail = async (email: string, respuestaFinalizado: string) => {
  try {
    const respuesta = await put(
      '/reclamo/respuestaReclamo',
      {},
      JSON.parse(
        JSON.stringify({
          email: email,
          respuesta: respuestaFinalizado,
        })
      )
    );
    deducirMensaje(respuesta);
  } catch (error) {
    console.error('Error enviando el email:', error);
  }
};

const actualizarReclamo = async (id: number, est: string, mail: string) => {
  reclamoActualizado.value = {
    id_reclamo: id,
    estado: est,
    login_usuario: appStore.usuario.ruc_cliente,
    nombre_usuario: appStore.usuario.razon_social,
    respuesta_finalizado: respuestaFinalizado.value,
  };
  await put(
    '/reclamo/actualizar_estado',
    {},
    JSON.parse(JSON.stringify(reclamoActualizado.value))
  );
  // Check if props.email is not an empty string
  if (mail !== '' && mail !== undefined) {
    // Call the method to send the email
    await enviarEmail(mail, respuestaFinalizado.value);
  }
  respuestaFinalizado.value = '';
  bodegaStore.actualizarFilas = true;
};
</script>

<template>
  <q-dialog v-model="appStore.confirmarFinalizado" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white" />
        <span class="q-ml-sm">Respuesta al cliente sobre el reclamo:</span>
      </q-card-section>
      <q-card-section class="q-pa-md" style="max-width: 300px">
        <q-input v-model="respuestaFinalizado" filled type="textarea" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancelar"
          color="primary"
          v-close-popup
          @click="appStore.select = false"
        />
        <q-btn
          flat
          label="Cambiar estado"
          color="primary"
          v-close-popup
          @click.prevent="
            actualizarReclamo(
              appStore.dialogo.id,
              appStore.dialogo.estado,
              appStore.dialogo.email
            )
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
