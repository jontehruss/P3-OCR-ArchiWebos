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
    console.log(portfolio)

    // pour chaque objet renvoyé par l'API
    data.forEach(obj => {
        // Crée un container Figure

        var element = document.createElement('figure');
        console.log(element) ;

        // element.setAttribute('src', obj.imageUrl);
        element.innerHTML = `<img src="${obj.imageUrl}" alt="${obj.title}"> <figcaption>${obj.title}</figcaption>`;
   
        
        // TO CHECK
        document.body.appendChild(element);
        // document.body.insertBefore(element, collection)



    });
  })



  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });


