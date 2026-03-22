'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { FadeIn, SlideUp } from '@/components/animations';

const TestimonialsComponents = () => {
  return (
    <div className='bg-gray-900 w-full py-20'>
      <div className='grid grid-cols-[33%_34%_33%] max-w-6xl mx-auto'>
        <FadeIn direction='right' className='flex flex-col justify-center gap-4 items-start mt-20 mb-20 mr-20'>
          <p className='text-white text-sm'>CUSTOMER STORY</p>
          <h1 className='text-white text-5xl'>How Streamline scaled to 500+ tasks</h1>
          <Link href="/solutions" className='hidden md:flex'>
            <span className=" hidden md:inline-flex group text-sm relative -ml-6 items-center text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto">
              Read Case Study <ArrowRight className="ml-2 w-5 h-5" color='white' />
            </span>
          </Link>
        </FadeIn>
        <SlideUp delay={0.2}>
          <Image alt='...' src="/weeb/Mobile-App-Placeholder-2.svg" className='relative top-20 -left-10' width={1000} height={1000} />
        </SlideUp>
        <FadeIn direction='left' delay={0.3} className="flex flex-col justify-center gap-4 items-start mt-20">
          <p>
            &quot;Twillo transformed how our engineering team manages sprints. We went from scattered spreadsheets to a visual board that everyone loves. Productivity increased by 40% in the first quarter.&quot;
          </p>
          <div className='flex flex-row justify-center gap-4 items-start mb-20'>
            <Image alt='...' src="/weeb/User-Thumb.svg" className='relative' width={50} height={50} />
            <div className='flex flex-col justify-center gap-1 items-start'>
              <p className='text-white text-sm'>Sarah Chen</p>
              <p className='text-gray-300 text-sm w-full'>
                VP of Engineering, Streamline
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default TestimonialsComponents;
