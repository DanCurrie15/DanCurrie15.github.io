/**
 * populate carousel as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  getData();
});

getData = () => {
  var requestURL = 'data/mechEngWork.json';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    var items = request.response;
    populateCarousel(items);
  }
}

populateCarousel = (items) => {
  const div = document.querySelector('.carousel-inner');
  items.forEach(item => {
    div.append(createItemHTML(item));
  });
}

createItemHTML = (item) => {
  const divtop = document.createElement('div');
  divtop.className = item.carouselItemClass;

  const image = document.createElement('img');
  image.className = 'd-block';
  image.src = `img/carousel/${item.image}`;
  image.alt = item.title;
  divtop.append(image);

  const divBottom = document.createElement('div');
  divBottom.className = 'my-caption d-md-block';

  const title = document.createElement('h3');
  title.innerHTML = item.title;
  divBottom.append(title);

  const description = document.createElement('p');
  description.innerHTML = item.desc;
  divBottom.append(description);

  divtop.append(divBottom);

  return divtop;
}
