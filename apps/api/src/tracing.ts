import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { config } from 'dotenv';

config();

const traceExporterUrl = process.env.TRACE_EXPORTER_URL;
if (!traceExporterUrl) {
  throw new Error('TRACE_EXPORTER_URL is not defined in environment variables');
}

const logExporterUrl = process.env.LOG_EXPORTER_URL;
if (!logExporterUrl) {
  throw new Error('LOG_EXPORTER_URL is not defined in environment variables');
}

const metricExporterUrl = process.env.METRIC_EXPORTER_URL;
if (!metricExporterUrl) {
  throw new Error(
    'METRIC_EXPORTER_URL is not defined in environment variables',
  );
}

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'parking-api',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: traceExporterUrl,
  }),
  logRecordProcessors: [
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: logExporterUrl,
      }),
    ),
  ],
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: metricExporterUrl,
      }),
    }),
  ],
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
