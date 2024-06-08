import { RouteRecordRaw } from 'vue-router';
import { useAppStore } from '../stores/useAppStore';
import multiguard from 'vue-router-multiguard';

const estaLogeado = (to, from, next) => {
  const appStore = useAppStore();
  if (appStore.estaLogeado === false) {
    return next({
      path: `/login/${appStore.appCodigo}`,
      query: { redirect: to.fullPath },
    });
  }
  return next();
};

const routes: RouteRecordRaw[] = [
  {
    path: '/editar_reclamo',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('src/pages/EditarReclamo/EditarReclamoPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/admin_usuario',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('src/pages/RevisarReclamo/RevisarReclamosPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/ingresar_registro',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('src/pages/IngresarRegistro/IngresarRegistroPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/revisar_registro',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('src/pages/RevisarRegistro/RevisarRegistroPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/cambiar_clave',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/CambiarClavePage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/resetear_clave/:ruc',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/ResetearClavePage.vue') },
    ],
  },
  {
    path: '/admin_bodega',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/Bodega/BodegaPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/reportes_reclamos',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/Reportes/ReportesPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/login/:appcodigo',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
