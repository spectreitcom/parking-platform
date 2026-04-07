import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { config } from 'dotenv';

config();

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'parking-api',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.TRACE_EXPORTER_URL,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('Tracing initialized');
} catch (error) {
  console.error('Error initializing tracing', error);
}

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
