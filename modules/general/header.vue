<script setup>

const router = useRouter();
const route = useRoute();


/* user */

const token = useToken();
const user = useUser();


/* logout */

import { logoutUser } from '../authentication/controller';

function handleLogout() {
  logoutUser(token, user);
}


/* template */

</script>


<template>
  <v-app-bar>

    <div
      class="d-flex align-center ms-2 pe-4"
      style="cursor: pointer;"
      @click="router.push({ name: 'general.home' })">

      <div class="text-h5 font-weight-black">
        Websocket Tester
      </div>

    </div>

    <v-spacer />

    <v-toolbar-items>
      <v-btn append-icon="mdi-open-in-new" href="https://github.com/yooneskh" target="_blank">
        Made By Yooneskh
      </v-btn>
    </v-toolbar-items>

  </v-app-bar>
</template>