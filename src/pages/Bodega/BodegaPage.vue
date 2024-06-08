<script setup lang="ts">
import { computed, ref } from 'vue';
import BodegaData from './BodegaData.vue';
import { useAxios } from '../../services/useAxios';
import BodegaDataMovil from './BodegaDataMovil.vue';
import { useAppStore } from '../../stores/useAppStore';
import VerificarVersion from '../VerificarVersionPage.vue';
import DetalleReclamoBodega from './DetalleReclamoBodega.vue';
import DetalleReclamoBodegaMovil from './DetalleReclamoBodegaMovil.vue';

// Data
const appStore = useAppStore();
const { get } = useAxios();
const estado = ref('');
const splitterModel = ref(20);

//  Methods
const whichEstado = computed(() => {
  if (
    estado.value !== '' &&
    appStore.ruc !== '' &&
    appStore.factura !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null
  ) {
    let nuevaFactura = appStore.getFactura;
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?ruc=${appStore.ruc}&desde=${appStore.desde}&hasta=${appStore.hasta}&factura=${nuevaFactura}`;
  } else if (
    appStore.desde !== null &&
    appStore.hasta !== null &&
    estado.value !== '' &&
    appStore.ruc !== ''
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?ruc=${appStore.ruc}&desde=${appStore.desde}&hasta=${appStore.hasta}`;
  } else if (
    estado.value !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null &&
    appStore.factura !== ''
  ) {
    let nuevaFactura = appStore.getFactura;
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?desde=${appStore.desde}&hasta=${appStore.hasta}&factura=${nuevaFactura}`;
  } else if (
    estado.value !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null &&
    appStore.cliente !== '' &&
    appStore.producto.art_codigo !== 0
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?desde=${
      appStore.desde
    }&hasta=${appStore.hasta}&cliente=${encodeURIComponent(
      appStore.cliente
    )}&producto=${encodeURIComponent(appStore.producto.art_codigo)}`;
  } else if (
    estado.value !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null &&
    appStore.cliente !== ''
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?desde=${
      appStore.desde
    }&hasta=${appStore.hasta}&cliente=${encodeURIComponent(appStore.cliente)}
    )}`;
  } else if (
    estado.value !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null &&
    appStore.producto.art_codigo !== 0
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?desde=${
      appStore.desde
    }&hasta=${appStore.hasta}&producto=${encodeURIComponent(
      appStore.producto.art_codigo
    )}`;
  } else if (
    estado.value !== '' &&
    appStore.desde !== null &&
    appStore.hasta !== null
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?desde=${appStore.desde}&hasta=${appStore.hasta}`;
  } else if (
    estado.value !== '' &&
    appStore.cliente !== '' &&
    appStore.producto.art_codigo !== 0
  ) {
    return `/reclamo/obtener_reclamos_por_estado/${
      estado.value
    }?cliente=${encodeURIComponent(
      appStore.cliente
    )}&producto=${encodeURIComponent(appStore.producto.art_codigo)}`;
  } else if (estado.value !== '' && appStore.ruc !== '') {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?ruc=${appStore.ruc}`;
  } else if (estado.value !== '' && appStore.factura !== '') {
    let nuevaFactura = appStore.getFactura;
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}?factura=${nuevaFactura}`;
  } else if (estado.value !== '' && appStore.cliente !== '') {
    return `/reclamo/obtener_reclamos_por_estado/${
      estado.value
    }?cliente=${encodeURIComponent(appStore.cliente)}`;
  } else if (estado.value !== '' && appStore.producto.art_codigo !== 0) {
    return `/reclamo/obtener_reclamos_por_estado/${
      estado.value
    }?producto=${encodeURIComponent(appStore.producto.art_codigo)}`;
  } else if (estado.value !== '') {
    return `/reclamo/obtener_reclamos_por_estado/${estado.value}`;
  } else {
    return '';
  }
});

const obtenerPaginas = async () => {
  let nuevaFactura = appStore.getFactura;
  const respuesta = await get(`/reclamo/obtener_paginas/${estado.value}`, {
    factura: nuevaFactura,
    ruc: appStore.ruc,
    cliente: appStore.cliente,
    producto: appStore.producto.art_codigo,
    desde: appStore.desde,
    hasta: appStore.hasta,
  });

  if (respuesta.error === 'S') {
    console.error('Error', respuesta.mensaje);
    return '';
  }
  appStore.numFilas = respuesta.objetos;
};

const query = ref(whichEstado);
</script>

<template>
  <q-page padding>
    <VerificarVersion />
    <BodegaData class="gt-xs" />
    <BodegaDataMovil class="xs" />

    <q-card flat class="full-width gt-xs q-pa-none">
      <q-tabs
        v-model="estado"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          name="PEN"
          icon="pending"
          label="Pendientes"
          @click="obtenerPaginas"
        />
        <q-tab
          name="PRO"
          icon="timelapse"
          label="En proceso"
          @click="obtenerPaginas"
        />
        <q-tab
          name="FIN"
          icon="check_circle"
          label="Finalizados"
          @click="obtenerPaginas"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="estado" animated>
        <q-tab-panel name="PEN" class="q-pa-none">
          <DetalleReclamoBodega :estado="estado" :query="query" />
        </q-tab-panel>
        <q-tab-panel name="PRO" class="q-pa-none">
          <DetalleReclamoBodega :estado="estado" :query="query" />
        </q-tab-panel>
        <q-tab-panel name="FIN" class="q-pa-none">
          <DetalleReclamoBodega :estado="estado" :query="query" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-splitter class="xs" v-model="splitterModel" horizontal>
      <template v-slot:before>
        <q-tabs
          v-model="estado"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          outlined
        >
          <q-tab
            name="PEN"
            icon="pending"
            label="Pendientes"
            @click="obtenerPaginas"
          />
          <q-tab
            name="PRO"
            icon="timelapse"
            label="En proceso"
            @click="obtenerPaginas"
          />
          <q-tab
            name="FIN"
            icon="check_circle"
            label="Finalizados"
            @click="obtenerPaginas"
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="estado"
          animated
          swipeable
          transition-prev="jump-up"
          transition-next="jump-up"
          outlined
          class="q-ma-none q-pa-none"
        >
          <q-tab-panel name="PEN" class="q-ma-none q-pa-none">
            <DetalleReclamoBodegaMovil :estado="estado" :query="query" />
          </q-tab-panel>
          <q-tab-panel name="PRO" class="q-ma-none q-pa-none">
            <DetalleReclamoBodegaMovil :estado="estado" :query="query" />
          </q-tab-panel>
          <q-tab-panel name="FIN" class="q-ma-none q-pa-none">
            <DetalleReclamoBodegaMovil :estado="estado" :query="query" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </q-page>
</template>
