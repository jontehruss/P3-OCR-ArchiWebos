import { showTopBanner, authStatus, verifyToken, addEditButon } from "./shared.js";

// Appeller la fonction pour le status d'authentification
authStatus();


// Appeller la fonction pour afficher le bandeau top
showTopBanner();

// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable globale pour récupérer les données
let globalData = null;



// Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
// Vérifier l'utilité - pour assigner les id aux boutons de filtres ???
async function getData() {

  const response = await fetch(worksUrl);
  globalData = await response.json();
  // console.table(globalData )

}
getData();


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
      element.classList.add('works', `cat-id-${obj.category.id}`)

      // ajouter au container stocké dans collection les elements figure
      collection.appendChild(element);
      // document.body.insertBefore(element, collection)       
    });
  })

  .catch(error => {
    console.error("Erreur durant l'opération fetch:", error);
  }
  );

//  Chercher le token dans le local storage
if (verifyToken()) {
  console.log('utilisateur authentifié')
  addEditButon();
} else { 
  console.log('utilisateur inconnu')
}




// Fonction pour créer les boutons de filtres 
function createFilters() {
  // Créer un div pour les boutons filtres
  let zoneFiltres = document.createElement('div');
  zoneFiltres.className = 'btn-list';

  let all = document.createElement('input');
  all.type = 'button';
  all.value = 'Tous';
  all.className = 'btn-cat';
  all.id = '0'
  zoneFiltres.appendChild(all);


// créer un bouton pour chaque catégorie
  for (let i = 0; i < 3; i++) {
    let bouton = document.createElement('input');
    bouton.type = 'button';
    bouton.value = globalData[i].category.name;
    bouton.className = 'btn-cat';
    bouton.id = globalData[i].category.id;
    zoneFiltres.appendChild(bouton);
  };


  let titrePortfolio = document.querySelector('#portfolio > div');
  // insèrr après titrePortfolio sans l'imbriquer à l'intérieur avec insertAdjacentElement afterend
  titrePortfolio.insertAdjacentElement('afterend', zoneFiltres);

  filterWorks();

};

// Appel de la fonction après un délai pour s'assurer que les données sont chargées
/**
 * TODO : Tester avec async await !
 */
setTimeout(createFilters, 200);


// fonction pour lister les boutons filtres et ajouter un eventlistner
function filterWorks() {
  // cibler les boutons de filtre
  let TableauBoutonsFiltre = document.querySelectorAll('.btn-cat')
  console.log(TableauBoutonsFiltre);

  // Ajouter un eventlistner sur chaque boutons
  for (let i = 0; i < TableauBoutonsFiltre.length; i++) {
    TableauBoutonsFiltre[i].addEventListener('click', function () {

      console.log('catégorie : ' + [i])

      hideWorks(i);

    });
  };
};


// fonction appelée par le addEventListner au clic sur les boutons filtre catégorie
function hideWorks(id) {
  // lister tous les elements de la galerie
  let allWorks = document.querySelectorAll('#collection .works');

  // Parcourir tous les éléments
  allWorks.forEach(works => {
    // Si id = 0 alors on affiche tous les éléméents, autrement on affiche les éléments en fonction de leur id
    if (id === 0) {
      works.style.display = 'block';
    } else {
      if (works.classList.contains(`cat-id-${id}`)) {
        works.style.display = 'block';
      } else {
        works.style.display = 'none';
        console.log(`.cat-id-${id}`)
      }
    }
  }
  );
};



// --------------------------------------------------------------------
// Fonction de test pour l'utilisation des datas remontées en variable globale
function useGlobalData() {

  if (globalData) {
    // console.log("Données disponibles:", globalData);

    // récupération de tous les noms de categories dans l'objet globalData
    for (let i = 0; i < globalData.length; i++) {
      // console.log (i + " " + globalData[i].category.name);
    };

    // console.log (globalData.length)
    // console.log (globalData)

  } else {
    console.log("Les données ne sont pas encore disponibles.");
  };
};

// Appel de la fonction après un délai pour s'assurer que les données sont chargées
setTimeout(useGlobalData, 1000);

