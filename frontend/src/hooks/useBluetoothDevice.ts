import { useState, useCallback } from 'react';

interface BluetoothState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    deviceData: {
        heartRate: number | null;
        deviceName: string | null;
    };
}

export const useBluetoothDevice = () => {
    const [state, setState] = useState<BluetoothState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        deviceData: {
            heartRate: null,
            deviceName: null,
        },
    });

    const [device, setDevice] = useState<BluetoothDevice | null>(null);

    const handleHeartRateChanged = (event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        const value = characteristic.value;

        if (!value) return;

        // Parsing Heart Rate Measurement (0x2A37)
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let heartRate: number;

        if (rate16Bits) {
            heartRate = value.getUint16(1, true); // Little Endian
        } else {
            heartRate = value.getUint8(1);
        }

        setState(prev => ({
            ...prev,
            deviceData: {
                ...prev.deviceData,
                heartRate,
            }
        }));
    };

    const simulateConnection = () => {
        setState(prev => ({
            ...prev,
            isConnecting: true,
            error: null
        }));

        setTimeout(() => {
            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                deviceData: {
                    ...prev.deviceData,
                    deviceName: "Simulated HR Monitor",
                    heartRate: 75
                }
            }));

            // Start simulating heart rate changes
            const interval = setInterval(() => {
                setState(prev => {
                    if (!prev.isConnected) {
                        clearInterval(interval);
                        return prev;
                    }
                    // Simulate HR between 70 and 90
                    const newHr = 70 + Math.floor(Math.random() * 20);
                    return {
                        ...prev,
                        deviceData: {
                            ...prev.deviceData,
                            heartRate: newHr
                        }
                    };
                });
            }, 2000); // Update every 2 seconds

            // Store interval id to clear later if needed (simplified for this hook)
            (window as any).btSimulationInterval = interval;

        }, 1500); // Fake connection delay
    };

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Check for API availability
            const isSupported = navigator.bluetooth && await navigator.bluetooth.getAvailability();

            if (!isSupported) {
                console.warn("Bluetooth not available. Falling back to simulation mode.");
                simulateConnection();
                return;
            }

            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['heart_rate']
            });

            if (!device.gatt) {
                throw new Error("Bluetooth device does not support GATT.");
            }

            setDevice(device);

            // Connect to GATT Server
            const server = await device.gatt.connect();

            // Get Heart Rate Service
            const service = await server.getPrimaryService('heart_rate');

            // Get Heart Rate Measurement Characteristic
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // Start Notifications
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged);

            device.addEventListener('gattserverdisconnected', onDisconnected);

            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                deviceData: {
                    ...prev.deviceData,
                    deviceName: device.name || "Unknown Device",
                }
            }));

        } catch (error: any) {
            console.error("Bluetooth connection error:", error);
            // Auto-fallback to simulation if permission denied or other error
            console.log("Falling back to simulation mode due to error.");
            simulateConnection();
        }
    }, []);

    const onDisconnected = () => {
        if ((window as any).btSimulationInterval) {
            clearInterval((window as any).btSimulationInterval);
        }
        setState(prev => ({
            ...prev,
            isConnected: false,
            deviceData: { ...prev.deviceData, heartRate: null }
        }));
    };

    const disconnect = useCallback(() => {
        if (device && device.gatt && device.gatt.connected) {
            device.gatt.disconnect();
        }
        // Cleanup state is handled by onDisconnected listener, but we force it here just in case
        onDisconnected();
    }, [device]);

    return {
        ...state,
        connect,
        disconnect
    };
};
