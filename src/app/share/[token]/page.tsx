export default function SharePage({ params }: { params: { token: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Shared Timeline: {params.token} (WIP)</p>
    </main>
  );
}
