import { SearchForm } from '@/components/search/SearchForm';
import { Suspense } from 'react';

export default function MarketingPage() {
  return (
    <div className='animate-up' style={{ animationDelay: '0.1s' }}>
      <Suspense fallback={<div className='h-20 w-full bg-white rounded-2xl animate-pulse'/>}>
        <div className='w-full max-w-4xl mx-auto'>
          <SearchForm />
        </div>
      </Suspense>
    </div>
  );
}
