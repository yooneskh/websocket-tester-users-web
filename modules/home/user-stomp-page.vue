<script setup>

const { toastError } = useToast();


useHead({
  script: [
    { src: 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js' },
  ],
});

const wsConf = reactive({
  url: '',
  headers: [],
  connecting: false,
  connected: false,
});

const subscribeConf = reactive({
  prefix: '',
});

import { Stomp } from '@stomp/stompjs';
let client;
let sessionId;


async function connectWebsocket() {

  wsConf.connected = false;
  wsConf.connecting = true;

  const socket = new SockJS(wsConf.url);
  client = Stomp.over(socket);

  events.value.push({
    type: 'connecting',
    at: new Date(),
  });

  client.connect({}, frame => {

    wsConf.connected = true;
    wsConf.connecting = false;

    events.value.push({
      type: 'connected',
      at: new Date(),
    });


    let url = client.ws._transport.url;

    url = url.replace(wsConf.url,  '');
    url = url.replace(wsConf.url.replace('http://', 'ws://'),  '');
    url = url.replace(wsConf.url.replace('https://', 'ws://'),  '');
    url = url.replace('/websocket', '');
    url = url.replace(/^\/+[0-9]+\/+/, '');

    sessionId = url;

    const subscriprionRoom = subscribeConf.prefix + sessionId;


    client.subscribe(subscriprionRoom, (msgOut) => {
      events.value.push({
        type: 'received',
        sessionId,
        room: subscriprionRoom,
        data: msgOut,
        at: new Date(),
      });
    });

    events.value.push({
      type: 'subscribed to',
      sessionId,
      room: subscriprionRoom,
      at: new Date(),
    });

  });

}

function disconnectWebsocket() {
  client?.deactivate();
}


const sendConf = reactive({
  room: '',
  data: '',
});

function sendData() {

  if (!client) {
    return toastError({
      title: 'client is not connected.',
    });
  }

  client.publish({
    destination: sendConf.room,
    body: sendConf.data,
  });

  events.value.push({
    type: 'sent',
    room: sendConf.room,
    data: sendConf.data,
    at: new Date(),
  });

}


const events = ref([]);

</script>


<template>
  <v-container fluid style="max-width: 1400px;">

    <v-row>
      <v-col cols="12" md="6" lg="4">

        <v-card prepend-icon="mdi-server" title="Websocket Connection">

          <v-card-text>
            <u-form
              :target="wsConf"
              :fields="[
                {
                  key: 'url', identifier: 'text', label: 'Websocket Server Url',
                },
                {
                  key: 'headers', identifier: 'series', label: 'Connect Headers',
                  itemFields: [
                    {
                      key: 'key', identifier: 'text', label: 'Key', width: 6,
                    },
                    {
                      key: 'value', identifier: 'text', label: 'Value', width: 6,
                    },
                  ]
                },
              ]"
            />
          </v-card-text>

          <v-card-actions class="justify-end">

            <v-chip
              v-if="!wsConf.connected"
              variant="tonal"
              color="error"
              size="small"
              prepend-icon="mdi-alert"
              text="Not Connected"
            />
            <v-chip
              v-else
              variant="tonal"
              color="success"
              size="small"
              prepend-icon="mdi-check"
              text="Connected"
            />

            <v-btn
              color="primary"
              class="ms-3"
              :loading="wsConf.connecting"
              @click="connectWebsocket()">
              Connect Websocket
            </v-btn>

            <v-btn
              variant="outlined"
              color="error"
              class="ms-3"
              :disabled="!wsConf.connected"
              :loading="wsConf.connecting"
              @click="disconnectWebsocket()">
              Disonnect
            </v-btn>

          </v-card-actions>

        </v-card>

        <v-card prepend-icon="mdi-mail" title="Subscriptions" :disabled="wsConf.connected" class="mt-4">
          <v-card-text>
            <u-form
              :target="subscribeConf"
              :fields="[
                {
                  key: 'prefix', identifier: 'text', label: 'Subscription Prefix',
                }
              ]"
            />
          </v-card-text>
        </v-card>

        <v-card prepend-icon="mdi-send" title="Send Data" :disabled="!wsConf.connected" class="mt-4">

          <v-card-text>
            <u-form
              :target="sendConf"
              :fields="[
                {
                  key: 'room', identifier: 'text', label: 'Room',
                },
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
              :disabled="!sendConf.room || !sendConf.data"
              @click="sendData()">
              Send Data
            </v-btn>
          </v-card-actions>

        </v-card>

      </v-col>
      <v-col cols="12" md="6" lg="8">
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