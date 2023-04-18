<script setup>

const token = useToken();
const user = useUser();


import { launchListPickerDialog } from '../../utilities/unified-dialogs-vuetify/list-picker/mod';

async function testDialogs() {

  const choice = await launchListPickerDialog({
    icon: 'mdi-home',
    title: 'Unified Dialogs',
    subtitle: 'Streamlines your applications dialogs',
    text: 'Save time and headache by using Unified Dialogs to show dialog in your application.',
    items: [
      {
        value: 'wanted',
        icon: 'mdi-star',
        title: 'I want it!',
        subtitle: 'This is wonderful!',
      },
      {
        value: 'didn\'t want',
        icon: 'mdi-archive',
        title: 'Not now',
      },
    ]
  });

  if (!choice) {
    return;
  }

  alert(`You ${choice} it!`);

}

</script>


<template>
  <v-container fluid class="fill-height d-flex flex-column align-center justify-center">

    <div class="text-h5">
      Hello From Websocket Tester
    </div>

    <v-btn
      variant="outlined"
      color="primary"
      prepend-icon="mdi-link"
      class="mt-4 text-none"
      href="https://github.com/yooneskh"
      target="_blank">
      Made By YoonesKh
    </v-btn>

    <v-btn
      variant="text"
      color="primary"
      prepend-icon="mdi-star"
      class="mt-2 text-none"
      @click="testDialogs()">
      Test Dialogs
    </v-btn>

  </v-container>
</template>