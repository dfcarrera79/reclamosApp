<template>
  <div>
    <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="320">
      <q-img
        fit="fill"
        class="absolute-top q-pa-sm"
        src="../assets/logo_apromed.png"
        style="height: 150px"
      />
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding>
          <q-item class="column">
            <q-separator inset />
            <div
              style="
                color: #636466;
                width: 300px;
                white-space: wrap;
                overflow: hidden;
              "
            >
              <div class="text-center">Bienvenido(a)</div>
              <div class="text-weight-bold text-center" style="color: #636466">
                {{ appStore.usuario.nombre_comercial }}
              </div>
            </div>
            <q-separator inset />
          </q-item>
          <q-item
            clickable
            v-ripple
            to="/editar_reclamo"
            @click="reset()"
            v-show="appStore.appCodigo !== 3 && appStore.appCodigo !== 4"
            active-class="my-menu-link"
            exact
          >
            <q-item-section avatar>
              <q-icon name="description" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                INGRESAR RECLAMO
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin_usuario"
            @click="reset()"
            v-show="appStore.appCodigo === 1 || appStore.appCodigo === 2"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="inbox" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REVISAR RECLAMO
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/ingresar_registro"
            @click="reset()"
            v-show="appStore.appCodigo === 3"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="inbox" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                INGRESAR REGISTRO
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/revisar_registro"
            @click="reset()"
            v-show="appStore.appCodigo === 3 || appStore.appCodigo === 4"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="picture_as_pdf" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                CONSULTAR REGISTRO
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/cambiar_clave"
            @click="reset()"
            v-show="
              appStore.appCodigo === appStore.APP_CLIENTE ||
              appStore.appCodigo === appStore.APP_USER
            "
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="password" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                CAMBIAR CLAVE
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin_bodega"
            @click="reset()"
            v-show="appStore.appCodigo === appStore.APP_USUARIO"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="inventory" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                BODEGA
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/reportes_reclamos"
            @click="reset()"
            v-show="appStore.appCodigo === appStore.APP_USUARIO"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="grey-8" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-secondary text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REPORTES
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useQuasar } from 'quasar';
import { useAppStore } from '../stores/useAppStore';

// Data
const $q = useQuasar();
$q.screen.setSizes({ sm: 300, md: 500, lg: 1000, xl: 2000 });
const appStore = useAppStore();
const leftDrawerOpen = inject<boolean>('leftDrawerOpen');

// Methods
const reset = () => {
  appStore.ruc = '';
  appStore.desde = null;
  appStore.hasta = null;
  appStore.factura = '';
};

// const leftDrawerOpen = ref(false);
</script>
