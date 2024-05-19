<template>
  <main>
    <p>Web Bluetooth API</p>
    <button @click="requestDevice">Solicitar Permissão</button>
    <div>{{ batteryLevel }}%</div>
  </main>
</template>

<style>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

/** ---------------------------------------------------------------------------
 * Projeto de estudo sobre a Web Bluetooth API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
 * @see https://googlechrome.github.io/samples/web-bluetooth/
 *
 * @description - Objetivo
 * Criar uma aplicação que se conecta a um dispositivo Bluetooth de leitura
 * de codigos de barras, recebe os dados lidos e exibe diretamente no javascript,
 * sem passar por um input de texto. Aumentando a velocidade de leitura.
 --------------------------------------------------------------------------- */

interface IBluetoothConnection {
  isSupported: boolean
  isConnected: boolean
  device: BluetoothDevice | null
  server: BluetoothRemoteGATTServer | null
  service: {
    battery: BluetoothRemoteGATTService | null
  }
}

// -- State -----------------------------------------------------------------
const bl = reactive<IBluetoothConnection>({
  isSupported: false,
  isConnected: false,
  device: null,
  server: null,
  service: {
    battery: null
  }
})

const batteryLevel = ref<any>(0)
const batteryLevelInterval = ref<any>(null)

// -- Watchers --------------------------------------------------------------

watch(
  () => bl.device,
  () => {
    if (bl.device) {
      console.log('Dispositivo conectado: ', bl.device)
    }
  }
)

watch(
  () => bl.server,
  () => {
    if (bl.server) {
      console.log('Server conectado: ', bl.server)
    }
  }
)

// -- Methods ---------------------------------------------------------------

async function requestDevice() {
  const options = {
    acceptAllDevices: true,
    optionalServices: ['battery_service', 'heart_rate']
  }

  bl.device = await navigator.bluetooth.requestDevice(options)

  if (!bl.device) {
    console.log('Nenhum dispositivo selecionado')
    return
  }

  bl.isConnected = true

  bl.server = await bl.device.gatt?.connect()

  bl.device.addEventListener('gattserverdisconnected', onDisconnected)

  await connect()
}

function onDisconnected() {
  console.log('> Bluetooth Device disconnected')
  clearInterval(batteryLevelInterval.value)
  bl.isConnected = false
  connect()
}

async function connect() {
  exponentialBackoff(
    3 /* max retries */,
    2 /* seconds delay */,
    async function toTry() {
      time('Connecting to Bluetooth Device... ')
      await bl.device?.gatt?.connect()
    },
    async function success() {
      console.log('> Bluetooth Device connected. Try disconnect it now.')

      console.log('Getting Battery Service...')
      bl.service.battery = await bl.server.getPrimaryService('battery_service')

      batteryLevelInterval.value = setInterval(() => {
        readBatteryLevel()
      }, 1000)
    },
    function fail() {
      time('Failed to reconnect.')
    }
  )
}

async function readBatteryLevel() {
  console.log('Getting Battery Level Characteristic...')
  const characteristic = await bl.service.battery?.getCharacteristic('battery_level')

  console.log('Reading Battery Level...')
  const value = await characteristic?.readValue()

  console.log('> Battery Level is ' + value?.getUint8(0) + '%')

  batteryLevel.value = value?.getUint8(0)
}

// -- Utils -----------------------------------------------------------------

// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
async function exponentialBackoff(max, delay, toTry, success, fail) {
  try {
    const result = await toTry()
    success(result)
  } catch (error) {
    if (max === 0) {
      return fail()
    }
    time('Retrying in ' + delay + 's... (' + max + ' tries left)')
    setTimeout(function () {
      exponentialBackoff(--max, delay * 2, toTry, success, fail)
    }, delay * 1000)
  }
}

function time(text) {
  console.log('[' + new Date().toJSON().substr(11, 8) + '] ' + text)
}
</script>
