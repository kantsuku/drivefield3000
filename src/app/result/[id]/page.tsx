export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <p className="text-sm text-gray-500 mb-4">あなたの疾走領域</p>
      <h1 className="text-6xl font-bold mb-2">龍牙</h1>
      <p className="text-lg text-gray-400 mb-8">Dragon Fang</p>
      <p className="text-xs text-gray-600">Pattern ID: {id}</p>
    </main>
  );
}
