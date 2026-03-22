'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/animations';

const CustomersComponents = () => {
  return (
    <div className='grid grid-cols-[70%_30%] max-w-5xl mx-20 py-20'>
      <SlideUp className='flex flex-col justify-center gap-4 items-start mt-20 mb-20'>
        <p className='text-white text-sm'>BUILT FOR TEAMS</p>
        <h1 className='text-white text-5xl'>
          <span className='text-blue-600'>Flexible</span> boards that work the way you do
        </h1>
        <p className='text-gray-300 text-sm w-[55%]'>Whether you&apos;re a software team running sprints, a marketing team planning campaigns, or an HR team managing hiring pipelines, Twillo adapts to your unique workflow. Customize columns, labels, and views to match how your team works.</p>
        <Link href="/register" className='hidden md:flex'>
          <span className=" hidden md:inline-flex group text-sm relative -ml-6 items-center text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto">
            Start building your board <ArrowRight className="ml-2 w-5 h-5" color='white' />
          </span>
        </Link>
      </SlideUp>
      <FadeIn direction='left' delay={0.2}>
        <Image alt='...' src="/weeb/ShapesAI.svg" className='relative top-20 -left-10' width={1000} height={1000} />
      </FadeIn>
    </div>
  );
};
export default CustomersComponents;
