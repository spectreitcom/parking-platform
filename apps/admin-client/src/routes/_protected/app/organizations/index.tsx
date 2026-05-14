import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app/organizations/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/app/organizations/"!</div>;
}
