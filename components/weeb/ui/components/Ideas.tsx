'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/animations';

const IdeasComponents = () => {
  return (
    <div className='grid grid-cols-[70%_30%] max-w-5xl mx-20'>
      <SlideUp className='flex flex-col justify-center gap-4 items-start mt-20 mb-20'>
        <p className='text-white text-sm'>VISUAL PROJECT MANAGEMENT</p>
        <h1 className='text-white text-5xl'>
          <span className='text-blue-600'>Unlimited</span> boards for your next great projects
        </h1>
        <p className='text-gray-300 text-sm w-[55%]'>Create custom Kanban boards for any project. Drag and drop tasks between columns, add due dates, assign team members, and track progress visually. Whether you&apos;re managing a product launch or planning a sprint, Twillo adapts to your workflow.</p>
        <Link href="/solutions" className='hidden md:flex'>
          <span className=" hidden md:inline-flex group text-xl relative -ml-6 items-center text-white px-6 py-2 mt-6 rounded-xl pointer-events-none group-hover:pointer-events-auto">
            Explore solutions <ArrowRight className="ml-2 w-5 h-5" color='white' />
          </span>
        </Link>
      </SlideUp>
      <FadeIn direction='left' delay={0.2}>
        <Image alt='...' src="/weeb/Shapes.svg" className='relative top-20 -left-10' width={1000} height={1000} />
      </FadeIn>
    </div>
  );
};

export default IdeasComponents;
