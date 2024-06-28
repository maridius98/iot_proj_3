import json
import time
import asyncio
from nats.aio.client import Client as NATS
from nats.aio.errors import ErrConnectionClosed, ErrTimeout, ErrNoServers
from collections import deque
import paho.mqtt.client as mqtt

sensor_data = deque(maxlen=600)

def type_safe(func):
    def wrapper(iterable):
        return func(elem if elem is not None else 0 for elem in iterable)
    return wrapper

@type_safe
def safe_sum(iterable):
    return sum(iterable)

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("sensor/topic")

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    sensor_data.append(payload)

    if len(sensor_data) == sensor_data.maxlen:
        avg_global_active_power = safe_sum(d['globalActivePower'] for d in sensor_data) / len(sensor_data)
        avg_global_reactive_power = safe_sum(d['globalReactivePower'] for d in sensor_data) / len(sensor_data)
        avg_voltage = safe_sum(d['voltage'] for d in sensor_data) / len(sensor_data)
        avg_global_intensity = safe_sum(d['globalIntensity'] for d in sensor_data) / len(sensor_data)

        result = {
            'avgGlobalActivePower': avg_global_active_power,
            'avgGlobalReactivePower': avg_global_reactive_power,
            'avgVoltage': avg_voltage,
            'avgGlobalIntensity': avg_global_intensity,
            'timestamp': payload['timestamp'],
        }

        sensor_data.clear()
        print(result)
        asyncio.run(publish(json.dumps(result)))

client = mqtt.Client(protocol=mqtt.MQTTv311)
client.on_connect = on_connect
client.on_message = on_message

client.connect("mosquitto", 1883, 60)
client.loop_start()

async def publish(message):
    nc = NATS()

    await nc.connect("nats://nats:4222")
    await nc.publish("eventinfo.topic", bytes(message, 'utf-8'))
    await nc.close()

while True:
    time.sleep(1)