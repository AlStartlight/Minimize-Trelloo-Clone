'use client';
import React from 'react';
import Image from 'next/image';
import { SlideUp, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

const SpeedComponents = () => {
  return (
    <div className='grid grid-cols-[40%_60%] max-w-5xl mx-20 pb-40 pt-10'>
      <SlideUp className='flex flex-col justify-center gap-4 items-start mt-40 mb-20'>
        <p className='text-white text-sm'>REAL-TIME COLLABORATION</p>
        <h1 className='text-white text-5xl'>Work together, from anywhere</h1>
        <p className='text-gray-300 text-sm w-[75%]'>See changes instantly as your team updates tasks, moves cards, and adds comments. Twillo keeps everyone on the same page with real-time sync across all devices. No more waiting for updates or chasing down status reports.</p>
        <StaggerContainer staggerDelay={0.1} className='text-gray-300 text-sm space-y-2 mt-4'>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Live updates across all devices</li>
          </StaggerItem>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> @mentions and notifications</li>
          </StaggerItem>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> File attachments and comments</li>
          </StaggerItem>
        </StaggerContainer>
      </SlideUp>
      <FadeIn direction='left' delay={0.2}>
        <Image alt='...' src="/weeb/Desktop.svg" className='relative top-20' width={1000} height={500} />
      </FadeIn>
    </div>
  );
};

export default SpeedComponents;
