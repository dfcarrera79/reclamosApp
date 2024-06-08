<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useAxios } from '../services/useAxios';
import { useMensajes } from '../services/useMensajes';

const { put } = useAxios();
const newPassword = ref('');
const confirmPassword = ref('');
const { mostrarMensaje } = useMensajes();
const claveActualizada = ref({
  ruc: '',
  clave: '',
});
const route = useRoute();
const ruc = route.params.ruc;
const router = useRouter();

const changePassword = async (ruc: string) => {
  // Perform password validation
  claveActualizada.value = {
    ruc: ruc,
    clave: newPassword.value,
  };
  if (newPassword.value === confirmPassword.value) {
    await put(
      '/usuario/cambiarClave',
      {},
      JSON.parse(JSON.stringify(claveActualizada.value))
    );
    // Navigate to the login path
    router.push('/login/1');
    mostrarMensaje('Éxito', 'La contraseña se ha actualizado correctamente');
  } else {
    mostrarMensaje('Error', 'Las contraseñas no coinciden');
  }
};
</script>

<template>
  <div class="update-password">
    <div class="row justify-center">
      <q-img
        src="../assets/logo_apromed.png"
        alt="loxasoluciones"
        width="70%"
      />
    </div>
    <h4 class="text-grey-8" style="font-family: 'Bebas Neue'">CAMBIAR CLAVE</h4>
    <form @submit="changePassword(ruc as string)">
      <div class="form-group">
        <label for="newPassword" class="col-6 text-grey-8"
          ><strong>Nueva contraseña</strong></label
        >
        <input
          id="newPassword"
          type="password"
          v-model="newPassword"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword" class="col-6 text-grey-8"
          ><strong>Confirmar contraseña</strong></label
        >
        <input
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          required
        />
      </div>
      <q-btn
        class="q-ma-sm"
        outline
        color="primary"
        style="height: 40px; width: 183px"
        type="submit"
      >
        <div class="row items-center no-wrap q-pa-none">
          <div class="text-center text-caption">
            <strong>Cambiar contraseña</strong>
          </div>
        </div>
      </q-btn>
    </form>
  </div>
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

button[type='submit'] {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
