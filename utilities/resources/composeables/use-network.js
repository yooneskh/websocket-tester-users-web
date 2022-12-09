import { http, generalHttpHandle } from '../../../services/http/mod';


export function useNetwork({ gate, method, url, queries, body }) {

  const gateRef = ref(gate);
  method = ref(method);
  url = ref(url);
  queries = ref(queries);
  body = ref(body);

  const loading = ref(false);

  const status = ref(0)
  const data = ref(undefined);
  const headers = ref({});

  const error = ref(false);

  const refreshHandle = ref(0);


  watch([gateRef, method, url, queries, body, refreshHandle], async () => {

    if (typeof gate === 'function' && !gate()) {
      return;
    }
    else if (gate !== undefined && Boolean(unref(gate)) === false) {
      return;
    }

    if (!unref(method) || !unref(url)) {
      return;
    }


    error.value = false;
    loading.value = refreshHandle.value > -1; // to make it refresh

    const response = await http.request({
      method: unref(method),
      url: unref(url),
      queries: unref(queries),
      body: unref(body),
    });

    loading.value = false;

    if (generalHttpHandle(response.status, response.data, true)) {
      error.value = true;
    }


    status.value = response.status;
    data.value = response.data;
    headers.value = response.headers;

  }, { immediate: true });


  return {
    loading,
    status,
    data,
    headers,
    error,
    refresh: () => refreshHandle.value++,
  };

}