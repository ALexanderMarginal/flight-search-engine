import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-slate-50 pb-20'>
      {/* Header / Search Bar Compact */}
      <header className='bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex flex-col md:flex-row items-center gap-4'>
            <div className='font-bold text-xl text-indigo-600 tracking-tight mr-8 hidden md:block'>
              FlightSearch
            </div>
            <div className='flex-1 w-full'>
              <nav>
                <Link href='/'>
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
    
      <main className='container mx-auto px-4 py-8'>
        {children}
      </main>
    </div>
  );
}
