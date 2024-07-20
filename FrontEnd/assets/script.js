import { showTopBanner, authStatus, verifyToken, addEditButon, getTokenValue } from "./shared.js";


// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Appeller la fonction pour le status d'authentification
authStatus();

// Appeller la fonction pour afficher le bandeau top
showTopBanner();

// Par défaut Masquer la modale
hideModal();
hideAddPicModal();


function checkAuthStatus() {
  //  Chercher le token dans le local storage
  if (verifyToken()) {
    console.log(verifyToken())
    // console.log('utilisateur authentifié')
    addEditButon();
    // hideFilters();
  } else {
    return
  }
}
checkAuthStatus();

// Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
async function getData(route, url) {
  // récupérer dans "data" la réponse de la route API en JSON
  const response = await fetch(url);
  let data = await response.json();
  if (route === 'works') {
    // envoyer les datas dans la fonction pour afficher les works
    // ! Attention, à l'upload d'un Work, doublon de TOUS les projest dans le DOM
    populateCatalog(data);
    populateModal(data);
  } else if (route === 'cat') {
    // envoyer les datas dans la fonction pour afficher créer les boutons de filtre
    createFilters(data);
  } return
};
getData('works', worksUrl);
getData('cat', catUrl);


function targetPostForm() {
  document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner le formulaire
    let form = document.getElementById('post-form');

    // Ajouter un écouteur sur la soumission du formulaire
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      postWork(worksUrl);
    });
  });
};
targetPostForm();


// collecter les données du formulaire et les envoyer à l'URL spécifiée
function postWork(worksUrl) {

  // cibler le formulaire
  let form = document.getElementById('post-form');

  // stocker dans le formData les donées du formulaire
  let formData = new FormData(form);

  // //  avec la méthode forEach il est possible de parcourir les valeurs récupérées
  // formData.forEach((value, key) => {
  //   console.log(key, value);
  // });

  // Préparer le header de la requête
  // récupérer la valeur du token dans le local storage
  let bearerToken = getTokenValue();
  let headers = new Headers();

  // constituer le header avec le token
  headers.append(
    "Authorization",
    "Bearer " + bearerToken
  );
  // //  avec la méthode forEach il est possible de parcourir les valeurs récupérées
  // headers.forEach((value, key) => {
  //   console.log(key, value);
  // });

  // Préparer les options et le body de la requête
  let requestOptions = {
    method: 'POST',
    headers: headers,
    body: formData, // injecter dans le body les valeurs du formulaire
  };

  // Déclencher la requête avec Fetch
  fetch(worksUrl, requestOptions)

    .then(response => {
      getData('works', worksUrl);
      return response.text();
    })

    // TODO : voir comment au résult du Post ne pas recharger le DOM
    .then(result => {
      console.log(result);
    })

    .catch(error => console.log('error', error));

};



// ! fonction de contrôle (première execution et suivantes)
let isCatlatogEmpty = true;

function populateCatalog(data) {

  // Cibler le container où insérer les éléments et le stocker dans collection
  let collection = document.querySelector("#collection");

  // Vérifier si le catalogue est vide
  if (isCatlatogEmpty === true) {
    // Boucler sur chaque objet et les afficher sur la page
    data.forEach(obj => {
      // apeller la fonction d'insertion
      insertIntoCatalog(collection, obj);
    });
    // Changer l'état de la variable pour les prochaines executions
    isCatlatogEmpty = false;
    console.log(isCatlatogEmpty)

    // Si le catalogue est rempli, ajouter uniquement le dernier obj de data
  } else {
    let lastWork = data[data.length - 1];
    console.log(lastWork);
    insertIntoCatalog(collection, lastWork);
  }

};



function insertIntoCatalog(collection, obj) {
  // Crée un container Figure
  let element = document.createElement('figure');
  // Insérer le code HTML dans les containers Figure
  element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;
  // ajouter la classe avec l'id de catégory aux figures pour les filtrer avec le CSS
  element.classList.add('works', `cat-id-${obj.category.id}`)
  // ajouter au container stocké dans collection les elements figure
  collection.appendChild(element);
}


function createEditGallery() {
  // Sélectionner le titre avec l'ID 'title-modal'
  let titleModal = document.getElementById('title-modal');
  // Injecter le titre 
  titleModal.innerText = "Galerie photo";
  // Créer un <div>
  let divElement = document.createElement('div');
  divElement = document.createElement('div');
  divElement.id = 'js-div-edit-gallery';
  // Insérer le <div>
  titleModal.insertAdjacentElement('afterend', divElement);
};

function populateModal(data) {

  createEditGallery();
  data.forEach(obj => {
    let modalWrapper = document.querySelector('#js-div-edit-gallery');
    // Crée un container Figure
    let element = document.createElement('figure');
    element.className = 'js-modal-figure';
    // ! Attention code en dur ! 
    // element.innerHTML = `<a href="${obj.category.id}"><i id="js-delete-work-btn" class="fa-solid fa-trash-can overlay-icon"></i></a><img src="${obj.imageUrl}" alt="${obj.title}">`;
    // element.innerHTML = `<a href="http://localhost:5678/api/works/${obj.category.id}?id=${obj.category.id}"><i id="js-delete-work-btn" class="fa-solid fa-trash-can overlay-icon"></i></a><img src="${obj.imageUrl}" alt="${obj.title}">`;
    element.innerHTML = `
      <button class="js-delete-work-btn" id="${obj.id}">
        <i class="fa-solid fa-trash-can overlay-icon"></i>
      </button>
      <img src="${obj.imageUrl}" alt="${obj.title}">`;

    modalWrapper.appendChild(element);



  });

  targetDeleteWorkBtn();
};


function targetDeleteWorkBtn() {
  let deleteBtn = document.querySelectorAll('.js-delete-work-btn');

  deleteBtn.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      // récupérer l'élément qui a déclenché l'event
      let deleteBtnClicked = event.target;

      // extraire la valeur de l'id
      let btnId = deleteBtnClicked.id;

      // TODO : Confirmation de suppression ?
      // console.log('voulez vous supprimer ?  ' + btnId);

      // envoi de l'id catégorie à la fonction de supression
      deleteWork(btnId);
    })
  })
};


function deleteWork(id) {

  // let deleteBtn = document.getElementById('js-delete-work-btn')
  // console.log(deleteBtn);

  let bearerToken = getTokenValue();
  console.log(bearerToken);

  let headers = new Headers();
  headers.append(
    "Authorization",
    "Bearer " + bearerToken
  );


  let requestOptions = {
    method: 'DELETE',
    headers: headers,
    body: '',
    // redirect: 'follow'
  };



  let workToDelete = worksUrl + '/' + id + '?id=' + id

  fetch(workToDelete, requestOptions) // il faut récupérer la valeur de id pour l'inclure à l'URL (/15?id=15")
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

};


function targetEditBtn() {
  // cibler les bouton d'ouverture de la modale
  let btnEditList = document.querySelectorAll('.js-open-modal');
  let i = 0;
  //  ajouter un écouteur sur chaque bouton et déclencher la modale
  for (i = 0; i < btnEditList.length; i++) {
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
};

function hideAddPicModal() {
  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:none';
};

function showAddPicModal() {
  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:flex';
};


function hideModal() {
  let modalWrapper = document.querySelector('#modal')
  modalWrapper.style = "display : none";
};


function createFilters(data) {
  // Créer un div pour les boutons filtres
  let zoneFiltres = document.createElement('div');
  zoneFiltres.className = 'btn-list';
  zoneFiltres.id = 'js-btn-list';
  // Créer le bouton pour le filtre 'Tous'
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
    bouton.value = data[i].name;
    console.log(data[i].name)
    bouton.className = 'btn-cat';
    bouton.id = data[i].id;
    zoneFiltres.appendChild(bouton);
  };

  let titrePortfolio = document.querySelector('#portfolio > div');
  // insèrer après titrePortfolio sans l'imbriquer à l'intérieur avec insertAdjacentElement afterend
  titrePortfolio.insertAdjacentElement('afterend', zoneFiltres);

  filterWorks();
  hideFilters(zoneFiltres);
};


// fonction pour lister les boutons filtres et ajouter un eventlistner
function filterWorks() {
  // cibler les boutons de filtre
  let TableauBoutonsFiltre = document.querySelectorAll('.btn-cat')
  // Ajouter un eventlistner sur chaque boutons
  for (let i = 0; i < TableauBoutonsFiltre.length; i++) {
    TableauBoutonsFiltre[i].addEventListener('click', function () {
      hideWorks(i);
    });
  };
};

// Todo : Améliorer le masquage en mode connecté 
function hideFilters() {
  if (verifyToken() === true) {
    let zoneFiltres = document.getElementById('js-btn-list');
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
      }
    }
  }
  );
};