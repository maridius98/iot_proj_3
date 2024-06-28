const axios = require('axios');

const ekuiperUrl = 'http://ekuiper:9081';

async function setupEkuiper() {
  try {
    await axios.post(`${ekuiperUrl}/streams`, {
      sql: `CREATE STREAM sensor_stream (
        globalActivePower FLOAT,
        globalReactivePower FLOAT,
        voltage FLOAT,
        globalIntensity FLOAT,
        timestamp BIGINT
      ) WITH (FORMAT="JSON", DATASOURCE="sensor/topic")`
    });

    await axios.post(`${ekuiperUrl}/rules`, {
      id: 'low_voltage_id',
      sql: `SELECT * FROM sensor_stream WHERE avgVoltage < 240`,
      actions: [
        {
          mqtt: {
            server: 'mqtt://mosquitto:1883',
            topic: 'low_voltage_topic'
          }
        }
      ]
    });

    console.log('Successfully set up eKuiper');
  } catch (error) {
    console.error(`Error setting up eKuiper: ${error}`);
  }
}

setupEkuiper();