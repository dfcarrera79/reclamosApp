<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAxios } from '../services/useAxios';
import { LocalStorage, useQuasar } from 'quasar';
import { SessionData } from '../components/models';
import { useAppStore } from '../stores/useAppStore';
import { useMensajes } from '../services/useMensajes';

// Data
const $q = useQuasar();
const version = ref('');
const { get } = useAxios();
const appStore = useAppStore();
const { mostrarMensaje } = useMensajes();

// Methods
onMounted(async () => {
  let session: SessionData | null = LocalStorage.getItem('session');
  const localVersion = session?.appVersion;

  const respuesta = await get('/usuario/obtenerVersion', {});
  appStore.appVersion = respuesta.objetos;
  if (respuesta.error === 'S') {
    mostrarMensaje(respuesta.mensaje, 'error');
    return;
  }

  if (respuesta.error === 'N') {
    version.value = respuesta.objetos;

    if (version.value != localVersion) {
      $q.dialog({
        title: 'Actualización disponible',
        message:
          'Hay una nueva versión disponible. Por favor, actualiza la página.',
        position: 'top',
        ok: {
          push: true,
        },
        cancel: {
          push: true,
          color: 'negative',
        },
      })
        .onOk(() => {
          // Actualiza la versión en el objeto session
          if (session) {
            session.appVersion = version.value;
            LocalStorage.set('session', session);
          }
          // Recarga la página
          window.location.reload();
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }
  }
});
</script>

<template>
  <div></div>
</template>
