import { showTopBanner, authStatus, verifyToken, addEditButon } from "./shared.js";

// Appeller la fonction pour le status d'authentification
authStatus();

// Appeller la fonction pour afficher le bandeau top
showTopBanner();

// Par défaut Masquer la modale
hideModal();
hideAddPicModal();

// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable globale pour récupérer les données
let globalData = null;


function checkAuthStatus() {
  //  Chercher le token dans le local storage
  if (verifyToken()) {
    console.log(verifyToken())
    // console.log('utilisateur authentifié')
    addEditButon();
    // hideFilters();
  } else {
    // console.log('utilisateur inconnu')
  }
}

checkAuthStatus();


// Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
// Vérifier l'utilité - pour assigner les id aux boutons de filtres ???
async function getData() {
  const response = await fetch(worksUrl);
  globalData = await response.json();
};

getData();

// TODO à corriger doublon avec getData();
async function fetchData() {
  // Fonction fetch pour récupérer les données et réaliser des traitements
  fetch(worksUrl)
    .then(async response => {
      if (!response.ok) {
        throw new Error('API injoignable ' + response.statusText);
      }

      return response.json(); // Convertir la réponse en JSON
    })

    .then(data => {
      // TODO : factoriser les fonctions populate
      // data contient tous les objets retournés par l'appel API
      // appel de la fonction pour insérer les contenus sur la pagfe HTML
      populateCatalog(data);

      //  appel de fonction similaire pour insérer les éléments dans la modale
      populateModal(data);
    })

    .catch(error => {
      console.error("Erreur durant l'opération fetch:", error);
    }
    );
}

fetchData();

function populateCatalog(data) {
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

  });
};

function createEditGallery() {
  // Sélectionner le titre avec l'ID 'title-modal'
  let titleModal = document.getElementById('title-modal');
  // Injecter le titre 
  titleModal.innerText = "Galerie photo";

  // Créer un <div>
  let divElement = document.createElement('div');
  divElement = document.createElement('div');
  divElement.id = 'js-div-edit-gallery'


  // Insérer le <div>
  titleModal.insertAdjacentElement('afterend', divElement);

};

function populateModal(data) {
  createEditGallery();

  data.forEach(obj => {

    let modalWrapper = document.querySelector('#js-div-edit-gallery')

    // Crée un container Figure
    let element = document.createElement('figure');
    element.className = 'js-modal-figure';

    element.innerHTML = `
      <a href="#">
        <i class="fa-solid fa-trash-can overlay-icon"></i>
      </a>
      <img src="${obj.imageUrl}" alt="${obj.title}">`;


    modalWrapper.appendChild(element)
  })
};


function targetEditBtn() {
  // cibler les bouton d'ouverture de la modale
  let btnEditList = document.querySelectorAll('.js-open-modal');
  let i = 0;

  for (i = 0; i < btnEditList.length; i++) {
    console.log(i);
    btnEditList[i].addEventListener('click', function (event) {
      event.preventDefault();
      showModal();
    })
  };
};

targetEditBtn();


function showModal() {
  let modalWrapper = document.querySelector('#modal')
  modalWrapper.style = "display : block";
};

function targetCloseModalBtn() {
  // cibler le bouton de fermeture de la modale
  let btnCloseModal = document.querySelector('.js-close-modal');
  // console.log(btnCloseModal);
  btnCloseModal.addEventListener('click', () => {
    hideModal();
  });
};

targetCloseModalBtn();


function targetAddPicBtn() {
  // cibler le bouton d'ajout de photo dans la modale
  let btnAddPic = document.querySelector('.btn-modal');
  btnAddPic.addEventListener('click', () => {
    console.log(btnAddPic);

    // au clic appeller la fonction pour masquer la première vue de la modale
    hideGalleryModal();

    // et appeller la fonction pur afficher le formulaire d'import dans la modale
    showAddPicModal();

  });
};

targetAddPicBtn();

function hideGalleryModal() {
  console.log('masquer la gallerie de la modale');
  let titleModal = document.getElementById('title-modal');
  // Injecter le titre de la seconde vue
  titleModal.innerText = "Ajout photo";

  // Passer en display:none le div EditGallery
  let divElement = document.querySelector('#js-div-edit-gallery')
  divElement.style = "display:none";

  // // Créer un <form>
  // let formElement = document.createElement('form');
  // formElement = document.createElement('form');
  // formElement.id = 'js-form-edit-gallery';
  // formElement.action = '/submit';
  // formElement.method = 'post';
  // // Insérer le <form>
  // titleModal.insertAdjacentElement('afterend', formElement);


  // // Crée un élément div
  // let divForm = document.createElement('div');
  // divForm.className = 'js-form-group';
  // // insérer le divForm
  // formElement.insertAdjacentElement('afterend', divForm);

  // // insérer un element Label
  // let divFormLabel = document.createElement('label');
  // divFormLabel.innerText = 'jpg, png : 4mo max';
  // divForm.insertAdjacentElement('afterend', divFormLabel)

}

function hideAddPicModal() {
  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:none';
}

function showAddPicModal() {
  console.log('afficher le formulaire de la modale');

  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:flex';

}


function hideModal() {
  let modalWrapper = document.querySelector('#modal')
  modalWrapper.style = "display : none";
};



// Fonction pour créer les boutons de filtres 
function createFilters() {
  // Créer un div pour les boutons filtres
  let zoneFiltres = document.createElement('div');
  zoneFiltres.className = 'btn-list';
  zoneFiltres.id = 'js-btn-list';

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
    // console.log(globalData.length);
  };

  let titrePortfolio = document.querySelector('#portfolio > div');
  // insèrr après titrePortfolio sans l'imbriquer à l'intérieur avec insertAdjacentElement afterend
  titrePortfolio.insertAdjacentElement('afterend', zoneFiltres);

  filterWorks();

  hideFilters(zoneFiltres);

};

// Appel de la fonction après un délai pour s'assurer que les données sont chargées
/**
 * TODO : Tester avec async await !
 * ! Déterminer qulle fnction doit être async
 */
setTimeout(createFilters, 200);


// fonction pour lister les boutons filtres et ajouter un eventlistner
function filterWorks() {
  // cibler les boutons de filtre
  let TableauBoutonsFiltre = document.querySelectorAll('.btn-cat')




  // Ajouter un eventlistner sur chaque boutons
  // console.log(TableauBoutonsFiltre)
  for (let i = 0; i < TableauBoutonsFiltre.length; i++) {
    // console.log('tour numéro :' + i)
    TableauBoutonsFiltre[i].addEventListener('click', function () {
      hideWorks(i);
    });
  };
};


// Todo : Améliorer le masquage en mode connecté 
function hideFilters() {
  // console.log(verifyToken());
  if (verifyToken() === true) {
    let zoneFiltres = document.getElementById('js-btn-list');
    // console.log(zoneFiltres)
    zoneFiltres.style.display = 'none';
    showAllWorks();
  } return

};

function showAllWorks() {
  hideWorks(0)
};


// fonction appelée par le addEventListner au clic sur les boutons filtre catégorie
function hideWorks(id) {
  // lister tous les elements de la galerie
  // console.log(id);
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
        // console.log(`.cat-id-${id}`)
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
    // console.log("Les données ne sont pas encore disponibles.");
  };
};

// Appel de la fonction après un délai pour s'assurer que les données sont chargées
setTimeout(useGlobalData, 1000);

