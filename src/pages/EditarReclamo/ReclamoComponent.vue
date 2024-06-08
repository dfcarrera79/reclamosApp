<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAxios } from '../../services/useAxios';

// Data
/* defined props */
const props = defineProps({
  detalle: {
    type: Object,
    required: true,
  },
});

/* defined emits*/
const emit = defineEmits([
  'agregarFila',
  'eliminarReclamo',
  'actualizarComentario',
  'actualizarMotivo',
  'actualizarArchivo1',
  'actualizarArchivo2',
  'actualizarArchivo3',
  'File',
]);

const { get, post } = useAxios();
const motivos = ref([]);
const imagen1 = ref();
const imagen2 = ref();
const imagen3 = ref();

// Methods
onMounted(async () => {
  const respuesta = await get('/motivo/obtener_motivos', {});
  if (respuesta.error === 'S') {
    console.error(respuesta.mensaje);
    return;
  }
  motivos.value = respuesta.objetos;
});

const enviarFila = () => {
  emit('agregarFila', props.detalle.producto.id);
};

const subirArchivo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const respt = await post('/reclamo/subir_archivo/', {}, formData);
  return respt.files.file.filepath;
};

const procesarImagen1 = async (img: File) => {
  if (img) {
    const filepath = await subirArchivo(img);
    const respuesta = await post(
      '/reclamo/registrar_archivo',
      {},
      JSON.parse(JSON.stringify({ filepath }))
    );
    archivo1.value = respuesta.objetos[0].id_archivo;
  }
};

const procesarImagen2 = async (img: File) => {
  if (img) {
    const filepath = await subirArchivo(img);
    const respuesta = await post(
      '/reclamo/registrar_archivo',
      {},
      JSON.parse(JSON.stringify({ filepath }))
    );
    archivo2.value = respuesta.objetos[0].id_archivo;
  }
};
const procesarImagen3 = async (img: File) => {
  if (img) {
    const filepath = await subirArchivo(img);
    const respuesta = await post(
      '/reclamo/registrar_archivo',
      {},
      JSON.parse(JSON.stringify({ filepath }))
    );
    archivo3.value = respuesta.objetos[0].id_archivo;
  }
};

const eliminarReclamo = (id: number) => {
  emit('eliminarReclamo', id);
};

// Computed
const comentario = computed({
  get() {
    return props.detalle.comentario;
  },
  set(nuevoComentario: string) {
    emit('actualizarComentario', {
      ...props.detalle,
      comentario: nuevoComentario,
    });
  },
});

const motivo = computed({
  get() {
    return props.detalle.motivo;
  },
  set(nuevoMotivo) {
    emit('actualizarMotivo', {
      ...props.detalle,
      motivo: nuevoMotivo,
    });
  },
});

const archivo1 = computed({
  get() {
    return props.detalle.archivos[0];
  },
  set(nuevoArchivo1) {
    emit('actualizarArchivo1', {
      ...props.detalle,
      archivos: [nuevoArchivo1, 0, 0],
    });
  },
});

const archivo2 = computed({
  get() {
    return props.detalle.archivos[1];
  },
  set(nuevoArchivo2) {
    emit('actualizarArchivo2', {
      ...props.detalle,
      archivos: [0, nuevoArchivo2, 0],
    });
  },
});

const archivo3 = computed({
  get() {
    return props.detalle.archivos[2];
  },
  set(nuevoArchivo3) {
    emit('actualizarArchivo3', {
      ...props.detalle,
      archivos: [0, 0, nuevoArchivo3],
    });
  },
});
</script>

<template>
  <div>
    <div
      class="fit row justify-between content-center items-center bg-secondary"
    >
      <div class="text-white q-ml-sm">
        <strong>{{ props.detalle.producto.nombre }}</strong>
      </div>
      <div class="q-mr-sm">
        <q-btn
          flat
          round
          color="white"
          dense
          unelevated
          icon="close"
          @click="
            eliminarReclamo(props.detalle.producto.id);
            enviarFila();
          "
        >
          <q-tooltip> Eliminar reclamo </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-card
      class="row col-4"
      flat
      bordered
      style="max-height: 400px; min-width: 440px"
    >
      <q-card-section class="text-grey-8">
        <div>
          <p><strong>Por favor detalle su reclamo:</strong></p>
          <q-editor
            v-model="comentario"
            flat
            height="100px"
            style="max-width: 180px"
            content-class="bg-grey-1"
            toolbar-text-color="white"
            toolbar-toggle-color="yellow-8"
            toolbar-bg="secondary"
            :toolbar="[['bold', 'italic', 'underline', 'undo', 'redo']]"
          />
        </div>
      </q-card-section>

      <q-card-section class="col">
        <q-select
          class="col-4 bg-white q-pb-md"
          debounce="350"
          label="Motivo"
          v-model="motivo"
          :options="motivos"
          option-value="id_motivo"
          option-label="nombre_motivo"
          outlined
          dense
          options-dense
        />

        <div class="text-grey-8">
          <p class="q-pa-none q-ma-none">
            <strong>Opcional: </strong> Adjuntar fotos del producto
          </p>
          <q-file
            class="q-pt-xs"
            name="image"
            v-model="imagen1"
            @update:model-value="procesarImagen1(imagen1)"
            accept=".jpg, image/*"
            label="Seleccionar imagen 1"
            outlined
            dense
            options-dense
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop.prevent="(imagen1 = undefined), (archivo1 = 0)"
                class="cursor-pointer"
              />
            </template>
          </q-file>
          <q-file
            class="q-pt-xs"
            name="image"
            v-model="imagen2"
            @update:model-value="procesarImagen2(imagen2)"
            accept=".jpg, image/*"
            label="Seleccionar imagen 2"
            outlined
            dense
            options-dense
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop.prevent="(imagen2 = undefined), (archivo2 = 0)"
                class="cursor-pointer"
              />
            </template>
          </q-file>
          <q-file
            class="q-pt-xs"
            name="image"
            v-model="imagen3"
            @update:model-value="procesarImagen3(imagen3)"
            accept=".jpg, image/*"
            label="Seleccionar imagen 3"
            outlined
            dense
            options-dense
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop.prevent="(imagen3 = undefined), (archivo3 = 0)"
                class="cursor-pointer"
              />
            </template>
          </q-file>
        </div>
      </q-card-section>
    </q-card>
    <div
      v-if="detalle.comentario == '' || detalle.motivo.id_motivo == 0"
      class="text-white q-mb-sm bg-orange"
    >
      <strong class="q-ma-sm"
        >Se debe escribir el detalle y seleccionar el motivo del reclamo</strong
      >
    </div>
    <div
      v-if="detalle.comentario != '' && detalle.motivo.id_motivo != 0"
      class="text-white q-mb-sm bg-secondary"
    >
      <strong class="q-ma-sm">Reclamo detallado correctamente</strong>
    </div>
  </div>
</template>
