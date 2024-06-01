// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable globale pour récupérer les données
let globalData = null;

// Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
// Vérifier l'utilité - pour assigner les id aux boutons de filtres ???
async function getData () {

  const response = await fetch(worksUrl);
  globalData  = await response.json();
  console.table(globalData )

}
getData ();


// Fonction fetch pour récupérer les données et réaliser des traitements
fetch(worksUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('API injoignable ' + response.statusText);
    } 
    return response.json(); // Convertir la réponse en JSON
  })
  
  .then(data => { 
    // Boucler sur chaque objet et les afficher sur la page
    data.forEach(obj => {
        // Cibler le container où insérer les éléments et le stocker dans collection
        let collection = document.querySelector("#collection")

        // Crée un container Figure
        let element = document.createElement('figure');

        // Insérer le code HTML dans les containers Figure
        element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;

        // ajouter la classe avec l'id de catégory aux figures pour les filtrer avec le CSS
        element.classList.add(`cat-id-${obj.category.id}`)

        // ajouter au container stocké dans collection les elements figure
        collection.appendChild(element);
        // document.body.insertBefore(element, collection)       
    });
  }) 

  .catch(error => {
    console.error("Erreur durant l'opération fetch:", error);
  }
);



// Fonction pour créer les boutons de filtres 
function createFilters (){
  // Créer un div pour les boutons filtres
  let zoneFiltres = document.createElement('div');
  zoneFiltres.innerHTML = `<input type="submit" value="coucou" class="cat-id-"></input>`

  // Voir pour l'utilisation d'une boucle ici

  //  insérer le div dans la section portfolio après le titre
  let titrePortfolio = document.querySelector('#portfolio > h2');
  titrePortfolio.appendChild(zoneFiltres);

  // zoneBouton.appendChild(boutonFiltre)
  // let collection = document.querySelector("#collection")
  // collection.insertBefore(collection,figure)

};
// Appel de la fonction après un délai pour s'assurer que les données sont chargées
setTimeout(createFilters, 1000);








// --------------------------------------------------------------------
// Fonction de test pour l'utilisation des datas remontées en variable globale
function useGlobalData() {
  
  if (globalData) {
    console.log("Données disponibles:", globalData);
    
    // récupération de tous les noms de categories dans l'objet globalData
    for ( let i=0 ; i<globalData.length ; i++ ) {
      console.log (i + " " + globalData[i].category.name);
    }
    
    // console.log (globalData.length)
    // console.log (globalData)

  } else {
    console.log("Les données ne sont pas encore disponibles.");
  }
}

// Appel de la fonction après un délai pour s'assurer que les données sont chargées
setTimeout(useGlobalData, 1000);
