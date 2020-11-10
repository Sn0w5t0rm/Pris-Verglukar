// ==UserScript==
// @name     Pris Verglukar
// @version  1
// @grant    none
// @author   Storm
// @include  https://www.ikea.com/*/*/p/*
// ==/UserScript==
window.addEventListener("load", function () {
  function addOtherPrice() {
    const uri = window.location.href;

    // Input the country code of the website you wish to compare to in this format '../..'
    const language = "nl/nl";

    // The base currency used in the country you are comparing to (the one you put in above ^^ )
    // List of currency codes: https://www.iban.com/currency-codes
    const baseCurrency = "EUR";

    // The currency you want that article's price to be shown in (the currency you use)
    const otherCurrency = "EUR";

    let exchangeRate = 1;
    let exchangeRateRequestUri;

    const productId = document.getElementsByClassName(
      "range-revamp-product-identifier__number"
    )[0].innerText;
    const priceSpan = document.getElementsByClassName("range-revamp-price");
    const herePriceFloat = parseFloat(document.getElementsByClassName("range-revamp-price__integer")[0].innerText + document.getElementsByClassName("range-revamp-price__decimals")[0].innerText);

    const searchUri = `https://sik.search.blue.cdtapps.com/${language}/search-result-page?&q=${productId}`;

    let available = true;
    let otherPrice;
    let otherSiteUri = "";

    if (
      baseCurrency !== otherCurrency &&
      getWithExpiry("exchangeRate") === null
    ) {
      exchangeRateRequestUri = `https://api.exchangeratesapi.io/latest?base=${baseCurrency}&symbols=${otherCurrency}`;
      getExchangeRate().then(function (result) {
        let helper = result.rates[otherCurrency];
        helper = helper.toString();
        setWithExpiry("exchangeRate", helper, 24);
        lookupPrice();
        console.log("Fetched exchange rate and updated it in localStorage");
      });
      console.log("Fetching exchange rate...");
    } else {
      lookupPrice();
    }

    function getExchangeRate() {
      return fetch(exchangeRateRequestUri).then(function (result) {
        return result.json();
      });
    }

    function setWithExpiry(key, value, ttl) {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + ttl * 1000 * 60 * 60,
      };
      localStorage.setItem(key, JSON.stringify(item));
    }

    function getWithExpiry(key) {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }
      const item = JSON.parse(itemStr);
      const now = new Date();
      if (now.getTime() > new Date(item.expiry).getTime()) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    }

    function lookupPrice() {
      console.log("Looking up price...", searchUri);
      fetch(searchUri)
        .then(function(result) {
          return result.json();
        })
        .then(function(result) {
          try {
            otherPrice = ` ${otherCurrency} ${(
              result.searchResultPage.productWindow[0].priceNumeral *
              exchangeRate
            ).toFixed(2)}`;
            otherSiteUri = result.searchResultPage.productWindow[0].pipUrl;
          } catch {
            available = false;
            otherPrice = " N/A in other country";
          }
          const otherPriceFloat = parseFloat(result.searchResultPage.productWindow[0].priceNumeral);

          let otherPriceSpan = document.createElement("span");
          let otherPricetextnode = document.createTextNode(otherPrice);
          otherPriceSpan.appendChild(otherPricetextnode);
          priceSpan[0].appendChild(otherPriceSpan);

          if (otherPriceFloat > herePriceFloat) {
            priceSpan[0].lastChild.style.color = "#a00";
          } else {
            priceSpan[0].lastChild.style.color = "#0a0";
          }

          if (available) {
            console.log("Other price found!");
            const divToAppend = document.getElementsByClassName(
              "range-revamp-pip-price-package__price-wrapper"
            )[0];

            let otherSiteButton = document.createElement("button");
            otherSiteButton.innerHTML = `<a href="${otherSiteUri}">Take me there</a>`;
            otherSiteButton.firstChild.style.textDecorationStyle;
            divToAppend.appendChild(otherSiteButton);
          }
        });
    }
  }
  addOtherPrice();
});
