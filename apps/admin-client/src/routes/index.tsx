import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="page-wrap">
      <h1>Hello</h1>
    </main>
  );
}
