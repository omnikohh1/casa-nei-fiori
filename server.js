const puppeteer = require("puppeteer-core");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

async function getBrowser() {
    let launchOptions = {};
    let executablePath; // Dichiara la variabile qui

    if (process.env.RENDER) {
        console.log("Siamo su Render - Configurazione:");

        // Usa prima la variabile d'ambiente, poi il fallback
        executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || require('puppeteer-core').executablePath();
        console.log("executablePath:", executablePath); // Stampa il valore effettivo

        launchOptions = {
            executablePath: executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        };

        // LOG: Controlla se il file esiste
        const fs = require('fs').promises;
        try {
            const stats = await fs.stat(launchOptions.executablePath);
            console.log("Il file esiste:", stats);
        } catch (error) {
            console.error("Errore fs.stat:", error);
        }
    }

    try {
        const browser = await puppeteer.launch(launchOptions);
        return browser;
    } catch (error) {
        console.error("Errore durante l'avvio di Puppeteer:", error);
        console.error("Opzioni di lancio:", launchOptions);
        throw error;
    }
}

// ... (il resto del tuo codice rimane invariato) ...
app.get("/", (req, res) => {
    res.send("✅ Il server è attivo! Usa /checkAvailability per verificare la disponibilità.");
});

app.get("/checkAvailability", async (req, res) => {
	const { checkIn, checkOut, apartment } = req.query;

	if (!checkIn || !checkOut || !apartment) {
		return res.status(400).json({ error: "Check-in, Check-out e il tipo di appartamento sono obbligatori" });
	}

	const url = `https://www.casaneifiori.it/risultati-di-ricerca/?mphb_check_in_date=<span class="math-inline">\{checkIn\}&mphb\_check\_out\_date\=</span>{checkOut}&mphb_adults=1&mphb_children=0`;

	let browser; // Dichiara browser FUORI dal try
	try {
		console.log(`🔍 Controllo disponibilità per: ${apartment} | Check-in: ${checkIn}, Check-out: ${checkOut}`);

		browser = await getBrowser();
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
			await browser.close();
		}
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);
});