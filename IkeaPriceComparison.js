// ==UserScript==
// @name     Ikea Price Thingy
// @version  1
// @grant    none
// @author   Storm
// @include  https://www.ikea.com/*/*/p/*
// ==/UserScript==
window.addEventListener("load", function () {
  function addOtherPrice() {
    const uri = window.location.href;
    const language = "nl/nl"; // Input the country code of the website you wish to compare to in this format '../..'
    const productId = document.getElementsByClassName(
      "range-revamp-product-identifier__number"
    )[0].innerText;
    const priceSpan = document.getElementsByClassName("range-revamp-price");
    const searchUri = `https://sik.search.blue.cdtapps.com/${language}/search-result-page?&q=${productId}`;

    fetch(searchUri)
      .then(function (result) {
        return result.json();
      })
      .then(function (result) {
        const otherPrice =
          " €" + result.searchResultPage.productWindow[0].priceNumeral;
        const otherSiteUri = result.searchResultPage.productWindow[0].pipUrl;

        let otherPriceSpan = document.createElement("span");
        let otherPricetextnode = document.createTextNode(otherPrice);
        otherPriceSpan.appendChild(otherPricetextnode);
        priceSpan[0].appendChild(otherPriceSpan);
        priceSpan[0].lastChild.style.color = "#a00";

        const divToAppend = document.getElementsByClassName(
          "range-revamp-pip-price-package__price-wrapper"
        )[0];

        let otherSiteButton = document.createElement("button");
        otherSiteButton.innerHTML = `<a href="${otherSiteUri}">Take me there</a>`;
        otherSiteButton.firstChild.style.textDecorationStyle;
        divToAppend.appendChild(otherSiteButton);
      });
  }
  addOtherPrice();
});
