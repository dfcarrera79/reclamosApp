<script setup lang="ts">
import { ref } from 'vue';
import { useAxios } from '../services/useAxios';
import { useAppStore } from '../stores/useAppStore';
import { useMensajes } from '../services/useMensajes';

// Datos
const isPwd = ref(true);
const { put } = useAxios();
const newPassword = ref('');
const appStore = useAppStore();
const confirmPassword = ref('');
const { mostrarMensaje } = useMensajes();
const claveActualizada = ref({
  ruc: '',
  clave: '',
});
const ruc = appStore.usuario.ruc_cliente;

const reset = () => {
  newPassword.value = '';
  confirmPassword.value = '';
};

const changePassword = async (ruc: string) => {
  // Perform password validation
  claveActualizada.value = {
    ruc: ruc,
    clave: newPassword.value,
  };
  if (newPassword.value === confirmPassword.value) {
    const response = await put(
      '/usuario/cambiarClave',
      {},
      JSON.parse(JSON.stringify(claveActualizada.value))
    );
    mostrarMensaje('Éxito', response.mensaje);
    reset();
  } else {
    mostrarMensaje('Error', 'Las contraseñas no coinciden');
  }
};
</script>

<template>
  <q-page padding>
    <h4 class="text-grey-8 q-ml-md q-mb-sm" style="font-family: 'Bebas Neue'">
      CAMBIAR CONTRASEÑA
    </h4>
    <p class="text-secondary text-body2 q-pa-md">
      <strong
        >Por favor, ingrese una contraseña personal para asegurar su cuenta.
      </strong>
    </p>
    <q-form
      @submit="changePassword(ruc)"
      class="q-gutter-md q-px-md"
      style="max-width: 300px"
    >
      <q-input
        outlined
        dense
        v-model="newPassword"
        label="Nueva contraseña"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Debe ingresar una contraseña',
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <q-input
        outlined
        dense
        :type="isPwd ? 'password' : 'text'"
        v-model="confirmPassword"
        label="Confirmar contraseña"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Debe ingresar una contraseña',
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <div>
        <q-btn label="Cambiar contraseña" type="submit" color="primary" />
      </div>
    </q-form>
  </q-page>
</template>

<style scoped>
.update-password {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
}

input[type='password'] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
}
</style>
