import { connect, JSONCodec } from "nats";
import Influx from "influx";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
const token = 'yp1TduBCbqoAbIpemw62O5QpyNshnORrpaFy7Ji-6uEQJRhQaAnOXEqfd48pT4QGOOvR47-086jDkH8zZfiSbw=='
const org = 'elfak'
const bucket = 'mydb'

const client = new InfluxDB({url: 'http://influxdb:8086', token: token})
const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({host: 'influxdb'})
const natsConnection = {
  "servers": "nats://nats:4222"
}


// const influx = new Influx.InfluxDB({
//   host: 'influxdb',
//   database: 'mydb',
//   token: 'yp1TduBCbqoAbIpemw62O5QpyNshnORrpaFy7Ji-6uEQJRhQaAnOXEqfd48pT4QGOOvR47-086jDkH8zZfiSbw==',
//   schema: [
//     {
//       measurement: 'average_values',
//       fields: {
//         avgGlobalActivePower: Influx.FieldType.FLOAT,
//         avgGlobalReactivePower: Influx.FieldType.FLOAT,
//         avgVoltage: Influx.FieldType.FLOAT,
//         avgGlobalIntensity: Influx.FieldType.FLOAT,
//       },
//       tags: ['timestamp']
//     }
//   ]
// });

const jc = JSONCodec()

const main = async () => {
  const nc = await connect(natsConnection)
  console.log("Sucessfully connected")
  const sub = nc.subscribe('eventinfo.topic')
  for await (const m of sub) {
    const data = jc.decode(m.data)
    console.log(data)
    console.log(`avgVoltage: ${data.avgVoltage}`)
    const point = new Point('average_values')
      .tag('timestamp', data.timestamp)
      .floatField('avgGlobalActivePower', data.avgGlobalActivePower)
      .floatField('avgGlobalReactivePower', data.avgGlobalReactivePower)
      .floatField('avgVoltage', data.avgVoltage)
      .floatField('avgGlobalIntensity', data.avgGlobalIntensity);
      writeApi.writePoint(point)
      }

      
  console.log("subscription closed");
}

main().catch(err => console.error("err: " + err.stack))