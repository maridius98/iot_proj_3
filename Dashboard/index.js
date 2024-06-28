import { connect, JSONCodec } from "nats";
import Influx from "influx";

const natsConnection = {
  "servers": "nats://nats:4222"
}

const influx = new Influx.InfluxDB({
  host: 'influxdb',
  database: 'mydb',
  schema: [
    {
      measurement: 'average_values',
      fields: {
        avgGlobalActivePower: Influx.FieldType.FLOAT,
        avgGlobalReactivePower: Influx.FieldType.FLOAT,
        avgVoltage: Influx.FieldType.FLOAT,
        avgGlobalIntensity: Influx.FieldType.FLOAT,
      },
      tags: ['timestamp']
    }
  ]
});

const jc = JSONCodec()

const main = async () => {
  const nc = await connect(natsConnection)
  console.log("Sucessfully connected")
  const sub = nc.subscribe('eventinfo.topic')
  for await (const m of sub) {
    const data = jc.decode(m.data)
    console.log(data)
    console.log(`avgVoltage: ${data.avgVoltage}`)
    influx.writePoints([
      {
        measurement: 'average_values',
        tags: { timestamp: data.timestamp },
        fields: {
          avgGlobalActivePower: data.avgGlobalActivePower,
          avgGlobalReactivePower: data.avgGlobalReactivePower,
          avgVoltage: data.avgVoltage,
          avgGlobalIntensity: data.avgGlobalIntensity,
        },
      }
    ]).catch(err => {
      console.error(`Error saving data to InfluxDB! ${err.stack}`)
    });
  }
  console.log("subscription closed");
}

main().catch(err => console.error("err: " + err.stack))