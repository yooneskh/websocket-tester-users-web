<script setup>

const { toastError } = useToast();


const wsConf = reactive({
  url: '',
  headers: [],
  connecting: false,
  connected: false,
});

const subscribeConf = reactive({
  rooms: [],
});

import { Client } from '@stomp/stompjs';
let client;


async function connectWebsocket() {

  wsConf.connected = false;
  wsConf.connecting = true;


  if (client) {
    client.deactivate();
    await new Promise(r => setTimeout(r, 1000))
  }


  const headers = {};

  for (const header of wsConf.headers) {
    headers[header.key] = header.value;
  }

  client = new Client({
    brokerURL: wsConf.url,
    connectHeaders: headers,
    beforeConnect() {

      wsConf.connecting = true;

      events.value.push({
        type: 'connecting',
        at: new Date(),
      });

    },
    onConnect() {

      wsConf.connected = true;
      wsConf.connecting = false;

      events.value.push({
        type: 'connected',
        at: new Date(),
      });

      for (const room of subscribeConf.rooms) {

        client.subscribe(room.room, message => {
          events.value.push({
            type: 'received',
            room: room.room,
            data: message.body,
            at: new Date(),
          });
        });

        events.value.push({
          type: 'subscribed to',
          room: room.room,
          at: new Date(),
        });

      }

    },
    onDisconnect() {

      wsConf.connected = false;

      events.value.push({
        type: 'disconnected',
        at: new Date(),
      });

    },
    onStompError(error) {

      wsConf.connected = false;
      wsConf.connecting = false;

      events.value.push({
        type: 'stomp error',
        error: error?.message,
        at: new Date(),
      });

    },
    onWebSocketError(error) {

      wsConf.connected = false;
      wsConf.connecting = false;

      events.value.push({
        type: 'websocket error',
        error: error?.message,
        at: new Date(),
      });

    },
  });


  client.activate();

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
                  key: 'rooms', identifier: 'series', label: 'Subscriptions',
                  itemFields: [
                    {
                      key: 'room', identifier: 'text', label: 'Room',
                    }
                  ]
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