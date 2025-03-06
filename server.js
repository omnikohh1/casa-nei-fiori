const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

async function getBrowser() {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', // FORZATO
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        return browser;
    } catch (error) {
        console.error("Errore durante l'avvio di Puppeteer:", error);
        throw error;
    }
}

    if (process.env.RENDER) {  // Controlla se l'app è in esecuzione su Render
        launchOptions = {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser', // Usa variabile d'ambiente, fallback a percorso standard
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Opzioni necessarie su Render
        };
    } else {
        // Configurazioni locali (se necessario, altrimenti lascia vuoto)
        // launchOptions = { ... };
    }

    try {
        const browser = await puppeteer.launch(launchOptions);
        return browser; // Restituisci il browser
    } catch (error) {
        console.error("Errore durante l'avvio di Puppeteer:", error);
        throw error; // Rilancia l'errore per gestirlo più in alto
    }
}

// ✅ Aggiunto handler per la root "/"
app.get("/", (req, res) => {
    res.send("✅ Il server è attivo! Usa /checkAvailability per verificare la disponibilità.");
});

// 🔍 Endpoint per la disponibilità
app.get("/checkAvailability", async (req, res) => {
    const { checkIn, checkOut, apartment } = req.query;

    if (!checkIn || !checkOut || !apartment) {
        return res.status(400).json({ error: "Check-in, Check-out e il tipo di appartamento sono obbligatori" });
    }

    const url = `https://www.casaneifiori.it/risultati-di-ricerca/?mphb_check_in_date=${checkIn}&mphb_check_out_date=${checkOut}&mphb_adults=1&mphb_children=0`;

    let browser; // Dichiara browser qui
    try {
        console.log(`🔍 Controllo disponibilità per: ${apartment} | Check-in: ${checkIn}, Check-out: ${checkOut}`);

        browser = await getBrowser(); // Ottieni il browser
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

        // await new Promise(resolve => setTimeout(resolve, 5000)); //Non piu' necessario, hai gia' waitUntil

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
            await browser.close(); //Chiudi il browser *dopo* averlo usato! Mettilo in un finally per essere *sicuro* che venga chiuso
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`); //Non mettere l'indirizzo locale, se il deploy e' su Render
    console.log(`🚀 Server in esecuzione sulla porta ${PORT}`); //Usa la variabile PORT
});