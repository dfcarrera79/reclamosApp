<script setup lang="ts">
import { Detalle } from '../../components/models';
import { obtenerMotivosConPrioridadMasBaja } from '../../services/useUtils';

/* Defined props */
const props = defineProps<{
  reclamos: Detalle[];
}>();
</script>

<template>
  <span
    v-for="motivo in obtenerMotivosConPrioridadMasBaja(props.reclamos).split(
      ', '
    )"
    :key="motivo"
  >
    {{ motivo }}
    <br />
  </span>
</template>
