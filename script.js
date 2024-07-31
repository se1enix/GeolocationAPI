'use strict';

const btnElem = document.getElementById('get-button');
const formElem = document.getElementById('coords_input');
const responseElem = document.getElementById('response');


function fillCoordinates(pos) {
    formElem.value = pos.coords.latitude.toFixed(7) + ',' + pos.coords.longitude.toFixed(7);
}

function fillingCoordinatesError(err) {
    console.log(`Coordinates getting error. Leaving the field blank.`, err);
}

function getCoords() {
    return formElem.value;
}

function hideResponse() {
    responseElem.value = '';
    responseElem.classList.add('response-hidden');
}

function setResponse(responseText) {
    responseElem.textContent = responseText;
    responseElem.classList.remove('response-hidden');
    btnElem.disabled = false;
}

function processApiRequest() {
    hideResponse();
    btnElem.disabled = true;
    const coords = getCoords();
    fetch('https://geocode.xyz/' + coords + '?geoit=json').then(response => {
        if (!response.ok) throw response;
        return response.json();
    }).then(response => {
        if (!response?.city) throw response;
        if (response.city.includes('Throttled')) throw 'Busy';
        const responseText = (response?.country ?? response?.prov)
            + ', ' + (response.region && !response.region.includes(response?.city) ? response.region + ', ' : '') +
            response?.city;
        setResponse(responseText);
        btnElem.disabled = false;
        console.log('Got response from API! ', response);
    }).catch(error => {
        if (error === 'Busy') {
            if (this.triedTimes + 1 > 20) {
                console.error('API access error: ', error);
                setResponse('Error!');
            } else {
                console.log('API is currently busy, I\'ll try again later.');
                setTimeout(processApiRequest.bind({triedTimes: this.triedTimes + 1}), 500);
            }
        } else {
            console.error('Error while trying to fetch response from API! ', error);
            setResponse('Error!');
        }
    });
}

navigator.geolocation.getCurrentPosition(fillCoordinates, fillingCoordinatesError, {
    enableHighAccuracy: true,
    timeout: 10000,
})

btnElem.addEventListener('click', processApiRequest.bind({triedTimes: 0}))