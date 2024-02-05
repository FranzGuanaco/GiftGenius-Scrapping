// config/scrapingTargets.js

const scrapingTargets = [
    {
      url: "https://gentlebands.com/product/the-serenity/?utm_source=google&utm_medium=cpc&utm_campaign=%7B_campaign%7D&utm_term=%7Bkeyword%7D&utm_content=%7Bcreative%7D&gad_source=1&gclid=Cj0KCQiAwbitBhDIARIsABfFYIIehgbfqoSb3TW8bH0-jfLYWohMokLpE1UzXmBIjYvFmkQW6b-TYosaAqqyEALw_wcB",
      selectors: {
        price: ".woocommerce-Price-amount.amount",
        name: ".product_title",
        size: ".vi-wpvs-option-button",
        description: ".woocommerce-Tabs-panel--description" // Corrigé le double point qui était erroné
      }
    },
    {
      url: "https://kompsos.co/products/triple-stack-sterling-silver-face-ring?gad_source=1&gclid=CjwKCAiAq4KuBhA6EiwArMAw1OtOFWWt9qmYS5uHdEfLI4s30Hfn99g4xEhD2V0Umfqjm03KXw3b3hoCqrwQAvD_BwE&tw_adid=&tw_campaign=20024590511&tw_source=google&utm_campaign=sag_organic&utm_content=sag_organic&utm_medium=product_sync&utm_source=google&variant=40243164184678",
      selectors: {
        price: ".sc-iidyiZ.ecKxKU.pf-325_", // Assurez-vous que les sélecteurs sont corrects. Utilisez des points pour séparer les classes
        name: ".sc-cvlWTT.hZWulC.pf-323_.pf-hide", // Utilisez des points pour séparer les classes
        size: ".sc-iidyiZ.ecKxKU.pf-325_", // Utilisez des guillemets simples
        description: ".sc-gVkuDy.gNHRTW.pf-401_" // Utilisez des points pour séparer les classes
      }
    }
    // Ajoutez d'autres cibles de scraping selon vos besoins
  ];
  
  module.exports = scrapingTargets;
  