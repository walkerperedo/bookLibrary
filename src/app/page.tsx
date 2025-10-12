import Link from 'next/link'

export default function Splash() {
  return (
    <main className="grid md:grid-cols-2 min-h-screen">
      <section className="bg-splash-gradient text-white flex items-center justify-center p-8">
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold italic">booky</h1>
          <p className="mt-6 text-lg opacity-90">Your book library at the office</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-4">
          <Link href="/login" className="btn-primary w-full text-center">
            Log in
          </Link>
          <Link href="/login" className="btn w-full text-center">
            Sign up
          </Link>
        </div>
      </section>
    </main>
  )
}
