import { defineStore } from 'pinia';

export const useBodegaStore = defineStore('oBodega', {
  state: () => ({
    actualizarFilas: false,
  }),
});
