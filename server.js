const puppeteer = require("puppeteer-core");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/checkAvailability", async (req, res) => {
    const { checkIn, checkOut, apartment } = req.query;

    if (!checkIn || !checkOut || !apartment) {
        return res.status(400).json({ error: "Check-in, Check-out e il tipo di appartamento sono obbligatori" });
    }

    const url = `https://www.casaneifiori.it/risultati-di-ricerca/?mphb_check_in_date=${checkIn}&mphb_check_out_date=${checkOut}&mphb_adults=1&mphb_children=0`;

    try {
        console.log(`🔍 Controllo disponibilità per: ${apartment} | Check-in: ${checkIn}, Check-out: ${checkOut}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ],
            executablePath: process.env.CHROME_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable"
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

        await new Promise(resolve => setTimeout(resolve, 5000));

        const availableRooms = await page.evaluate(() => {
            const roomElements = document.querySelectorAll(".mphb-room-type-title a");
            return Array.from(roomElements).map(el => el.innerText.trim());
        });

        await browser.close();

        console.log(`🏨 Strutture disponibili: ${availableRooms.length > 0 ? availableRooms.join(", ") : "Nessuna"}`);

        const isAvailable = availableRooms.some(room => room.toLowerCase().includes(apartment.toLowerCase()));

        console.log(`✅ Risultato: ${isAvailable ? "DISPONIBILE" : "NON DISPONIBILE"}`);

        res.json({ available: isAvailable });
    } catch (error) {
        console.error("❌ Errore Puppeteer:", error);
        res.status(500).json({ error: "Errore durante il controllo disponibilità" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
});
