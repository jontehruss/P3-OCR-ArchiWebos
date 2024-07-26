// URLs de l'API
const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

// Variable utilisée pour contrôle sur post upload work
let isCatlatogEmpty = true;

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
      // navAuthStatus.textContent = 'logout';
      navAuthStatus.innerHTML = `<a href="./index.html">logout</a>`;

      navAuthStatus.addEventListener('click', (event) => {
        event.preventDefault(); 
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
    editBtn.innerHTML = '<a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i>MODE Édition</a> ';

    let titleEdit = document.querySelector('#title-projet > h2');

    titleEdit.insertAdjacentElement('afterend', editBtn);
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

    // ! pas utilisé ? 
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
    backBtn.addEventListener('click', (event) => {
      event.preventDefault();
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
    if (modalWrapper) {
      modalWrapper.style = "display : none";
    }
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

  // function previewImage() {
  //   let imageInput = document.getElementById('upload-photo');
  //   let preview = document.getElementById('image-preview');

  //   if (imageInput && preview) {
  //     imageInput.addEventListener('change', (event) => {
  //       const file = event.target.files[0];
  //       if (file) {
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           preview.src = e.target.result;
  //           preview.style.display = 'block';
  //         };
  //         reader.readAsDataURL(file);
  //       } else {
  //         preview.style.display = 'none';
  //       }
  //     });
  //   }
  // }
  // previewImage();

  // function targetInputForPreview() {
  //   // Target le div dans lequel l'image du file upload sera affichée en preview 
  //   let divPreviewImg = document.getElementById('modal-img-placeholder');

  //   let inputImg = document.querySelector('#upload-photo')

  //   inputImg.addEventListener('change', function () {
  //     previewThumbnail(inputImg.files[0], divPreviewImg);
  //     // debugger
  //     // console.log(previewThumbnail(inputImg.files[0]))
  //   });
  // }
  // targetInputForPreview();


  // function previewThumbnail(file, divPreviewImg) {
  //   console.log(file, divPreviewImg);
  //   // Crée un système pour écouter la lecture de fichier par le navigateur

  //   // 
  //   let img = document.createElement('img')
  //   // divPreviewImg.appendChild(img);

  //   // créer une instance de fileReader
  //   let reader = new FileReader(file);

  //   console.log(typeof reader)

  //   // est un événement de l'objet FileReader déclenché à la fin du chargement
  //   reader.onload = function (event) {
  //     // // Mettre à jour l'élément image avec la miniature lue
  //     img.src = event.target.result


  //     // TODO : Il faut garder le DIV et ne pas le remplacer lui mais les elements qu'il contient ! 
  //     let parent = divPreviewImg.parentNode;
  //     parent.replaceChild(img, divPreviewImg);
  //     img.style = "height: 193px; max-width:129px; object-fit: cover;"

  //   };

  //   // Lire le fichier en tant qu'URL de données
  //   // renvoie l'image en base64
  //   reader.readAsDataURL(file);





  //   // reader.addEventListener('load', function (event) {
  //   //   let imgUpload = document.createElement('img')
  //   //   console.log(imgUpload);
  //   //   imgUpload.src = event.target.result;

  //   //   // Ajouter la nouvelle image au conteneur de prévisualisation
  //   //   let previewImage = document.querySelector('#preview-image');
  //   //   previewImage.appendChild(imgUpload);
  //   //   console.log(event.target.result);


  //   // // Effacer les images précédentes
  //   // let previewContainer = document.getElementById('preview-image');
  //   // previewContainer.innerHTML = ''; // Effacer les anciennes images


  //   // previewContainer.appendChild(imgUpload);



  //   console.log(reader);
  //   // // Initialiser le ciblage de l'input pour la prévisualisation
  //   // document.addEventListener('DOMContentLoaded', function () {
  //   //   targetInputForPreview();
  //   // });

  //   // // document.getElementById('preview-image').appendChild(imgUpload)



  //   // imgUpload.readAsDataURL()
  // }

});