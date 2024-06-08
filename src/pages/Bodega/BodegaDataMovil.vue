<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useAxios } from '../../services/useAxios';
import { useAppStore } from '../../stores/useAppStore';
import {
  Productos,
  RespuestaResponse,
  RespuestaNumeroProductos,
} from '../../components/models';

// Datos
const { get } = useAxios();
const appStore = useAppStore();
const ruc = ref(appStore.ruc);
ruc.value =
  appStore.appCodigo === appStore.APP_CLIENTE
    ? appStore.usuario.ruc_cliente
    : '';
const stringOptions = ref<string[]>([]);
const options = ref<string[]>([]);
const opcionesProductos = ref<Productos[]>([]);
const value = ref(true);
const pageSize = 50;
const numeroProductos = ref(0);
const nextPage = ref(1);
const loading = ref(false);
const filtrandoProductos = ref(false); // Agregar una bandera de control
const filtrado = ref('');

// Computed
const lastPage = computed(() => {
  return Math.ceil(numeroProductos.value / pageSize);
});

//Methods
onMounted(async () => {
  obtenerReclamos();
  obtenerProductos(1, pageSize, '');
  obtenerNumeroDeProductos();
});

const obtenerReclamos = async () => {
  const respuesta: RespuestaResponse = await get(
    '/reclamo/obtener_reclamos',
    {}
  );
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return [];
  }
  stringOptions.value = respuesta.objetos.map((el) => el.razon_social);
};

const obtenerProductos = async (
  pagina: number,
  rowsNumber: number,
  name: string
) => {
  const respuesta = await get('/reclamo/obtener_solo_productos', {
    numeroDePagina: pagina,
    registrosPorPagina: rowsNumber,
    nombre: name,
  });
  opcionesProductos.value.push(...respuesta.objetos);
};

const obtenerNumeroDeProductos = async () => {
  const respuesta: RespuestaNumeroProductos = await get(
    '/reclamo/obtener_numero_productos',
    {}
  );

  if (respuesta.error === 'S') {
    console.error('Error', respuesta.mensaje);
    return '';
  }
  numeroProductos.value = respuesta.objetos[0].num_productos;
};

const filterFn = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      options.value = stringOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options.value = stringOptions.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1
    );
  });
};

const filterProductsFn = (
  val: string,
  update: (callback: () => void) => void
) => {
  filtrado.value = val.toUpperCase();
  if (val === '') {
    update(() => {
      filtrandoProductos.value = false;
      opcionesProductos.value = [];
      obtenerProductos(1, pageSize, '');
    });
    return;
  }

  update(async () => {
    filtrandoProductos.value = true;
    opcionesProductos.value = [];
    obtenerProductos(1, pageSize, filtrado.value);
  });
};

const onScroll = ({ to, ref }: { to: number; ref: any }) => {
  const lastIndex = opcionesProductos.value.length - 1;
  if (
    loading.value !== true &&
    nextPage.value < lastPage.value &&
    to === lastIndex &&
    lastIndex >= pageSize - 1
  ) {
    loading.value = true;
    setTimeout(() => {
      nextPage.value++;
      nextTick(() => {
        ref.refresh();
        loading.value = false;
      });
    }, 700);
  }
};

watch(nextPage, async () => {
  obtenerProductos(nextPage.value, pageSize, filtrado.value);
});
</script>

<template>
  <div>
    <h4 class="text-grey-8 q-ma-xs" style="font-family: 'Bebas Neue'">
      BANDEJA DE RECLAMOS
    </h4>

    <q-item class="q-pt-none">
      <q-item-section avatar>
        <q-toggle keep-color v-model="value" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-grey-8"
          >Filtrar por cliente - producto</q-item-label
        >
      </q-item-section>
    </q-item>

    <div class="column q-col-gutter-md" style="max-width: 800px">
      <div class="q-px-md" v-if="value">
        <q-select
          dense
          filled
          v-model="appStore.cliente"
          clearable
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          label="Cliente"
          :options="options"
          @filter="filterFn"
          style="width: 350px"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="q-px-md" v-if="value">
        <q-select
          dense
          filled
          v-model="appStore.producto"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          label="Producto"
          :loading="loading"
          :options="opcionesProductos"
          option-label="art_nomlar"
          @filter="filterProductsFn"
          style="width: 350px"
          @virtual-scroll="onScroll"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Sin resultados
              </q-item-section>
            </q-item>
          </template>
          <template v-if="appStore.producto.art_codigo != 0" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="
                appStore.producto = { art_nomlar: '', art_codigo: 0 }
              "
              class="cursor-pointer"
            />
          </template>
        </q-select>
      </div>

      <div class="row no-wrap" v-if="!value">
        <div class="q-pa-none q-mr-sm q-gutter-md" style="max-width: 210px">
          <p class="col-6 text-grey-8"><strong> Ruc del cliente:</strong></p>
          <q-input
            v-model="appStore.ruc"
            type="text"
            label="RUC"
            debounce="350"
            :disable="appStore.appCodigo === appStore.APP_CLIENTE"
            outlined
            dense
            options-dense
            clearable
            clear-icon="close"
          />
        </div>

        <div
          class="q-pa-none q-gutter-md"
          style="max-width: 210px"
          v-if="!value"
        >
          <p class="col-6 text-grey-8"><strong> Factura:</strong></p>
          <q-input
            label="Ej: 001-003-421"
            v-model="appStore.factura"
            debounce="350"
            outlined
            clearable
            clear-icon="close"
            dense
            options-dense
          />
        </div>
      </div>

      <div class="row no-wrap q-pl-sm">
        <div class="q-pa-none q-ml-sm q-mr-sm" style="max-width: 200px">
          <q-input
            debounce="350"
            v-model="appStore.desde"
            mask="date"
            outlined
            dense
            options-dense
            label="Fecha desde:"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="appStore.desde">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="q-pa-none" style="max-width: 200px">
          <q-input
            debounce="350"
            v-model="appStore.hasta"
            mask="date"
            outlined
            dense
            options-dense
            label="Fecha hasta:"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="appStore.hasta">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>
