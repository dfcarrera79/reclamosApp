import { axios } from '../boot/axios';
import { deducirMensajeError } from '../utils/AppUtils';
import { useAppStore } from '../stores/useAppStore';

export function useAxios() {
  const appStore = useAppStore();

  const get = async (url: string, params: object) => {
    try {
      const promesa = await axios({
        method: 'GET',
        url: `${appStore.getURLApi}${url}`,
        params,
        headers: appStore.getHttpHeaders,
      });
      const data = await promesa.data;
      return data;
    } catch (error) {
      return {
        error: 'S',
        mensaje: deducirMensajeError(error),
        objetos: [],
      };
    }
  };

  const post = async (url: string, params, jsonData) => {
    try {
      const promesa = await axios({
        method: 'POST',
        url: `${appStore.getURLApi}${url}`,
        params,
        data: jsonData,
        headers: appStore.postHttpHeaders,
        json: true,
      });
      const data = await promesa.data;
      return data;
    } catch (error) {
      return {
        error: 'S',
        mensaje: deducirMensajeError(error),
        objetos: [],
      };
    }
  };

  const put = async (url: string, params, jsonData) => {
    try {
      const promesa = await axios({
        method: 'PUT',
        url: `${appStore.getURLApi}${url}`,
        params,
        data: jsonData,
        headers: appStore.postHttpHeaders,
        json: true,
      });
      const data = await promesa.data;
      return data;
    } catch (error) {
      return {
        error: 'S',
        mensaje: deducirMensajeError(error),
        objetos: [],
      };
    }
  };

  const postMultipart = async (url, params, formData) => {
    try {
      const promesa = await axios({
        method: 'POST',
        url: `${appStore.getURLApi}${url}`,
        params,
        data: formData,
        headers: appStore.postHttpHeadersMultipart,
        json: true,
      });
      const data = await promesa.data;
      return data;
    } catch (error) {
      return {
        error: 'S',
        mensaje: deducirMensajeError(error),
        objetos: [],
      };
    }
  };

  const deletes = async (url, params, jsonData) => {
    try {
      const promesa = await axios({
        method: 'DELETE',
        url: `${appStore.getURLApi}${url}`,
        params,
        data: jsonData,
        headers: appStore.postHttpHeaders,
        json: true,
      });
      const data = await promesa.data;
      return data;
    } catch (error) {
      return {
        error: 'S',
        mensaje: deducirMensajeError(error),
        objetos: [],
      };
    }
  };

  return {
    get,
    post,
    put,
    postMultipart,
    deletes,
  };
}
