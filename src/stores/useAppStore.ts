import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { LocalStorage } from 'quasar';
import { user } from '../components/models';
import { useMensajes } from '../services/useMensajes';

export const useAppStore = defineStore('oApp', () => {
  const { formatearFactura } = useMensajes();
  const APP_CLIENTE = ref(1);
  const APP_USUARIO = ref(2);
  const APP_ADMIN = ref(3);
  const APP_USER = ref(4);
  const numFilas = ref(0);
  const codigo_empresa_reclamos = ref(4);
  const urlApi = ref('');
  const appCodigo = ref(0);
  const appVersion = ref('1.0.5');
  const usuario = ref({ id: '', clave: '', ruc_cliente: '', razon_social: '' });
  const dialogo = ref({ id: 0, estado: '', email: '' });
  const estaLogeado = ref(false);
  const local = ref(false);
  const url = ref(window.location.href);
  const confirmar = ref(false);
  const confirmarFinalizado = ref(false);
  const select = ref(false);
  const cliente = ref('');
  const producto = ref({ art_nomlar: '', art_codigo: 0 });
  const desde = ref(null);
  const hasta = ref(null);
  const factura = ref('');
  const nuevaFactura = ref('');
  const ruc = ref('');

  const getFactura = computed(() => {
    nuevaFactura.value = formatearFactura(factura.value);
    return nuevaFactura.value;
  });

  const getURLApi = computed(() => {
    return urlApi.value;
  });

  const getHttpHeaders = computed(() => {
    return {
      'Content-Type': 'application/json',
      codigo_empresa: codigo_empresa_reclamos.value,
      ruc: usuario.value.id,
      clave: usuario.value.clave,
    };
  });

  const iniciarSession = (user: user, locale: boolean) => {
    usuario.value = user;
    estaLogeado.value = true;
    local.value = locale;
    LocalStorage.set('session', {
      usuario: usuario.value,
      estaLogeado: estaLogeado.value,
      appCodigo: appCodigo.value,
      currentURL: url.value,
      appVersion: appVersion.value,
      local: local.value,
    });
  };

  const setUrlApi = (url: string) => {
    urlApi.value = url;
  };

  const cerrarSession = () => {
    usuario.value = { id: '', clave: '', ruc_cliente: '', razon_social: '' };
    estaLogeado.value = false;
    LocalStorage.clear();
  };

  const actualizarRUC = (nuevoRuc: string) => {
    usuario.value.id = nuevoRuc;
  };

  return {
    APP_CLIENTE,
    APP_USUARIO,
    APP_ADMIN,
    APP_USER,
    numFilas,
    codigo_empresa_reclamos,
    urlApi,
    appCodigo,
    appVersion,
    usuario,
    dialogo,
    estaLogeado,
    local,
    url,
    confirmar,
    confirmarFinalizado,
    select,
    cliente,
    producto,
    desde,
    hasta,
    factura,
    ruc,
    getFactura,
    getURLApi,
    getHttpHeaders,
    iniciarSession,
    setUrlApi,
    cerrarSession,
    actualizarRUC,
  };
});

// export const useAppStore = defineStore('oApp', {
//   state: () => ({
//     APP_CLIENTE: 1,
//     APP_USUARIO: 2,
//     APP_ADMIN: 3,
//     APP_USER: 4,
//     numFilas: 0,
//     codigo_empresa_reclamos: 4,
//     urlApi: 'http://localhost:3009/v1/reclamos',
//     appCodigo: 0,
//     // usuario: { id: '', clave: '' },
//     usuario: { id: '', clave: '', ruc_cliente: '', razon_social: '' },
//     dialogo: { id: 0, estado: '', email: '' },
//     estaLogeado: false,
//     url: window.location.href,
//     confirmar: false,
//     confirmarFinalizado: false,
//     select: false,
//     cliente: '',
//     producto: { art_nomlar: '', art_codigo: 0 },
//     desde: null,
//     hasta: null,
//     factura: '',
//     ruc: '',
//   }),

//   getters: {
//     getURLApi(state) {
//       return state.urlApi;
//     },
//     getHttpHeaders(state) {
//       return {
//         'Content-Type': 'application/json',
//         codigo_empresa: state.codigo_empresa_reclamos,
//         ruc: state.usuario.id,
//         clave: state.usuario.clave,
//       };
//     },
//   },

//   actions: {
//     iniciarSession(usuario: user) {
//       this.usuario = usuario;
//       this.estaLogeado = true;
//       LocalStorage.set('session', {
//         usuario: this.usuario,
//         estaLogeado: this.estaLogeado,
//         appCodigo: this.appCodigo,
//         currentURL: this.url,
//       });
//     },
//     setUrlApi(url: string) {
//       this.urlApi = url;
//     },
//     cerrarSession() {
//       this.usuario = { id: '', clave: '', ruc_cliente: '', razon_social: '' };
//       this.estaLogeado = false;
//       LocalStorage.clear;
//     },
//     actualizarRUC(nuevoRuc: string) {
//       this.usuario.id = nuevoRuc;
//     },
//   },
// });
