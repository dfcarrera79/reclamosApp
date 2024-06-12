<script setup lang="ts">
import { useAxios } from '../services/useAxios';
import { useRouter, useRoute } from 'vue-router';
import { SessionData } from '../components/models';
import { useAppStore } from '../stores/useAppStore';
import { useMensajes } from '../services/useMensajes';
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar, QSpinnerFacebook, LocalStorage } from 'quasar';

// Data
const router = useRouter();
const route = useRoute();
const isPwd = ref(true);
const $q = useQuasar();
const appStore = useAppStore();
const { get, put } = useAxios();
const { mostrarMensaje } = useMensajes();
const url = ref(appStore.url);
const newUrl = ref(url.value.slice(url.value.indexOf('#') + 1));

const mostrarVentana = ref(false);
const correoElectronico = ref('');
const ruc = ref('');

const rucRule: ((v: string) => string | boolean)[] = [
  (v: string) => !!v || 'El RUC es obligatorio',
  (v: string) => /^\d{13}$/.test(v) || 'El RUC debe contener 13 dígitos',
];

const emailRule: ((v: string) => string | boolean)[] = [
  (v: string) => !!v || 'El correo electrónico es obligatorio',
  (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
    'Formato de correo electrónico inválido',
];

// Methods
const labelText = computed(() => {
  if (
    appStore.appCodigo === appStore.APP_CLIENTE ||
    appStore.appCodigo === appStore.APP_USER
  ) {
    return 'No. RUC';
  } else {
    return 'Login';
  }
});

const funcionIr = () => {
  const baseUrl = 'http://192.168.1.50:3006/#/login/';

  switch (appStore.appCodigo) {
    case 1:
      window.open(`${baseUrl}1`, '_blank');
      break;
    case 2:
      window.open(`${baseUrl}2`, '_blank');
      break;
    case 3:
      window.open(`${baseUrl}3`, '_blank');
      break;
    case 4:
      window.open(`${baseUrl}4`, '_blank');
      break;
    default:
      break;
  }

  // const baseUrl = 'http://192.168.50.10:3008/#/login/';
  // switch (appStore.appCodigo) {
  //     case 1:
  //       window.location.replace(`${baseUrl}1`);
  //       break;
  //     case 2:
  //       window.location.replace(`${baseUrl}2`);
  //       break;
  //     case 3:
  //       window.location.replace(`${baseUrl}3`);
  //       break;
  //     case 4:
  //       window.location.replace(`${baseUrl}4`);
  //       break;
  //     default:
  //       break;
  //   }
};

onMounted(async () => {
  appStore.appCodigo = 2;

  const apiUrl =
    process.env.API_URL ||
    'https://apromedfarmaloja-cloud.com:3010/v1/reclamos';

  // const apiUrl = process.env.API_URL || 'http://192.168.1.50:3009/v1/reclamos';

  appStore.setUrlApi(apiUrl);
  // appStore.setUrlApi('http://192.168.1.50:3009/v1/reclamos');

  // if (appStore.local) {
  //   appStore.setUrlApi('http://192.168.1.50:3009/v1/reclamos');
  // } else {
  //   appStore.setUrlApi(process.env.API_URL);
  // }

  const respuesta = await get('/usuario/obtenerVersion', {});

  if (respuesta.error === 'N') {
    appStore.appVersion = respuesta.objetos;
  }

  appStore.appCodigo = parseInt(route.params.appcodigo as string);
  const session: SessionData | null = LocalStorage.getItem('session');

  if (session) {
    appStore.appCodigo = session.appCodigo;
    appStore.iniciarSession(session.usuario);
    router.push(newUrl.value);
  }
});

const getTitleApp = computed(() =>
  appStore.appCodigo <= 2
    ? `PORTAL DE RECLAMOS V${appStore.appVersion}`
    : `PORTAL DE DOCUMENTOS V${appStore.appVersion}`
);

watch(
  () => route.params.appcodigo,
  async () => (appStore.appCodigo = parseInt(route.params.appcodigo as string))
);

const logearse = async () => {
  if (appStore.usuario.id.trim().length === 0) {
    mostrarMensaje(
      'Error',
      appStore.appCodigo === appStore.APP_CLIENTE ||
        appStore.appCodigo === appStore.APP_USER
        ? 'Ingrese su número de RUC'
        : 'Ingrese su login'
    );
    return;
  }
  if (appStore.usuario.clave.trim().length === 0) {
    mostrarMensaje('Error', 'Es obligatorio ingresar su clave de acceso');
    return;
  }
  $q.loading.show({
    spinner: QSpinnerFacebook,
    message: 'Verificando acceso...',
  });
  const respuesta = await get('/usuario/validarUsuario', {
    id: appStore.usuario.id,
    clave: appStore.usuario.clave,
    appCodigo: appStore.appCodigo,
  });
  $q.loading.hide();
  if (respuesta.error === 'S') {
    mostrarMensaje('Error', respuesta.mensaje);
    return;
  }
  appStore.iniciarSession(respuesta.objetos);

  switch (appStore.appCodigo) {
    case appStore.APP_CLIENTE:
    case appStore.APP_USUARIO:
      router.push('/editar_reclamo');
      break;
    case appStore.APP_ADMIN:
      router.push('/ingresar_registro');
      break;
    case appStore.APP_USER:
      router.push('/revisar_registro');
      break;
    default:
      break;
  }
};

const recuperarContraseña = () => {
  mostrarVentana.value = true;
};

const enviarCorreoRecuperacion = async () => {
  try {
    await put(
      '/usuario/resetearClave',
      {},
      JSON.parse(
        JSON.stringify({
          email: correoElectronico.value,
          ruc: ruc.value,
        })
      )
    );

    mostrarVentana.value = false;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
</script>

<template>
  <q-page class="flex flex-center bg-image">
    <q-dialog v-model="mostrarVentana" persistent>
      <q-card>
        <div class="row bg-blue-grey-8 justify-center q-pa-xs">
          <span class="text-subtitle2 text-center text-white"
            >Cambiar clave de acceso</span
          >
        </div>
        <q-card-section>
          <q-input
            v-model="ruc"
            debounce="750"
            label="RUC | CI | Pasaporte"
            dense
            :rules="rucRule"
          />
          <q-input
            v-model="correoElectronico"
            debounce="750"
            label="Email"
            dense
            :rules="emailRule"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Enviar"
            @click="enviarCorreoRecuperacion()"
            :disable="!ruc || !correoElectronico"
          />
          <q-btn flat label="Cerrar" @click="mostrarVentana = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-card class="shadow-8 bg-white" style="width: 300px; height: 260px">
      <div class="row bg-blue-8 justify-center q-pa-xs">
        <span
          class="text-h6 text-center text-white"
          style="font-family: 'Bebas Neue'"
          >{{ getTitleApp }}</span
        >
      </div>
      <div class="row">
        <div class="column col-xs-12 q-pa-sm">
          <q-input
            v-model="appStore.usuario.id"
            type="text"
            :label="labelText"
            dense
          />
        </div>
        <div class="column col-xs-12 q-pa-sm">
          <q-input
            dense
            v-model="appStore.usuario.clave"
            :type="isPwd ? 'password' : 'text'"
            label="Clave - Por defecto su Identificación"
            @keyup.enter="logearse()"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
              <q-tooltip
                class="bg-grey-6 text-caption"
                anchor="bottom middle"
                self="center middle"
              >
                {{ isPwd ? 'Mostrar clave' : 'Ocultar clave' }}
              </q-tooltip>
            </template>
          </q-input>
        </div>
      </div>
      <q-separator dark />
      <div class="row">
        <div class="column col-xs-12 q-pa-sm">
          <q-btn
            class="full-width text-white"
            style="height: 40px"
            color="blue"
            label="Ingresar"
            @click="logearse()"
          />
        </div>
      </div>

      <div class="q-pl-sm q-pt-sm">
        <q-btn
          outline
          rounded
          color="primary"
          label="Conexión local"
          size="sm"
          @click="funcionIr"
        />
      </div>

      <div class="row">
        <div
          class="column col-xs-12 q-pa-sm"
          v-show="appStore.appCodigo === 1 || appStore.appCodigo === 4"
        >
          <a
            class="full-width text-secondary q-link"
            style="
              display: block;
              height: 40px;
              line-height: 40px;
              text-align: center;
            "
            @click="recuperarContraseña()"
          >
            <span class="hover-primary text-bold"
              >¿OLVIDASTE TU CONTRASEÑA?</span
            >
          </a>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.bg-image {
  background-image: url('../assets/background.jpg');
  background-repeat: repeat;
  background-size: cover;
}
</style>
