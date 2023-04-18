<script setup>

/* authentication */

import { reloadUser } from './modules/authentication/controller';

const token = useToken();
const loading = ref(false);


if (token.value) {
  loading.value = true;
  (reloadUser(true)
    .catch(() => {
      token.value = '';
    })
    .finally(() => {
      loading.value = false;
    })
  );
}


const { http } = useHttp();

watch(token, () => {
  http.applyHeader('Authorization', token.value);
}, { immediate: true })


/* unified dialogs */

import { UnifiedDialogProvider } from './utilities/unified-dialogs/mod';
import { UnifiedToastsProvider } from './utilities/unified-toasts/mod';

</script>


<template>
  <v-app>

    <Head>
      <Title>
        Websocket Tester
      </Title>
    </Head>

    <template v-if="loading">
      <div class="h-100 d-flex flex-column align-center justify-center">

        <v-img
          src="/logo.png"
          width="56"
          height="56"
          class="flex-grow-0"
        />

        <v-progress-circular
          indeterminate
          color="primary"
          size="24"
          class="mt-3"
        />

      </div>
    </template>
    <template v-else>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>

    <unified-dialog-provider />
    <unified-toasts-provider />

  </v-app>
</template>


<style lang="scss">

  @import '@/assets/stylesheets/rtl.scss';

  .v-btn {
    text-transform: none !important;
  }

  .v-messages__message + .v-messages__message {
    margin-top: 6px;
  }

  .text-ltr {
    direction: ltr;
  }

  .text-rtl {
    direction: rtl;
  }

  .gap-1 {
    gap: 4px;
  }

  .gap-2 {
    gap: 8px;
  }

  .gap-3 {
    gap: 12px;
  }

  .v-card-title {
    white-space: normal;
  }

</style>