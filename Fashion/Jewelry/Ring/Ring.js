const puppeteer = require('puppeteer');
const { Client } = require('pg'); // PostgreSQL client
const scrapingTargets = require('./ringScrapingElements'); // Utilisez require pour rester cohérent

async function main() {
  const client = new Client({
    user: 'pierrechevin',
    host: 'localhost',
    database: 'GiftGenius',
    password: 'Elsalvador60?',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connecté à la base de données PostgreSQL avec succès');

    const browser = await puppeteer.launch({ headless: true }); // Correction de la configuration headless
    const page = await browser.newPage();

    for (const target of scrapingTargets) { // Itération sur chaque cible de scraping
      try {
        await page.setDefaultNavigationTimeout(60000);
        await page.goto(target.url);
        await page.waitForSelector(target.selectors.price);

    
        const priceText = await page.$eval(target.selectors.price, el => el.textContent);
        const productNameText = await page.$eval(target.selectors.name, el => el.textContent);
        const sizeText = target.selectors.size ? await page.$eval(target.selectors.size, el => el.textContent) : 'N/A';
        const descriptionText = await page.$eval(target.selectors.description, el => el.textContent);

        console.log('URL:', target.url);
        console.log('Prix du prod:', priceText);
        console.log('Nom:', productNameText);
        console.log('Taille du produit:', sizeText);
        console.log('Description:', descriptionText);

        // Ici, vous pouvez insérer les données extraites dans votre base de données
      } catch (error) {
        console.error('Erreur lors du scraping de la cible:', target.url, error);
      }
    }

    await browser.close(); // Fermeture du navigateur après le scraping
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données PostgreSQL ou lors du scraping:', error);
  } finally {
    await client.end(); // Assurez-vous de fermer la connexion à la base de données
  }
}

main();
