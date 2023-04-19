<script setup>

const { toastError } = useToast();


const wsConf = reactive({
  url: 'ws://localhost:8081',
  connecting: false,
  connected: false,
});

let websocket;


async function connectWebsocket() {

  wsConf.connected = false;
  wsConf.connecting = true;


  if (websocket) {
    websocket.close();
    await new Promise(r => setTimeout(r, 1000))
  }


  websocket = new WebSocket(wsConf.url);

  events.value.push({
    type: 'connecting',
    at: new Date(),
  });


  websocket.onopen = () => {

    wsConf.connected = true;
    wsConf.connecting = false;

    events.value.push({
      type: 'connected',
      at: new Date(),
    });

  }

  websocket.onmessage = (data) => {
    events.value.push({
      type: 'received',
      data: data.data,
      at: new Date(),
    });
  }

  websocket.onclose = () => {

    wsConf.connected = false;

    events.value.push({
      type: 'disconnected',
      at: new Date(),
    });

  }

  websocket.onerror = (error) => {

    wsConf.connecting = false;
    wsConf.connected = false;

    events.value.push({
      type: 'error',
      error,
      at: new Date(),
    });

  }

}


const sendConf = reactive({
  data: '',
});

function sendData() {

  if (!websocket) {
    return toastError({
      title: 'Websocket is not connected.',
    });
  }

  websocket.send(sendConf.data);

  events.value.push({
    type: 'sent',
    data: sendConf.data,
    at: new Date(),
  });

}


const events = ref([]);

</script>


<template>
  <v-container fluid style="max-width: 1024px;">

    <v-row>
      <v-col cols="12" md="6">

        <v-card prepend-icon="mdi-server" title="Websocket Connection">

          <v-card-text>
            <u-form
              :target="wsConf"
              :fields="[
                {
                  key: 'url', identifier: 'text', label: 'Websocket Server Url',
                }
              ]"
            />
          </v-card-text>

          <v-card-actions class="justify-end">

            <v-chip
              v-if="!wsConf.connected"
              variant="tonal"
              color="error"
              prepend-icon="mdi-alert"
              text="Not Connected"
              size="small"
            />
            <v-chip
              v-else
              variant="tonal"
              color="success"
              prepend-icon="mdi-check"
              text="Connected"
              size="small"
            />

            <v-btn
              color="primary"
              size="large"
              class="ms-3"
              :loading="wsConf.connecting"
              @click="connectWebsocket()">
              Connect Websocket
            </v-btn>

          </v-card-actions>

        </v-card>

        <v-card prepend-icon="mdi-send" title="Send Data" :disabled="!wsConf.connected" class="mt-4">

          <v-card-text>
            <u-form
              :target="sendConf"
              :fields="[
                {
                  key: 'data', identifier: 'textarea', label: 'Data',
                }
              ]"
            />
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              size="large"
              :disabled="!sendConf.data"
              @click="sendData()">
              Send Data
            </v-btn>
          </v-card-actions>

        </v-card>

      </v-col>
      <v-col cols="12" md="6">
        <v-card prepend-icon="mdi-database" title="Events">

          <v-code>
            <pre>{{ events }}</pre>
          </v-code>

          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              size="large"
              @click="events = [];">
              Clear Events
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>