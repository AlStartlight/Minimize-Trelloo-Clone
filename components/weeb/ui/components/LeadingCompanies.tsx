'use client';
import Image from 'next/image';
import React from 'react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

const LeadingCompanies = () => {
  return (
    <div className='flex flex-col justify-center items-center mt-20 mb-20'>
      <FadeIn>
        <h1 className='text-white text-5xl text-center'>Trusted by Teams Worldwide</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className='text-gray-400 mt-4 text-center'>From startups to Fortune 500 companies</p>
      </FadeIn>
      <StaggerContainer staggerDelay={0.08} className='grid grid-cols-5 gap-15 mt-8'>
        <StaggerItem>
          <Image alt='Logo 1' src="/weeb/Logo-grey_1.svg" width={110} height={50} />
        </StaggerItem>
        <StaggerItem>
          <Image alt='Logo 2' src="/weeb/Logo-grey_2.svg" width={110} height={50} />
        </StaggerItem>
        <StaggerItem>
          <Image alt='Logo 3' src="/weeb/Logo-grey_3.svg" width={110} height={50} />
        </StaggerItem>
        <StaggerItem>
          <Image alt='Logo 4' src="/weeb/Logo-grey_5.svg" width={110} height={50} />
        </StaggerItem>
        <StaggerItem>
          <Image alt='Logo 5' src="/weeb/Logo-grey_4.svg" width={110} height={50} />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default LeadingCompanies;
