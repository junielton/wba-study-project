<template>
  <main>
    <button @click="requestDevice">Conectar</button>
    <div>{{ barcode }}</div>
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
    barcode: BluetoothRemoteGATTService | null
  }
}

// -- State -----------------------------------------------------------------
const bl = reactive<IBluetoothConnection>({
  isSupported: false,
  isConnected: false,
  device: null,
  server: null,
  service: {
    barcode: null
  }
})

const barcode = ref<string[]>([])

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
    filters: [{ services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }]
  }
try {
  bl.device = await navigator.bluetooth.requestDevice(options)

  if(!bl.device.gatt) {
    console.log('Não foi possível conectar ao dispositivo')
    return
  }

  if (!bl.device) {
    console.log('Nenhum dispositivo selecionado')
    return
  }

  bl.isConnected = true
  
  bl.device.addEventListener('gattserverdisconnected', ()=> {
    console.log('Desconectado')
    bl.isConnected = false
    alert('Desconectado')
  })

  bl.server = await bl.device.gatt?.connect()

  if (!bl.server) {
    console.log('Não foi possível conectar ao servidor')
    return
  }

  const service = await bl.server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');

  console.log('Service: ', service)

  const characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');

  console.log('Characteristic: ', characteristic)

  characteristic.startNotifications().then(() => {
    console.log('Notifications started')
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = event.target.value
      const decoder = new TextDecoder('utf-8')
      const decodedValue = decoder.decode(value)
      console.log('Valor lido: ', decodedValue)
      barcode.value.push(decodedValue)
    })
  })


} catch (error) {
  console.error('Erro ao conectar ao dispositivo', error)
}
}
</script>
