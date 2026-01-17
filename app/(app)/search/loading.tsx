export default function Loading() {
  return (
    <div className='min-h-screen bg-slate-50 container mx-auto px-4 py-8'>
      <div className='mb-8 space-y-2 animate-pulse'>
        <div className='h-8 w-64 bg-slate-200 rounded-lg'></div>
        <div className='h-4 w-48 bg-slate-200 rounded-lg'></div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        <aside className='w-full lg:w-72'>
           <div className='h-96 bg-slate-200 rounded-2xl animate-pulse'></div>
        </aside>

        <div className='flex-1 space-y-6'>
           <div className='h-64 bg-slate-200 rounded-2xl animate-pulse'></div>
           {[1, 2, 3].map(i => (
             <div key={i} className='h-40 bg-white rounded-2xl border border-slate-100 p-5 animate-pulse flex flex-col justify-between'>
                <div className='flex justify-between'>
                   <div className='h-10 w-10 bg-slate-100 rounded-full'></div>
                   <div className='h-8 w-24 bg-slate-100 rounded-lg'></div>
                </div>
                <div className='space-y-2'>
                   <div className='h-4 w-3/4 bg-slate-100 rounded'></div>
                   <div className='h-4 w-1/2 bg-slate-100 rounded'></div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
