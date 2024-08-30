// service_worker.js
// const endpoint = "https://holymolytolli--backend-receipt-collector-endpoint-py-04cd48-dev.modal.run/";
const endpoint = "https://holymolytolli--crow-collect-endpoint-fastapi-app.modal.run/";

let cachedData = null;
let fetchPromise = null; // Promise to handle simultaneous fetch requests

function getExtensionId() {
  return chrome.runtime.id;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Fetching data...");
  fetchAndCacheData();
});

async function fetchAndCacheData() {
  console.log("fetchPromise BEFORE:", fetchPromise);
  console.log("Fetching data from API...");
  if (!fetchPromise) {
    console.log("No fetch in progress. Fetching data...");
    fetchPromise = fetchData().finally(() => {
      fetchPromise = null;
    });
  }
  console.log("Waiting for fetch to complete...");
  console.log("fetchPromise AFTER:", fetchPromise);
  return fetchPromise;
}

async function fetchData() {
  const userId = getExtensionId();
  try {
    const response = await fetch(`${endpoint}get_connected_hostnames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId }),
    });
    if (response.ok) {
      cachedData = await response.json();
      console.log("Data fetched and cached:", cachedData);
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw new Error("Data fetch failed");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getData") {
    if (!cachedData) {
      fetchAndCacheData()
        .then(() => sendResponse(cachedData))
        .catch(console.error);
    } else {
      sendResponse(cachedData);
    }
    return true; // Indicates asynchronous response
  }
  if (message.action === "fetchData") {
    fetchAndCacheData()
      .then(() => sendResponse(cachedData))
      .catch(console.error);
    return true; // Indicates asynchronous response
  }
});
