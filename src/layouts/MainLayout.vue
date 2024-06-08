<script setup lang="ts">
import { provide, ref } from 'vue';
import DrawerDesktop from './DrawerDesktop.vue';
import DrawerMobile from './DrawerMobile.vue';
import { LocalStorage, useQuasar } from 'quasar';
import { useAppStore } from '../stores/useAppStore';

// Data
const $q = useQuasar();
$q.screen.setSizes({ sm: 300, md: 500, lg: 1000, xl: 2000 });
const appStore = useAppStore();
const win: Window = window;
// const miniState = ref(true);

// Methods
const cerrarSesion = () => {
  win.location = 'https://apromedloja.com/';
  LocalStorage.clear();
};

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

/* provided variables */
provide('leftDrawerOpen', leftDrawerOpen);
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="text-grey-9" style="background-color: #636466">
      <q-toolbar class="fit row wrap justify-between items-start content-start">
        <div class="row">
          <q-btn
            dense
            flat
            round
            style="color: #ee7600"
            icon="menu"
            @click="toggleLeftDrawer"
          />

          <q-toolbar-title
            class="gt-xs text-h4 row"
            style="font-family: 'Bebas Neue'; color: #ee7600"
          >
            <div
              class="q-mr-md"
              v-if="appStore.appCodigo === 1 || appStore.appCodigo === 2"
            >
              RECLAMOS APP V{{ appStore.appVersion }}
            </div>
            <div
              class="q-mr-md"
              v-if="appStore.appCodigo === 3 || appStore.appCodigo === 4"
            >
              DOCUMENTOS APP V{{ appStore.appVersion }}
            </div>
            <q-separator vertical inset />
            <div class="q-ml-md gt-xs">Apromed S.A.S.</div>
          </q-toolbar-title>

          <q-toolbar-title
            class="xs text-h5 row"
            style="font-family: 'Bebas Neue'; color: #ee7600"
          >
            <div
              class="q-mr-md"
              v-if="appStore.appCodigo === 1 || appStore.appCodigo === 2"
            >
              RECLAMOS APP V{{ appStore.appVersion }}
            </div>
            <div
              class="q-mr-md"
              v-if="appStore.appCodigo === 3 || appStore.appCodigo === 4"
            >
              DOCUMENTOS APP V{{ appStore.appVersion }}
            </div>
            <q-separator vertical inset />
            <div class="q-ml-md gt-xs">Apromed S.A.S.</div>
          </q-toolbar-title>
        </div>

        <div class="row items-center content-center q-mr-md">
          <q-btn flat dense style="color: #ee7600" @click="cerrarSesion">
            <div class="q-mr-sm gt-xs">Salir</div>
            <q-icon left name="logout" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <DrawerDesktop class="gt-xs" />
    <DrawerMobile class="xs" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.my-menu-link {
  color: white;
  background: #ee7600;
}
</style>
