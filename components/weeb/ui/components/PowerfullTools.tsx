'use client';
import React from 'react';
import Image from 'next/image';
import { SlideUp, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

const PowerfullTools = () => {
  return (
    <div className='grid grid-cols-[40%_60%] max-w-5xl mx-20'>
      <SlideUp className='flex flex-col justify-center gap-4 items-start mt-40 mb-20'>
        <p className='text-white text-sm'>POWERFUL FEATURES</p>
        <h1 className='text-white text-5xl'>Everything your team needs to succeed</h1>
        <p className='text-gray-300 text-sm w-[75%]'>Twillo comes packed with features designed for modern teams. From customizable boards and lists to powerful automations and integrations, we provide all the tools you need to keep projects on track and teams aligned.</p>
        <StaggerContainer staggerDelay={0.1} className='text-gray-300 text-sm space-y-2 mt-4'>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Drag-and-drop Kanban boards</li>
          </StaggerItem>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Real-time collaboration</li>
          </StaggerItem>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Custom workflows & automations</li>
          </StaggerItem>
          <StaggerItem>
            <li className='flex items-center gap-2'><span className='text-blue-500'>✓</span> Integrations with your favorite tools</li>
          </StaggerItem>
        </StaggerContainer>
      </SlideUp>
      <FadeIn direction='left' delay={0.2}>
        <Image alt='...' src="/weeb/Desktop.svg" className='relative top-20' width={1000} height={500} />
      </FadeIn>
    </div>
  );
};

export default PowerfullTools;
