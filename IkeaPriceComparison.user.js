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

    const productId = document.getElementsByClassName("js-product-pip")[0].dataset.productNo;
    const searchUri = `https://sik.search.blue.cdtapps.com/${language}/search-result-page?&q=${productId}`;
    
    const priceWrapperClassName = "pip-temp-price-module__price";
    const priceElementClassName = "pip-temp-price-module__primary-currency-price";

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
      console.log("Looking up price...");
      fetch(searchUri)
        .then(function (result) {
          return result.json();
        })
        .then(function (result) {
          try {
            otherPrice = ` ${otherCurrency} ${(
              result.searchResultPage.products.main.items[0].product.salesPrice.numeral *
              exchangeRate
            ).toFixed(2)}`;
            otherSiteUri = result.searchResultPage.products.main.items[0].product.pipUrl;
          } catch {
            available = false;
            otherPrice = " N/A in other country";
          }

          // create the element that holds the price found
          let otherPriceSpan = document.createElement("span");
          let otherPricetextnode = document.createTextNode(otherPrice);
          otherPriceSpan.appendChild(otherPricetextnode);

          // get the price span
          const priceElement = document.getElementsByClassName(priceElementClassName);

          if (priceElement && priceElement[0]) {
            priceElement[0].appendChild(otherPriceSpan);
            priceElement[0].lastChild.style.color = "#a00";
          }

          if (available) {
            console.log("Other price found!");
            console.log(otherPrice);

            // create a button that brings you to the IKEA page of the selected country's article
            let otherSiteButton = document.createElement("button");
            otherSiteButton.innerHTML = `<a href="${otherSiteUri}">Take me there</a>`;
            otherSiteButton.firstChild.style.textDecorationStyle;
            
            // get the price wrapper
            const divToAppend = document.getElementsByClassName(priceWrapperClassName)[0];
            if (divToAppend) {
              divToAppend.appendChild(otherSiteButton);
            }
            console.log('URL : ' + otherSiteUri);
          }
        });
    }
  }
  addOtherPrice();
});
