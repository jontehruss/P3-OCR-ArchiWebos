const worksUrl = 'http://localhost:5678/api/works/';
const catUrl = 'http://localhost:5678/api/categories';

let isCatlatogEmpty = true;
let isAddPicFormView = false;

// ! test pour contrôle de l'état de la modale
let isModalhidden = true;

document.addEventListener('DOMContentLoaded', () => {

  authStatus();
  showTopBanner();
  hideModal();
  hideFormAddPicModal();

  function getTokenValue() {
    if (verifyToken()) {
      return localStorage.getItem('bearerToken');
    }
    return null;
  };

  function verifyToken() {
    return localStorage.getItem('bearerToken') !== null;
  };


  function removeToken() {
    localStorage.removeItem('bearerToken');
  };


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
    if (document.querySelector('.top-banner-edit')) {
      return;
    }

    let topBanner = document.createElement('div');
    topBanner.className = 'top-banner-edit';
    topBanner.innerHTML = '<p><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> MODE Édition</a></p>';

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

  async function getData(route, url) {
    const response = await fetch(url);
    let data = await response.json();
    if (route === 'works') {
      populateCatalog(data);
      populateModal(data);
    } else if (route === 'cat') {
      createFilters(data);
    } return
  };
  getData('works', worksUrl);
  getData('cat', catUrl);


  function targetPostForm() {
    let form = document.getElementById('post-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      postWork(worksUrl);
      formReset(form);
    });
  };
  targetPostForm();


  function postWork(worksUrl) {
    let formData = new FormData();
    let imageInput = document.getElementById('upload-photo');

    if (imageInput && imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0]);
    }

    let titleInput = document.getElementById('title');

    if (titleInput) {
      formData.append('title', titleInput.value);
    }

    let categorySelect = document.getElementById('category');

    if (categorySelect) {
      formData.append('category', categorySelect.value);
    }

    let fileKey = 'image';
    let file = formData.get(fileKey)

    if (file instanceof File && file.size > 400000) {
      alert(`Le fichier dépasse la poids maximum de 4mo`)
      return
    };

    let bearerToken = getTokenValue();
    let headers = new Headers();

    headers.append(
      "Authorization",
      "Bearer " + bearerToken
    );

    let requestOptions = {
      method: 'POST',
      headers: headers,
      body: formData
    };


    fetch(worksUrl, requestOptions)

      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error("Error response:", text);
            throw new Error(text);
          });
        }
        return response.text();
      })

      .then(() => {
        getData('works', worksUrl);
        hideFormAddPicModal();
        retabBtnModal();
        hideModalBackBtn();
      })

      .catch(error => console.error('Error:', error));
  };


  function retabBtnModal() {
    let separator = document.querySelector('.modal-separator')
    let addPicBtn = document.querySelector('.btn-modal')

    separator.style = "display: flex";
    addPicBtn.style = "display: flex";

    showModal();
  };


  function populateCatalog(data) {
    let collection = document.querySelector("#collection");

    if (isCatlatogEmpty === true) {
      data.forEach(obj => {
        insertIntoCatalog(collection, obj);
      });
      isCatlatogEmpty = false;

    } else {
      let lastWork = data[data.length - 1];
      insertIntoCatalog(collection, lastWork);
    }
  };


  function insertIntoCatalog(collection, obj) {
    let element = document.createElement('figure');
    element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;
    element.classList.add('works', `cat-id-${obj.category.id}`);
    element.id = obj.id;

    collection.appendChild(element);
  };


  function createEditGallery() {
    let titleModal = document.getElementById('title-modal');
    titleModal.innerText = "Galerie photo";
    let divElement = document.createElement('div');
    divElement = document.createElement('div');
    divElement.id = 'js-div-edit-gallery';
    divElement.className = "js-modal-1-1";
    titleModal.insertAdjacentElement('afterend', divElement);
  };


  function populateModal(data) {
    createEditGallery();
    data.forEach(obj => {
      let modalWrapper = document.querySelector('#js-div-edit-gallery');
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

        let deleteBtnClicked = event.target;
        if (deleteBtnClicked.tagName === 'I') {
          deleteBtnClicked = deleteBtnClicked.parentElement;
        }
        let btnId = deleteBtnClicked.id;
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

    let workToDelete = `${worksUrl}${id}`;

    fetch(workToDelete, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Bad Network response');
        }
        return response.text();
      })

      .then(result => {
        hideDeletedWork(id);
      })

      .catch(error => console.log('error', error));
  };


  function hideDeletedWork(id) {
    const workElementModal = document
      .querySelector(`.js-modal-figure button[id="${id}"]`)
      .closest('.js-modal-figure');
    workElementModal.style = "display:none";

    const workElementCatalog = document
      .querySelector(`#collection`)
      .querySelector(`[id="${id}"]`);
    workElementCatalog.style = "display:none";
  };


  function targetEditBtn() {
    let btnEditList = document.querySelectorAll('.js-open-modal');
    let i = 0;
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

    let backBtn = document.querySelector('.js-back-modal');
    backBtn.style.display = 'none';

    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row-reverse;"

    if (isAddPicFormView === true) {
      backBtn.style.display = 'flex';
      closeBtn.style = "flex-direction: row;"
    }
    hideModalBackBtn();
  };


  function targetCloseModalBtn() {
    let btnCloseModal = document.querySelector('.js-close-modal');
    btnCloseModal.addEventListener('click', () => {
      hideModal();
    });
  };
  targetCloseModalBtn();


  function targetAddPicBtn() {
    let btnAddPic = document.querySelector('.btn-modal');
    btnAddPic.addEventListener('click', () => {
      isAddPicFormView = true;
      hideGalleryModal();
      showFormAddPicModal();
    });
  };
  targetAddPicBtn();


  function hideGalleryModal() {
    let titleModal = document.getElementById('title-modal');
    titleModal.innerText = "Ajout photo";

    let divElement = document.querySelector('#js-div-edit-gallery')
    divElement.style = "display:none";
  };

  function hideFormAddPicModal() {
    let formElement = document.querySelector('.form-upload-work');
    formElement.style = 'display:none';
  };

  function hideModalBackBtn() {
    let backBtn = document.querySelector('.js-back-modal');
    backBtn.style.display = "none";

    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row-reverse;"
  };

  function showFormAddPicModal() {
    let formElement = document.querySelector('.form-upload-work');
    formElement.style = 'display:flex';

    let elementsToHide = document.querySelectorAll('.modal-1-2');
    elementsToHide.forEach((element) => {
      element.style.display = 'none';
    });

    let backBtn = document.querySelector('.js-back-modal');
    backBtn.style.display = 'flex';

    let closeBtn = document.querySelector('.controls-modal');
    closeBtn.style = "flex-direction: row;"

    backBtn.addEventListener('click', (event) => {
      event.preventDefault();
      isAddPicFormView = false;
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

    let titleModal = document.getElementById('title-modal');
    titleModal.innerText = "Galerie photo";

    let divElement = document.querySelector('#js-div-edit-gallery')
    divElement.style = "display:flex";
  };


  function hideModal() {
    let modalWrapper = document.querySelector('#modal')
    modalWrapper.style = "display : none";
    targetEditBtn();
  };


  function createFilters(data) {
    let zoneFiltres = document.createElement('div');
    zoneFiltres.className = 'btn-list';
    zoneFiltres.id = 'js-btn-list';
    let all = document.createElement('input');
    all.type = 'button';
    all.value = 'Tous';
    all.className = 'btn-cat';
    all.id = '0';
    zoneFiltres.appendChild(all);

    for (let i = 0; i < 3; i++) {
      let bouton = document.createElement('input');
      bouton.type = 'button';
      bouton.value = data[i].name;
      bouton.className = 'btn-cat';
      bouton.id = data[i].id;
      zoneFiltres.appendChild(bouton);
    };

    let titrePortfolio = document.querySelector('#portfolio > div');
    titrePortfolio.insertAdjacentElement('afterend', zoneFiltres);
    filterBtnClor(0)
    filterWorks();
    hideFilters(zoneFiltres);
  };


  function filterWorks() {
    let TableauBoutonsFiltre = document.querySelectorAll('.btn-cat')
    for (let i = 0; i < TableauBoutonsFiltre.length; i++) {
      TableauBoutonsFiltre[i].addEventListener('click', function () {
        hideWorks(i);
        filterBtnClor(i);
      });
    };
  };


  function filterBtnClor(i) {
    const active = "color: black; background-color: white;border: solid #1D6154;";
    const passive = "color: white; background-color: #1D6154;border: solid white;";

    const btnAll = document.querySelector('.btn-cat#\\30');
    const btnObj = document.querySelector('.btn-cat#\\31');
    const btnFlat = document.querySelector('.btn-cat#\\32');
    const btnHotel = document.querySelector('.btn-cat#\\33');
    switch (i) {
      case 0:
        i = 0
        btnAll.style = passive
        btnObj.style = active
        btnFlat.style = active
        btnHotel.style = active
        break;
      case 1:
        i = 1
        btnAll.style = active
        btnObj.style = passive
        btnFlat.style = active
        btnHotel.style = active
        break;
      case 2:
        i = 2
        btnAll.style = active
        btnObj.style = active
        btnFlat.style = passive
        btnHotel.style = active
        break;
      case 3:
        i = 3
        btnAll.style = active
        btnObj.style = active
        btnFlat.style = active
        btnHotel.style = passive
        break;
      default:
    }
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


  function hideWorks(id) {
    let allWorks = document.querySelectorAll('#collection .works');
    allWorks.forEach(works => {
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


  function previewImage() {
    let imageInput = document.getElementById('upload-photo');
    let preview = document.getElementById('image-preview');
    let customInputBtn = document.querySelector('.input-upload-photo')
    let inputFileInfos = document.querySelector('.file-type-info')

    if (imageInput && preview) {
      imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.src = event.target.result;
            preview.style.display = 'block';
            imageInput.style = 'display:none';
            customInputBtn.style = 'display:none';
            inputFileInfos.style = 'display:none';
          };
          reader.readAsDataURL(file);
        } else {
          preview.style.display = 'none';
        }
      });
    }
  };


  function replaceFileInputDefault() {
    let customInputBtn = document.querySelector('.input-upload-photo')
    customInputBtn.addEventListener('click', function () {
      document.querySelector('#upload-photo')
        .click()
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