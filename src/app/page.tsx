import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
        疾走領域
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-2">
        Drive Field 3000
      </p>
      <p className="text-sm text-gray-500 mb-12 max-w-md text-center">
        鏡は嘘をつかない。ただ、お前が見ていなかった領域を映すだけだ。
      </p>
      <Link
        href="/diagnosis"
        className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors"
      >
        開眼する
      </Link>
    </main>
  );
}
