'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import BrAPI from '@solgenomics/brapijs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cleanResponse, customBrapiCall } from '../utils/brapi-helpers';

// Import the cleanResponse and customBrapiCall functions from a shared utility file

export default function TrialsSubmission() {
  const [serverUrl, setServerUrl] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [studyDbId, setStudyDbId] = useState('');
  const [trialsData, setTrialsData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    setServerUrl(searchParams.get('serverUrl') || '');
    setStudyDbId(searchParams.get('studyDbId') || '');
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      const cleanServerUrl = serverUrl.replace(/\/$/, '');
      const authToken = "XXXX";  // Replace with your actual auth token or token retrieval logic

      console.log('Initializing BrAPI with URL:', cleanServerUrl);
      const brapi = BrAPI(cleanServerUrl, '1.3', authToken);

      console.log('Submitting trials data for study:', studyDbId);
    
      let parsedTrialsData;
      try {
        parsedTrialsData = JSON.parse(trialsData);
      } catch (jsonError) {
        throw new Error('Invalid JSON for trials data: ' + (jsonError instanceof Error ? jsonError.message : String(jsonError)));
      }
  
      try {
        // Replace 'studies_trials_modify' with the correct BrAPI method for submitting trials data
        const data = await customBrapiCall(brapi, 'trials_modify', {
          studyDbId: studyDbId,
          trials: parsedTrialsData
        }, cleanServerUrl, authToken);
        console.log('Trials submission response:', data);
        const cleanedData = cleanResponse(data);
        setResponse(cleanedData);
      } catch (err) {
        console.error('Error in BrAPI call:', err);
        setError('Error in BrAPI call: ' + (err instanceof Error ? err.message : String(err)));
      }
    } catch (error) {
      console.error('Error in try block:', error);
      setError('Error in try block: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trials Submission</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="serverUrl" className="block mb-2">
            BrAPI Server URL (without trailing slash):
          </label>
          <input
            type="text"
            id="serverUrl"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Enter BrAPI Server URL"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="studyDbId" className="block mb-2">
            Study DbId:
          </label>
          <input
            type="text"
            id="studyDbId"
            value={studyDbId}
            onChange={(e) => setStudyDbId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Enter Study DbId"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="trialsData" className="block mb-2">
            Trials Data (JSON):
          </label>
          <textarea
            id="trialsData"
            value={trialsData}
            onChange={(e) => setTrialsData(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Enter Trials Data JSON"
            rows={5}
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </form>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      {response && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      <div className="fixed top-4 right-4">
        <Link href={`/observations-submission?serverUrl=${encodeURIComponent(serverUrl)}&studyDbId=${encodeURIComponent(studyDbId)}`} className="bg-green-500 text-white px-4 py-2 rounded">
          Switch to Observations
        </Link>
      </div>
    </div>
  );
}