// Config
const URL = "https://api.freecurrencyapi.com/v1/latest";
const API_KEY = "fca_live_T0mPlEkWPwoUnPAT6R6fC4V18UibBnTEeVvfcqzK";
const INTERVAL = 1000; // 1 second

// Gets prices for a given array of currencies
const getPrices = async (currencies) => {
  if (currencies.length === 0) return {};
  const cur = currencies.join(",");
  const url = `${URL}?apikey=${API_KEY}&currencies=${cur}&base_currency=NZD`;
  const request = await fetch(url);
  const response = await request.json();
  return response.data;
};

const getBalance = (balance) => {
  // FX account
  if (balance.includes(" ")) {
    const end = balance.search(/\d/);
    const start = balance.search(/[a-zA-Z]/);
    const number = balance.substring(end, balance.length - 1).replace(/,/g, "");
    return {
      currency: balance.substring(start, end - 1),
      amount: parseFloat(number),
    };
  }

  // NZD account
  return {
    currency: "NZD",
    amount: parseFloat(balance.replace(/,/g, "")),
  };
};

let checkElementInterval = setInterval(async () => {
  // Getting elements
  const overallContainer = document.getElementsByClassName("balance-1-1-1");
  if (!overallContainer || !overallContainer[0]) return;
  const overall = overallContainer[0].querySelector(".js-net-pos");
  if (!overall) return;
  const accountBalances = document.getElementsByClassName(`account-balance`);
  if (!accountBalances) return;
  clearInterval(checkElementInterval);

  // Getting prices
  const currencies = [];
  for (let i = 0; i < accountBalances.length; i++) {
    let balance = getBalance(accountBalances[i].textContent);
    if (balance.currency !== "NZD") currencies.push(balance.currency);
  }
  const prices = await getPrices(currencies);

  // Get account total
  let newTotal = 0;
  for (let i = 0; i < accountBalances.length; i++) {
    let balance = getBalance(accountBalances[i].textContent);
    if (balance.currency !== "NZD") balance.amount /= prices[balance.currency];
    newTotal += balance.amount;
  }

  // Remove tooltip
  const tooltip = overallContainer[0].querySelector(".help-1-1-3");
  if (tooltip) tooltip.remove();

  // Update overall
  newTotal = Math.round(newTotal * 100) / 100;
  overall.textContent = newTotal.toLocaleString("en-US");
}, INTERVAL);
