import fs from "fs";
import path from "path";
import https from "https";

const items = [
  {
    name: "01-charminar.jpg",
    url: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "02-mecca-masjid.jpg",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "03-chowmahalla.jpg",
    url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "04-golconda.jpg",
    url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "05-qutb-shahi.jpg",
    url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "06-purani-haveli.jpg",
    url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "07-taramati.jpg",
    url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "08-salar-jung.jpg",
    url: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "09-ramoji.jpg",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "10-nehru-zoo.jpg",
    url: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "11-shilparamam.jpg",
    url: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "12-laad-bazaar.jpg",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "13-airport-pickup.jpg",
    url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "14-chauffeur-car.jpg",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "15-local-guides.jpg",
    url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "16-photography.jpg",
    url: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "17-detailed-info.jpg",
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    name: "18-custom-itineraries.jpg",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=800&q=85",
  },
];

const destDir = path.resolve("public/images/tourism/destinations");
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", reject);
  });
}

async function start() {
  console.log("=== DOWNLOADING DESTINATIONS TO FRESH PATHS ===");
  for (const item of items) {
    const dest = path.join(destDir, item.name);
    try {
      await download(item.url, dest);
      console.log(`✓ Saved ${item.name} (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`❌ Failed ${item.name}: ${e.message}`);
    }
  }
  console.log("All 18 destinations downloaded successfully!");
}

start();
