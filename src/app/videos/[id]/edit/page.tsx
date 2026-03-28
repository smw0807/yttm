export default function MemoEditPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Memo Edit: {params.id} (WIP)</p>
    </main>
  );
}
