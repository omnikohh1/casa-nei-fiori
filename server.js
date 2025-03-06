const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

async function getBrowser() {
    let launchOptions = {};

    if (process.env.RENDER) {
        launchOptions = {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        };
    } // Nessun 'else' necessario se non hai configurazioni locali specifiche

    try {
        const browser = await puppeteer.launch(launchOptions);
        return browser;
    } catch (error) {
        console.error("Errore durante l'avvio di Puppeteer:", error);
        throw error; // Rilancia l'errore
    }
}

app.get("/", (req, res) => {
    res.send("✅ Il server è attivo! Usa /checkAvailability per verificare la disponibilità.");
});

app.get("/checkAvailability", async (req, res) => { // <-- async è FONDAMENTALE qui
    const { checkIn, checkOut, apartment } = req.query;

    if (!checkIn || !checkOut || !apartment) {
        return res.status(400).json({ error: "Check-in, Check-out e il tipo di appartamento sono obbligatori" });
    }

    const url = `https://www.casaneifiori.it/risultati-di-ricerca/?mphb_check_in_date=${checkIn}&mphb_check_out_date=${checkOut}&mphb_adults=1&mphb_children=0`;

    let browser; // Dichiara browser FUORI dal try
    try {
        console.log(`🔍 Controllo disponibilità per: ${apartment} | Check-in: ${checkIn}, Check-out: ${checkOut}`);

        browser = await getBrowser(); // await è corretto perché siamo in una funzione async
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

        const availableRooms = await page.evaluate(() => {
            const roomElements = document.querySelectorAll(".mphb-room-type-title a");
            return Array.from(roomElements).map(el => el.innerText.trim());
        });

        console.log(`🏨 Strutture disponibili: ${availableRooms.length > 0 ? availableRooms.join(", ") : "Nessuna"}`);

        const isAvailable = availableRooms.some(room => room.toLowerCase().includes(apartment.toLowerCase()));

        console.log(`✅ Risultato: ${isAvailable ? "DISPONIBILE" : "NON DISPONIBILE"}`);

        res.json({ available: isAvailable });

    } catch (error) {
        console.error("❌ Errore Puppeteer:", error);
        res.status(500).json({ error: "Errore durante il controllo disponibilità" });
    } finally {
        if (browser) {
            await browser.close(); // Chiudi SEMPRE il browser, anche in caso di errore
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);
});