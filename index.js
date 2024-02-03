const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg'); // PostgreSQL client
const axios = require('axios');
const { error } = require('console');

// Fonction principale asynchrone
async function main() {
  // Configuration de la connexion à la base de données PostgreSQL
  const client = new Client({
    user: 'pierrechevin',
    host: 'localhost',
    database: 'GiftGenius',
    password: 'Elsalvador60?',
    port: 5432, // Port par défaut de PostgreSQL
  });

  try {
    // Connexion à la base de données PostgreSQL
    await client.connect();
    console.log('Connecté à la base de données PostgreSQL avec succès');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données PostgreSQL:', error);
    return; // Arrête l'exécution du programme en cas d'erreur de connexion
  }

  // Initialisation du navigateur Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // URL du produit à scraper
  const url = 'https://gentlebands.com/product/the-serenity/?utm_source=google&utm_medium=cpc&utm_campaign=%7B_campaign%7D&utm_term=%7Bkeyword%7D&utm_content=%7Bcreative%7D&gad_source=1&gclid=Cj0KCQiAwbitBhDIARIsABfFYIIehgbfqoSb3TW8bH0-jfLYWohMokLpE1UzXmBIjYvFmkQW6b-TYosaAqqyEALw_wcB';

  try {
    // Navigation vers l'URL spécifiée
    await page.setDefaultNavigationTimeout(60000);
    await page.goto(url);
    await page.waitForSelector('.woocommerce-Price-amount.amount');

    // Extraction du prix du produit
    const priceElement = await page.$('.woocommerce-Price-amount.amount');
    const priceText = await page.evaluate(priceElement => priceElement.textContent, priceElement);

    // Extraction nom
    const productNameElement = await page.$('.product_title');
    const productNameText = await page.evaluate(productNameElement => productNameElement.textContent, productNameElement);

    // Extraction taille
    const sizeElement = await page.$('.vi-wpvs-option-button');
    const sizeText = await page.evaluate(sizeElement => sizeElement.textContent, sizeElement);

    // Extraction description
    const descriptionElement = await page.$('.woocommerce-Tabs-panel--description');
    const descriptionText = await page.evaluate(descriptionElement => descriptionElement.textContent, descriptionElement);

    console.log('Prix du produit:', priceText);
    console.log('Nom:', productNameText);
    console.log('Taille du produit:', sizeText);

    // // Extraction de l'image du produit
    const imageURL = 'https://d24r3siuq13q9r.cloudfront.net/202210/1016e3ce-66a8-4c30-b0a4-cfa19d9c1d49.jpg';
    const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Insertion de name dans Seller s'il n'existe pas encore
    const SellerName = 'INSERT INTO seller (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING pk';
    const SellerValue = ['Le premier ecom'];

    // Utilisez SellerId comme clé étrangère de SellerValue
    const sellerResult = await client.query(SellerName, SellerValue);

    // Verification et de la creation du sellerID pour l'inserer dans products comme FK
   
    let sellerId;
    let result;

    // Verification que l'acteur seller a bien été créé
    if (sellerResult.rows.length > 0) {
        sellerId = sellerResult.rows[0].pk;
        console.log('sellerId récupéré:', sellerId);
    } else {
        // Si aucune ligne n'est retournée, cela signifie que le vendeur existe déjà.
        // Vous devez alors récupérer son ID manuellement.
        const fetchSellerId = 'SELECT pk FROM seller WHERE name = $1';
        // result permet de selectionner le row dans la table seller ou le nom est celui deja mentionné dans le cas ou il existe deja
        result = await client.query(fetchSellerId, SellerValue);
        sellerId = result.rows[0].pk;
        console.log('sellerId existant récupéré:', sellerId);
    }
    
   
      // Utilisez sellerId pour l'insertion dans products
      const productInsertQuery = 
      'INSERT INTO products (name, description, seller_id, photo) VALUES ($1, $2, $3, $4) ON CONFLICT (name, seller_id) DO UPDATE SET description = EXCLUDED.description, photo = EXCLUDED.photo RETURNING pk;'
      const productValues = [productNameText, descriptionText, sellerId, imageBuffer];
      const productResult = await client.query(productInsertQuery, productValues);
// Si le produit existe la row est superieur et on accede a la premiere row existante à 0 sinon cela veut dire que cela n'existe pas et que c'est null
      const productId = productResult.rows.length > 0 ? productResult.rows[0].pk : null;
   

    try {
      if (sellerResult.rows.length > 0 )  {
        // Assurez-vous que l'indice [2] est correct en fonction de la structure des résultats
        const sellerId = sellerResult.rows[0].pk;

        console.log('Voici selledID:', sellerId);


        // Insertion de price et product comme fk dans Price
        const priceInsertQuery = 'INSERT INTO price (seller, price, link, product) VALUES ($1, $2, $3, $4)';
        const priceValues = [sellerId, priceText, imageURL, productId];

        await client.query(priceInsertQuery, priceValues);

        console.log('Image ajoutée à la base de données avec succès');

      
      } else {
        const sellerId = result.rows[0].pk;
    
        console.log('Voici sellerID:', sellerId);
    
        // Mise à jour de price dans la table Price
        const priceUpdateQuery = 'UPDATE price SET seller = $1, price = $2, link = $3 WHERE product = $4';
        const priceValues = [sellerId, priceText, imageURL, productId];
        await client.query(priceUpdateQuery, priceValues);

        console.error('La requête à updater la colonne Seller');
        // Gérez le cas où la requête pour Seller ne renvoie aucune ligne
      }
    } catch (sellerError) {
      console.error('Une erreur s\'est produite lors de l\'insertion des données Seller:', sellerError);
    }

    // async pour l'insertion de données et de la FK dans Occasion 
    
    try {
      if (productResult.rows.length > 0) {

        // Insertion dans Occasion de la FK
        const OccasionInsert = 'INSERT INTO occasion (product) VALUES ($1) ON CONFLICT (product) DO UPDATE SET product = $1';
        const Occasion = [productId];

        await client.query(OccasionInsert, Occasion);

      } else {

        console.error('Erreur product result est inferieur à 0');
        // Gérez le cas où la requête pour Product ne renvoie aucune ligne
      }
    } catch (productError) {
      console.error('Une erreur s\'est produite lors de l\'insertion des données Product:', productError);
    } finally {
      // Fermeture du navigateur et de la connexion à la base de données
      console.log('reussi');
      await browser.close();
      await client.end();
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la navigation ou de l\'insertion des données:', error);
  }
}

// Appel de la fonction principale
main();
