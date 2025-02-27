/* eslint-disable no-restricted-globals */

self.onmessage = (event) => {
  const { data } = event;
  console.log("Worker received data:", data);

  // Ensure data is an array
  if (!Array.isArray(data)) {
    console.error("Worker error: Expected an array but got", typeof data);
    return;
  }

  // Process data
  const processedData = data.map((item) => ({
    ...item,
    extraField: "Processed",
  }));

  // Send data back to main thread
  self.postMessage(processedData);
};
