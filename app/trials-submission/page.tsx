'use client';

import React, { Suspense } from 'react';
import TrialsSubmission from './TrialsSubmission';

export default function TrialsSubmissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrialsSubmission />
    </Suspense>
  );
}