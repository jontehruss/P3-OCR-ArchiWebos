// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable utilisée pour contrôle sur post upload work
let isCatlatogEmpty = true;
let isAddPicFormView = false;

// ! test pour contrôle de l'état de la modale
let isModalhidden = true;

//  Ajout d'un écouteur global sur la page pour attendre que tout le contenu soit chargé avant d'executer les fonctions
document.addEventListener('DOMContentLoaded', () => {

  // Appeller la fonction pour le status d'authentification
  authStatus();

  // Appeller la fonction pour afficher le bandeau top
  showTopBanner();

  // Par défaut Masquer la modale
  hideModal();
  hideFormAddPicModal();


  // fonction pour récupérer la valeur du Token 
  function getTokenValue() {
    if (verifyToken()) {
      return localStorage.getItem('bearerToken');
    }
    return null; // normalement on arrive pas ici car la modale est accessible que quand un token est présent
  };

  // Vérifier si le Token est présent dans localStorage
  function verifyToken() {
    // renvoyer true ou false
    return localStorage.getItem('bearerToken') !== null;
  };

  function removeToken() {
    localStorage.removeItem('bearerToken');
  };

  //  fonction pour vérifier le statut via la présence du token 
  // et modifier le menu de nav login/logout en ajoutant un écouteur pour retirer le token sur logout
  function authStatus() {
    let navAuthStatus = document.getElementById('auth-status');
    if (verifyToken()) {
      navAuthStatus.innerHTML = `<a href="./index.html">logout</a>`;
      navAuthStatus.addEventListener('click', (event) => {
        removeToken();
      })
    } else {
      navAuthStatus.innerHTML = `<a href="./assets/login.html">login</a>`;
    }
  };

  function checkAuthStatus() {
    //  Chercher le token dans le local storage
    if (verifyToken()) {
      addEditButon();
    } else {
      return
    }
  };
  checkAuthStatus();

  function addEditButon() {
    let editBtn = document.createElement('p');
    editBtn.innerHTML = '<a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> modifier</a> ';

    let titleEdit = document.querySelector('#title-projet > h2');

    titleEdit.insertAdjacentElement('afterend', editBtn);
    titleEdit.classList = ('js-project-title')
  };

  function createTopBanner() {
    // Verifier si le Div existe déjà (car empilement si plusieurs clics sur 'Se connecter')
    if (document.querySelector('.top-banner-edit')) {
      //  si vrai on arrête la fonction
      return;
    }

    // créer un container pour le bandeau loggedIn
    let topBanner = document.createElement('div');

    // Attribuer la classe pour l'afficher et insérer le contenu
    topBanner.className = 'top-banner-edit';
    topBanner.innerHTML = '<p><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> MODE Édition</a></p>';

    // cibler la première place du body et insérer le conteneur HTML
    let html = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    html.insertBefore(topBanner, body);
  };

  function showTopBanner() {

    let token = localStorage.getItem('bearerToken');

    if (token) {
      createTopBanner();
    }
  };

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
    // Sélectionner le formulaire
    let form = document.getElementById('post-form');

    // Ajouter un écouteur sur la soumission du formulaire
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      postWork(worksUrl);

      // ! nettoyage du formulaire
      formReset(form);



    });
  };
  targetPostForm();


  // collecter les données du formulaire et les envoyer à l'URL spécifiée
  function postWork(worksUrl) {

    // créer une variable formData pour stocker les donées du formulaire
    let formData = new FormData();

    // Cibler le bouton d'ajout d'image
    let imageInput = document.getElementById('upload-photo');

    // vérifier si une image est sélectionnée
    if (imageInput && imageInput.files.length > 0) {
      // insérer l'image dans le formulaire
      formData.append('image', imageInput.files[0]);
    }

    // cibler l'input "titre"
    let titleInput = document.getElementById('title');

    // Vérifier que le titre ait une valeur
    if (titleInput) {
      // Insérer la valeur dans le formulaire
      formData.append('title', titleInput.value);
    }

    // cibler l'input "category"
    let categorySelect = document.getElementById('category');

    //  Vérifier que Category ait une valeur
    if (categorySelect) {
      // Insérer la valeur dans le formulaire
      formData.append('category', categorySelect.value);
    }

    // ! vérifier les données ajoutées ua formulaire
    // On parcours les valeurs des paires key/values des entrées du formulaire 
    for (let [key, values] of formData.entries()) {
      console.log(key, values);
    }

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
      body: formData // injecter dans le body les valeurs du formulaire
    };


    // Déclencher la requête avec Fetch
    fetch(worksUrl, requestOptions)

      .then(response => {
        // Voir le statut de la requête
        console.log('Response status : ' + response.status)

        // Si la réponse n'est pas OK
        if (!response.ok) {
          // Retourne une promesse avec le texte de la réponse (si elle est résolue)
          return response.text().then(text => {
            // Afficher et envoyer le texte d'erreur dans la console
            console.error("Error response:", text);
            throw new Error(text);
          });
        }

        return response.text();
      })

      .then(result => {
        console.log("Result:", result);
        // Appeler les fonctions pour mettre à jour le DOM sans recharger la page
        getData('works', worksUrl);
        hideFormAddPicModal();
        retabBtnModal();
        hideModalBackBtn();
        // form.reset();

      })

      .catch(error => console.error('Error:', error));
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
      // Crée une balise Figure
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

        // capturer aussi l'ID du bouton en se basant sur la balise <i> 
        if (deleteBtnClicked.tagName === 'I') {
          deleteBtnClicked = deleteBtnClicked.parentElement;
        }
        // extraire la valeur de l'id
        let btnId = deleteBtnClicked.id;
        console.log(deleteBtnClicked)
        // TODO : Confirmation de suppression ?
        alert(`Trop tard c'est supprimé !`);
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
    };

    // let workToDelete = worksUrl + id + '?id=' + id;
    let workToDelete = `${worksUrl}${id}`;
    console.log(workToDelete)

    fetch(workToDelete, requestOptions)

      .then(response => {

        // Envoyer une erreur si la réponse est KO
        if (!response.ok) {
          throw new Error('Bad Network response');
        }
        return response.text();
      })

      .then(result => {
        // console.log(result)
        // masquer l'élément du DOM pour voir sans recharger la page
        hideDeletedWork(id);

      })

      .catch(error => console.log('error', error));
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

    // si la valeur est à true, il faut afficher la flèche retour car on est sur la vue 2-2
    if (isAddPicFormView === true) {
      backBtn.style.display = 'flex';
      closeBtn.style = "flex-direction: row;"
    }

    // Activer le ciblage des clicks en dehors de la modale
    // targetOutsideModalClose();

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
    // cibler le bouton "ajouter une photo" dans la modale vue 1-2
    let btnAddPic = document.querySelector('.btn-modal');
    btnAddPic.addEventListener('click', () => {
      // conserver l'information de la vue modale 1-1 ou 1-2
      isAddPicFormView = true;

      console.log(isAddPicFormView);

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
  };

  function hideFormAddPicModal() {
    let formElement = document.querySelector('.form-upload-work');
    formElement.style = 'display:none';
  };

  function hideModalBackBtn() {
    console.log('coucou')
    // masquer la flèche retour
    let backBtn = document.querySelector('.js-back-modal');
    // console.log(backBtn)
    backBtn.style.display = "none";

    // aligner le bouton close sur la vue modal 1-2
    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row-reverse;"
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
    backBtn.addEventListener('click', (event) => {
      event.preventDefault();

      // conserver l'information de la vue, (false indique que l'on retourne à la vue initiale de la modale)
      isAddPicFormView = false;

      console.log(isAddPicFormView);
      retabInitModal(backBtn, closeBtn, formElement, elementsToHide);

    });
  };


  function retabInitModal(backBtn, closeBtn, formElement, elementsToHide) {

    backBtn.style.display = 'none';
    closeBtn.style = "flex-direction: row-reverse;"
    formElement.style = 'display:none';
    elementsToHide.forEach((element) => {

      element.style.display = 'flex';
    });

    // TODO : checker ce code pour réafficher la galerie
    let titleModal = document.getElementById('title-modal');
    // Injecter le titre de la première vue
    titleModal.innerText = "Galerie photo";
    // Passer en display:none le div EditGallery
    let divElement = document.querySelector('#js-div-edit-gallery')
    divElement.style = "display:flex";

  };

  //  TODO : Fermer la modale au clic en dehors
  //  ! ne fonctionne pas
  function setupModalCloseOnOutsideClick() {
    let modalWrapper = document.querySelector('#modal');
    modalWrapper.addEventListener('click', (event) => {
      if (event.target === modalWrapper) {
        hideModal();
      }
    });
  }
  setupModalCloseOnOutsideClick();


  function hideModal() {

    let modalWrapper = document.querySelector('#modal')
    modalWrapper.style = "display : none";


    targetEditBtn();


  };

  // function targetOutsideModalClose() {
  //   //  Afficher les infos du clic
  //   // window.onclick = function (event) {
  //   //   console.log(event.target)
  //   // };

  //   console.log('targetOutsideModalClose')

  //   //  TODO : Fermer la modale au clic à l'extérieur
  //   document.addEventListener("click", function (event) {
  //     event.preventDefault();

  //     // debugger
  //     // * ici contrôle si la modale est masquée, et executer le code uniquement si elle est visible.

  //     console.log(isModalhidden)

  //     // Si isModalHidden = false on rentre dans le if
  //     if (!isModalhidden) {
  //       if (event.target.matches(".js-close-modal") || !event.target.closest(".modal")) {
  //         console.log('cliqué en dehors de la modale !');
  //         // ! quand cette fonction est apellée ici, impossible d'ouvrir la fenêtre modale
  //         hideModal();
  //         isModalhidden = true;
  //       }
  //       // Si isModalHidden = true on rentre dans le else
  //     } else {
  //       showModal();
  //       console.log('cliqué dans la modale');
  //       isModalhidden = false;
  //     }         

  //     console.log(isModalhidden)

  //     document.removeEventListener('click', function (event) {
  //       event.preventDefault();
  //     })

  //   });
  // };


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
    filterBtnClor(0)
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
        filterBtnClor(i);
      });
    };
  };

  //  TODO : Faire en sorte que le cas 
  function filterBtnClor(i) {
    // avec l'id appliquer des règles CSS en fonction du bouton cliqué 
    const active = "color: black; background-color: white;border: solid #1D6154;";
    const passive = "color: white; background-color: #1D6154;border: solid white;";

    const btnAll = document.querySelector('.btn-cat#\\30');
    const btnObj = document.querySelector('.btn-cat#\\31');
    const btnFlat = document.querySelector('.btn-cat#\\32');
    const btnHotel = document.querySelector('.btn-cat#\\33');
    switch (i) {
      case 0:
        i = 0
        // console.log(i)
        // console.log(btnAll)
        btnAll.style = passive
        btnObj.style = active
        btnFlat.style = active
        btnHotel.style = active
        break;
      case 1:
        i = 1
        // console.log(i)
        // console.log(btnObj)
        btnAll.style = active
        btnObj.style = passive
        btnFlat.style = active
        btnHotel.style = active
        break;
      case 2:
        i = 2
        // console.log(i)
        // console.log(btnFlat)
        btnAll.style = active
        btnObj.style = active
        btnFlat.style = passive
        btnHotel.style = active
        break;
      case 3:
        i = 3
        // console.log(i)
        // console.log(btnHotel)
        btnAll.style = active
        btnObj.style = active
        btnFlat.style = active
        btnHotel.style = passive
        break;
      default:
    }
  }

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

  function previewImage() {
    // cibler le bouton d'upload image
    let imageInput = document.getElementById('upload-photo');
    // cibler l'element pour insérer l'image prévisualisée
    let preview = document.getElementById('image-preview');

    let customInputBtn = document.querySelector('.input-upload-photo')

    let inputFileInfos = document.querySelector('.file-type-info')

    if (imageInput && preview) {
      // écouter le changement sur imageInput


      imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          // quand le fichier est sélectionné
          // créer un fileReader
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.src = event.target.result;
            preview.style.display = 'block';
            imageInput.style = 'display:none';
            customInputBtn.style = 'display:none';
            inputFileInfos.style = 'display:none';
            console.log(reader)
          };
          // récupération de l'image en base 64 pour lecture via le navigateur
          reader.readAsDataURL(file);

        } else {
          preview.style.display = 'none';
        }

      });
    }
  }



  function replaceFileInputDefault() {

    let customInputBtn = document.querySelector('.input-upload-photo')

    let inputFileInfos = document.querySelector('.file-type-info')

    // let classicInputBtn = document.querySelector('#upload-photo')


    customInputBtn.addEventListener('click', function () {
      document.querySelector('#upload-photo')
        //simuler un clic sur le classicInput
        .click()
      // customInputBtn.style.display = "none";
      // inputFileInfos.style.display = "none";

      previewImage();


    })
  };
  replaceFileInputDefault();

  function formReset(form) {

    form.reset(form);

    function restoreFileInput() {
      let imgPreview = document.querySelector('#image-preview')
      imgPreview.src = "assets/icons/placeholder.svg";
      imgPreview.style = "display:block;margin: 0px;";

      let customInputBtn = document.querySelector('.input-upload-photo')
      customInputBtn.style = "display:block; margin: 0px";


      let inputFileInfos = document.querySelector('.file-type-info')
      inputFileInfos.style = "display:block; margin: 0px";

    };
    restoreFileInput();



  };

});