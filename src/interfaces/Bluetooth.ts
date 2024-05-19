/// <reference types="@types/web-bluetooth" />

import type { ConfigurableNavigator } from '@vueuse/core'
import type { ComputedRef, Ref } from 'vue'

export interface UseBluetoothRequestDeviceOptions {
  /**
   *
   * An array of BluetoothScanFilters. This filter consists of an array
   * of BluetoothServiceUUIDs, a name parameter, and a namePrefix parameter.
   *
   */
  filters?: BluetoothLEScanFilter[] | undefined
  /**
   *
   * An array of BluetoothServiceUUIDs.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTService/uuid
   *
   */
  optionalServices?: BluetoothServiceUUID[] | undefined
}
export interface UseBluetoothOptions
  extends UseBluetoothRequestDeviceOptions,
    ConfigurableNavigator {
  /**
   *
   * A boolean value indicating that the requesting script can accept all Bluetooth
   * devices. The default is false.
   *
   * !! This may result in a bunch of unrelated devices being shown
   * in the chooser and energy being wasted as there are no filters.
   *
   *
   * Use it with caution.
   *
   * @default false
   *
   */
  acceptAllDevices?: boolean
}
export declare function useBluetooth(options?: UseBluetoothOptions): UseBluetoothReturn
export interface UseBluetoothReturn {
  isSupported: Ref<boolean>
  isConnected: ComputedRef<boolean>
  device: Ref<BluetoothDevice | undefined>
  requestDevice: () => Promise<void>
  server: Ref<BluetoothRemoteGATTServer | undefined>
  error: Ref<unknown | null>
}
