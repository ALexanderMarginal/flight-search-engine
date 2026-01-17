import { Plane } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden'>
      <div className='container mx-auto px-4 py-20 relative z-10'>
        <div className='max-w-3xl mx-auto text-center mb-12 animate-up'>
          <div className='inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm mb-6 border border-slate-100'>
            <span className='bg-indigo-100/50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mr-2'>New</span>
            <span className='text-slate-500 text-xs'>Experience the future of flight search</span>
          </div>
          
          <h1 className='text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight'>
            Find your next <br/>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600'>adventure</span>
          </h1>
          
          <p className='text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed'>
            Blazing fast search across thousands of airlines. Visual price trends. 
            Smart filtering. The modern way to fly.
          </p>
        </div>

        {children}
        
        <div className='mt-16 flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4'>
           <div className='flex items-center gap-2 text-slate-400 font-medium'>
              <Plane className='h-5 w-5' /> <span>Trusted by 10k+ Travelers</span>
           </div>
        </div>
      </div>
    </main>
  )
}
