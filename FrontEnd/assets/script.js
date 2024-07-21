import { showTopBanner, authStatus, verifyToken, addEditButon, getTokenValue } from "./shared.js";


// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable utilisée pour contrôle sur post upload work
let isCatlatogEmpty = true;

// Appeller la fonction pour le status d'authentification
authStatus();

// Appeller la fonction pour afficher le bandeau top
showTopBanner();

// Par défaut Masquer la modale
hideModal();
hideFormAddPicModal();


function checkAuthStatus() {
  //  Chercher le token dans le local storage
  if (verifyToken()) {
    // console.log(verifyToken())
    // console.log('utilisateur authentifié')
    addEditButon();

  } else {
    return
  }
};
checkAuthStatus();

// Fonction Assynchrone pour récupérer les datas de l'API et les rendre globales
async function getData(route, url) {
  // récupérer dans "data" la réponse de la route API en JSON
  const response = await fetch(url);
  let data = await response.json();
  if (route === 'works') {
    // envoyer les datas dans la fonction pour afficher les works
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

  // Préparer le header de la requête
  // récupérer la valeur du token dans le local storage
  let bearerToken = getTokenValue();
  let headers = new Headers();

  // constituer le header avec le token
  headers.append(
    "Authorization",
    "Bearer " + bearerToken
  );

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

      hideFormAddPicModal();
      retabBtnModal();

      return response.text();
    })


    .then(result => {
      // console.log(result);
    })

    .catch(error => console.log('error', error));
};


function retabBtnModal() {
  //  Cibler le séparateur et le bouton ajouter photo de la modale
  let separator = document.querySelector('.modal-separator')
  let addPicBtn = document.querySelector('.btn-modal')

  // Remplacer display:none par flex
  separator.style = "display: flex";
  addPicBtn.style = "display: flex";

  // Rappel de showModal() pour réablir le div controles (back/close) 
  showModal();
};


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

    // Si le catalogue est rempli, ajouter uniquement le dernier obj de data
  } else {
    let lastWork = data[data.length - 1];
    insertIntoCatalog(collection, lastWork);
  }
};


function insertIntoCatalog(collection, obj) {
  // Crée un container Figure
  let element = document.createElement('figure');
  // Insérer le code HTML dans les containers Figure
  element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;
  // ajouter la classe avec l'id de catégory aux figures pour les filtrer avec le CSS
  element.classList.add('works', `cat-id-${obj.category.id}`);

  // insérer l'id dans la balise HTML pour le cibler plus tard
  element.id = obj.id;

  // ajouter au container stocké dans collection les elements figure
  collection.appendChild(element);
};


function createEditGallery() {
  // Sélectionner le titre avec l'ID 'title-modal'
  let titleModal = document.getElementById('title-modal');
  // Injecter le titre 
  titleModal.innerText = "Galerie photo";
  // Créer un <div>
  let divElement = document.createElement('div');
  divElement = document.createElement('div');
  divElement.id = 'js-div-edit-gallery';
  //  Ajout de la classe modal-1-1 pour passer en display-none
  divElement.className = "js-modal-1-1";
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

    element.innerHTML = `
      <button class="js-delete-work-btn delete-btn-icon" id="${obj.id}">
        <i class="fa-solid fa-trash-can"></i>
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

      // capturer aussi l'ID du bouton 
      if (deleteBtnClicked.tagName === 'I') {
        deleteBtnClicked = deleteBtnClicked.parentElement;
      }
      // extraire la valeur de l'id
      let btnId = deleteBtnClicked.id;

      // TODO : Confirmation de suppression ?
      console.log('voulez vous supprimer ?  ' + btnId);
      // envoi de l'id catégorie à la fonction de supression
      deleteWork(btnId);
    })
  })
};


function deleteWork(id) {

  let bearerToken = getTokenValue();

  let headers = new Headers();
  headers.append(
    "Authorization",
    "Bearer " + bearerToken
  );

  let requestOptions = {
    method: 'DELETE',
    headers: headers,
    body: '',
  };

  let workToDelete = worksUrl + id + '?id=' + id

  fetch(workToDelete, requestOptions) // * il faut récupérer la valeur de id pour l'inclure à l'URL (/15?id=15")

    .then(response => {
      hideDeletedWork(id);
      return response.text();
    })

    .then(result => {
      // console.log(result)
    })

    .catch(error => console.log('error', error));

  // masquer l'élément du DOM pour voir sans recharger la page
  hideDeletedWork(id);
};



function hideDeletedWork(id) {
  // Target l'element dans la modale avec son id
  // Comme c'est le bouton qui a l'id , on utilise la méthode closest chainé à au QuerySelector.
  const workElementModal = document.querySelector(`.js-modal-figure button[id="${id}"]`)
    .closest('.js-modal-figure');

  // Masquer l'élément
  workElementModal.style = "display:none";

  // Target l'element dans le Catalog  avec son id ;
  const workElementCatalog = document.querySelector(`#collection`)
    .querySelector(`[id="${id}"]`)

  // ! Comprendre pourquoi il y a 2 sorties console !
  console.log(workElementCatalog)

  workElementCatalog.style = "display:none";
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

  // cibler le bouton back flèche
  let backBtn = document.querySelector('.js-back-modal');
  backBtn.style.display = 'none';

  // aligner le bouton close sur la vue modal 1-2
  let closeBtn = document.querySelector('.controls-modal');
  closeBtn.style = "flex-direction: row-reverse;"
};


// TODO : Faire en sorte qu'au clic en dehors de la modale, elle se ferme aussi
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
    showFormAddPicModal();
  });
};
targetAddPicBtn();


function hideGalleryModal() {

  let titleModal = document.getElementById('title-modal');
  // Injecter le titre de la seconde vue
  titleModal.innerText = "Ajout photo";
  // Passer en display:none le div EditGallery
  let divElement = document.querySelector('#js-div-edit-gallery')
  divElement.style = "display:none";

  let element = document.querySelectorAll('.js-modal-1-1');
};

function hideFormAddPicModal() {
  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:none';
};

function showFormAddPicModal() {
  let formElement = document.querySelector('.form-upload-work');
  formElement.style = 'display:flex';

  // cibler les éléments class modal-1-2 et les passer en display:none
  let elementsToHide = document.querySelectorAll('.modal-1-2');

  elementsToHide.forEach((element) => {
    element.style.display = 'none';
  });

  // cibler le bouton back flèche
  let backBtn = document.querySelector('.js-back-modal');
  backBtn.style.display = 'flex';

  // aligner le bouton close sur la vue modal 1-2
  let closeBtn = document.querySelector('.controls-modal');
  closeBtn.style = "flex-direction: row;"

  // revenir à la vue 1 de la modale
  backBtn.addEventListener('click', () => {
    retabInitModal(backBtn, closeBtn, formElement, elementsToHide)
  });
};


function retabInitModal(backBtn, closeBtn, formElement, elementsToHide) {

  backBtn.style.display = 'none';
  closeBtn.style = "flex-direction: row-reverse;"
  formElement.style = 'display:none';
  elementsToHide.forEach((element) => {

    element.style.display = 'flex';
  });

  // todo : checker ce code pour réafficher la galerie
  let titleModal = document.getElementById('title-modal');
  // Injecter le titre de la première vue
  titleModal.innerText = "Galerie photo";
  // Passer en display:none le div EditGallery
  let divElement = document.querySelector('#js-div-edit-gallery')
  divElement.style = "display:flex";

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
  all.id = '0';
  zoneFiltres.appendChild(all);

  // créer un bouton pour chaque catégorie
  for (let i = 0; i < 3; i++) {
    let bouton = document.createElement('input');
    bouton.type = 'button';
    bouton.value = data[i].name;
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


// TODO : Placeholder Image Preview

function targetInputForPreview() {
  let inputImg = document.querySelector('#upload-photo')

  inputImg.addEventListener('change', function () {
    previewThumbnail(inputImg.files[0]);
    // debugger
    // console.log(previewThumbnail(inputImg.files[0]))
  });
}
targetInputForPreview();


function previewThumbnail(file) {
  console.log(file);
  // Crée un système pour écouter la lecture de fichier par le navigateur
  let reader = new FileReader();
  
  console.log(reader)

  reader.addEventListener('load', function (event) {
    let imgUpload = document.createElement('img')
    console.log(imgUpload);
    imgUpload.src = event.target.result;

    // Ajouter la nouvelle image au conteneur de prévisualisation
    let previewImage = document.querySelector('#preview-image');
    previewImage.appendChild(imgUpload);
    console.log(event.target.result);

    // // Effacer les images précédentes
    // let previewContainer = document.getElementById('preview-image');
    // previewContainer.innerHTML = ''; // Effacer les anciennes images


    // previewContainer.appendChild(imgUpload);

    // Lire le fichier en tant qu'URL de données
    reader.readAsDataURL(file);

    // Initialiser le ciblage de l'input pour la prévisualisation
    document.addEventListener('DOMContentLoaded', function () {
      targetInputForPreview();
    });

    // document.getElementById('preview-image').appendChild(imgUpload)

  });

  // imgUpload.readAsDataURL()
}