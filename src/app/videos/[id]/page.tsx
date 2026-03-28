export default function VideoViewerPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Video Viewer: {params.id} (WIP)</p>
    </main>
  );
}
