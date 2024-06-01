// URL de l'API
const worksUrl = 'http://localhost:5678/api/works/';

const catUrl = 'http://localhost:5678/api/categories';


// requête fetch en GET à l'API
fetch(worksUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('API injoignable ' + response.statusText);
    }
    return response.json(); // Convertir la réponse en JSON
  })
  
  .then(data => {
    
    console.table(data); // Afficher les données reçues

    // cibler l'élément dans lequel je vais créer les items
    const collection = document.getElementById('collection');
    // console.log(portfolio)

    // pour chaque objet renvoyé par l'API
    data.forEach(obj => {
        // Cibler le container où insérer les éléments et le stocker dans collection
        let collection = document.querySelector("#collection")

        // Crée un container Figure
        let element = document.createElement('figure');

        // Insérer le code HTML dans les containers Figure
        element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;

        console.log(`${obj.category.name}`)
        element.classList.add(`cat-id-${obj.category.id}`)
          
        // ajouter au container stocké dans collection les elements figure
        collection.appendChild(element);
        // document.body.insertBefore(element, collection)

    });
  })



  .catch(error => {
    console.error("Erreur durant l'opération fetch:", error);
  });


