'use strict';
// Käytetään leaflet.js -kirjastoa näyttämään sijainti kartalla (https://leafletjs.com/)
const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Asetukset paikkatiedon hakua varten (valinnainen)
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// Funktio, joka ajetaan, kun paikkatiedot on haettu
function success(pos) {
  const crd = pos.coords;

  map.setView([crd.latitude, crd.longitude], 13);

  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup('Olen tässä.').
      openPopup();

  // hae latauspisteet palauttaa promisen
  haeLatauspisteet(crd).then(function(latauspisteet){
    for(let i = 0; i < latauspisteet.length; i++) {
      const teksti = latauspisteet[i].AddressInfo.Title;
      const koordinaatit = {
        latitude: latauspisteet[i].AddressInfo.Latitude,
        longitude: latauspisteet[i].AddressInfo.Longitude,
      };
      lisaaMarker(koordinaatit, teksti);
    }
  });
}

// Funktio, joka ajetaan, jos paikkatietojen hakemisessa tapahtuu virhe
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Käynnistetään paikkatietojen haku
navigator.geolocation.getCurrentPosition(success, error, options);

function haeLatauspisteet(crd) {
  const key = 'af18334a-87ce-4c57-b805-97ff3685c22d';
  const proxy = 'https://api.allorigins.win/get?url=';
  const haku = `https://api.openchargemap.io/v3/poi?key=${key}&latitude=${crd.latitude}&longitude=${crd.longitude}&distance=10&distanceunit=km`;
  const url = proxy + encodeURIComponent(haku);
  return fetch(url).
      then(function(vastaus) {
        return vastaus.json();
      }).
      then(function(data) {
        console.log(JSON.parse(data.contents));
        const latauspisteet = JSON.parse(data.contents);
        return latauspisteet;
      });
}

function lisaaMarker(crd, teksti) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup(teksti);
}
