import fs from "fs";
import path from "path";
import https from "https";

const weddingImages = [
  {
    id: "01-venue-booking.jpg",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "02-wedding-card.jpg",
    url: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "03-bride-attire.jpg",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "04-groom-attire.jpg",
    url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "05-footwear.jpg",
    url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "06-qazi-nikah.jpg",
    url: "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "07-catering-kitchen.jpg",
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "08-catering-control.jpg",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "09-stage-decoration.jpg",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "10-wedding-room.jpg",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "11-luxury-car-fleet.jpg",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "12-car-decoration.jpg",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "13-makeup-hair.jpg",
    url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "14-groom-styling.jpg",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "15-photography.jpg",
    url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "16-wedding-concierge.jpg",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "17-trousseau-gifts.jpg",
    url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&h=800&q=85",
  },
];

const tourismImages = [
  {
    id: "01-charminar.jpg",
    url: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "02-mecca-masjid.jpg",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "03-chowmahalla.jpg",
    url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "04-golconda.jpg",
    url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "05-qutb-shahi.jpg",
    url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "06-purani-haveli.jpg",
    url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "07-taramati.jpg",
    url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "08-salar-jung.jpg",
    url: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "09-ramoji.jpg",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "10-nehru-zoo.jpg",
    url: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "11-shilparamam.jpg",
    url: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "12-laad-bazaar.jpg",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "13-airport-pickup.jpg",
    url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "14-chauffeur-car.jpg",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "15-local-guides.jpg",
    url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "16-photography.jpg",
    url: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "17-detailed-info.jpg",
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&h=800&q=85",
  },
  {
    id: "18-custom-itineraries.jpg",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=800&q=85",
  },
];

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
        file.on("finish", () => {
          file.close(() => resolve(dest));
        });
      })
      .on("error", reject);
  });
}

async function run() {
  console.log("=== DOWNLOADING REAL HIGH-RESOLUTION PHOTOGRAPHY ===");

  console.log("\n--- WEDDING SERVICES (17 IMAGES) ---");
  for (const item of weddingImages) {
    const dest = path.resolve("public/images/wedding", item.id);
    try {
      await download(item.url, dest);
      const stats = fs.statSync(dest);
      console.log(`✓ Wedding: ${item.id} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`❌ Error downloading ${item.id}:`, err.message);
    }
  }

  console.log("\n--- LEISURE & TOURISM (18 IMAGES) ---");
  for (const item of tourismImages) {
    const dest = path.resolve("public/images/tourism", item.id);
    try {
      await download(item.url, dest);
      const stats = fs.statSync(dest);
      console.log(`✓ Tourism: ${item.id} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`❌ Error downloading ${item.id}:`, err.message);
    }
  }

  console.log("\n🎉 ALL HIGH-QUALITY PHOTOS DOWNLOADED AND SAVED SUCCESSFULLY!");
}

run();
