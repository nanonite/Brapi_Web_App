'use client';

import React, { useState, FormEvent } from 'react';
import BrAPI from '@solgenomics/brapijs';
import Link from 'next/link';
import { cleanResponse, customBrapiCall } from '../utils/brapi-helpers';


export default function ObservationsSubmission() {
  const [serverUrl, setServerUrl] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [studyDbId, setStudyDbId] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      const cleanServerUrl = serverUrl.replace(/\/$/, '');
      const authToken = "XXXX";

      console.log('Initializing BrAPI with URL:', cleanServerUrl);
      const brapi = BrAPI(cleanServerUrl, '1.3',authToken);

      console.log('Submitting observations for study:', studyDbId);
    
      // Parse the observations JSON
      let parsedObservations;
      try {
        parsedObservations = JSON.parse(observations);
      } catch (jsonError) {
        throw new Error('Invalid JSON for observations: ' + (jsonError instanceof Error ? jsonError.message : String(jsonError)));
      }
  
      try {
        const data = await customBrapiCall(brapi, 'studies_observations_modify', {
          studyDbId: studyDbId,
          observations: parsedObservations
        }, cleanServerUrl,authToken);
        console.log('Observations submission response:', data);
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
      <h1 className="text-2xl font-bold mb-4">Observations Submissions</h1>
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
          <label htmlFor="observations" className="block mb-2">
            Observations (JSON):
          </label>
          <textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-500"
            placeholder="Enter Observations JSON"
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
        <Link href={`/trials-submission?serverUrl=${encodeURIComponent(serverUrl)}&studyDbId=${encodeURIComponent(studyDbId)}`} className="bg-green-500 text-white px-4 py-2 rounded">
          Switch to Trials
        </Link>
      </div>
    </div>
  );
}