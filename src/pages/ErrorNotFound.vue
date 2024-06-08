<script setup lang="ts"></script>

<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="font-family: 'Bebas Neue'; opacity: 0.4">
        PÁGINA NO ENCONTRADA
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/editar_reclamo"
        label="Regresar a Reclamos App"
        no-caps
      />
    </div>
  </div>
</template>
