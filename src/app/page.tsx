'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <div className="app-shell" aria-busy="true" />,
});

export default function HomePage() {
  return <App />;
}
