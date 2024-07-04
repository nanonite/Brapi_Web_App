// Function to handle circular references
// Function to handle circular references and clean the response
export const cleanResponse = (obj: any): any => {
    const seen = new WeakSet();
    const cleanObj = (value: any) : any => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
        if (Array.isArray(value)) {
          return value.map(cleanObj);
        }
        return Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => key !== '__response')
            .map(([key, val]) => [key, cleanObj(val)])
        );
      }
      return value;
    };
    return cleanObj(obj);
  };

interface BrAPINode {
  each: (callback: (data: any) => void) => BrAPINode;
  all: (callback: (data: any) => void) => void;
  brapi: {
    call: (method: string, urlPath: string, params: any, page?: any) => Promise<any>;
  };
}

interface BrAPI {
  [key: string]: (params: any) => BrAPINode;
}

export const customBrapiCall = (brapi: BrAPI, method: string, params : any, serverUrl : string, authToken : string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const brapiNode = brapi[method](params);
    
    // Override the call method to intercept the raw response
    brapiNode.brapi.call = function(method, urlPath, params, page) {
      const fullUrl = `${serverUrl}${urlPath}`;
      console.log('BrAPI Call:', method, fullUrl, JSON.stringify(params));
      console.log('Sending token:', authToken);
      return fetch(fullUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(params)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Raw server response:', JSON.stringify(data, null, 2));
        return data;
      });
    };

    brapiNode.each(data => {
      console.log('Processed response:', data);
      resolve(data);
    }).all(data => {
      if (!data || data.length === 0) {
        reject(new Error('No data returned'));
      }
    });
  });
};
