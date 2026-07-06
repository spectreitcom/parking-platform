import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/app/"!</div>;
}
