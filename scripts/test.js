// stress-test.js
import fetch from "node-fetch";

const NUM_REQUESTS = 10; // скільки одночасних запитів
const URL = "https://pixegotchi.run.place/health"; // твій backend

async function runTest() {
  const start = Date.now();

  // запускаємо NUM_REQUESTS одночасно
  const requests = Array.from({ length: NUM_REQUESTS }, () =>
    fetch(URL)
      .then((res) => res.text())
      .catch((err) => err),
  );

  const results = await Promise.all(requests);

  const end = Date.now();
  console.log(`Completed ${NUM_REQUESTS} requests in ${end - start} ms`);
  console.log(`Results sample:`, results.slice(0, 5));
}

runTest();
