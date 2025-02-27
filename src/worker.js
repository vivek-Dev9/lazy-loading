/* eslint-disable no-restricted-globals */

self.onmessage = (event) => {
  const { action, data } = event.data;

  console.log("Worker received:", action, "Data Type:", typeof data);

  if (action === "processData") {
    if (!Array.isArray(data)) {
      console.error("Worker Error: Expected an array but got", data);
      self.postMessage({ error: "Invalid data format received" });
      return;
    }

    // Process API data
    const processedData = data.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      userId: item.userId,
    }));

    // Send processed data back
    self.postMessage({ action: "processedData", data: processedData });
  }
};
