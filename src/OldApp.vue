<template>
  <main>
    <p>Web Bluetooth API</p>
    <button @click="requestDevice">Solicitar Permissão</button>
    {{ heartRate }}
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
import { onMounted, reactive, ref, toRaw, watch } from 'vue'

/// <reference types="web-bluetooth" />

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

type Bluetooth = {
  device: BluetoothDevice | null
  server: BluetoothRemoteGATTServer | null
  service: BluetoothRemoteGATTService | null
}

// -- State -----------------------------------------------------------------
const bt = reactive<Bluetooth>({
  device: null,
  server: null,
  service: null
})

const heartRate = ref(0)

// -- Computed Properties ---------------------------------------------------
// -- Watchers --------------------------------------------------------------
watch(
  () => heartRate.value,
  (newValue, oldValue) => {
    console.log('Novo valor: ', newValue)
  }
)
// -- Methods ---------------------------------------------------------------
const init = async () => {
  // - Checa se o navegador suporta a Web Bluetooth API
  if (!navigator.bluetooth) {
    alert(
      'Web Bluetooth API não suportada. Por favor, solicite a versão mais recente do Google Chrome.'
    )
    return
  }
}

const info = (text: string) => {
  console.info(`ℹ️ ${text}`)
}

const handleHeartRate = (event: Event) => {
  console.log('Evento: ', event)
}

const connect = async () => {
  // -- Checa se o dispositivo foi selecionado

  if (!bt.device) {
    info('Nenhum dispositivo selecionado.')
    return
  }

  // -- Checa se o dispositivo já está conectado

  if (bt.device.gatt?.connected) {
    info('Dispositivo já conectado.')
    return
  }

  // -- Conecta ao GATT Server

  try {
    bt.server = await bt.device.gatt?.connect()

    console.log('Conectado ao GATT Server: ', bt.server)

    bt.service = await bt.server?.getPrimaryService('heart_rate')

    console.log('Serviço: ', bt.service)

    const heartRateChar = await bt.service.getCharacteristic('heart_rate_measurement')

    heartRateChar.addEventListener('characteristicvaluechanged', (e: Event) => handleHeartRate(e))
  } catch (error) {
    console.log('Erro ao conectar ao GATT Server: ', error)
  }
}

const requestDevice = async () => {
  try {
    const options = {
      acceptAllDevices: true
      // optionalServices: ['heart_rate']
      // filters: [{ services: ['heart_rate'] }],
    }

    bt.device = await navigator.bluetooth.requestDevice(options)

    if (!bt.device) {
      info('Nenhum dispositivo selecionado.')
      return
    }

    console.log('Dispositivo encontrado: ', bt.device)

    await connect()
  } catch (error) {
    console.log('Erro ao solicitar dispositivo: ', error)
  }
}

// -- Lifecycle Hooks -------------------------------------------------------
onMounted(() => init())
</script>
