const getPrices = async (currencies) => {
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_T0mPlEkWPwoUnPAT6R6fC4V18UibBnTEeVvfcqzK&currencies=${currencies.join(
    ","
  )}&base_currency=NZD`;
  const request = await fetch(url);
  const response = await request.json();
  return response.data;
};

let checkElementInterval = setInterval(async () => {
  const overallContainer = document.getElementsByClassName("balance-1-1-1");

  if (!overallContainer) {
    console.log("BNZBankBuddy: No overall container found");
    return;
  }

  const overall = overallContainer[0].querySelector(".js-net-pos");
  if (!overall) {
    console.log("BNZBankBuddy: No overall found");
    return;
  }
  clearInterval(checkElementInterval);

  const tooltip = overallContainer[0].querySelector(".help-1-1-3");

  // Getting prices
  const accountBalances = document.getElementsByClassName(`account-balance`);
  let currencies = [];
  for (let i = 0; i < accountBalances.length; i++) {
    const accountBalance = accountBalances[i];
    const accountBalanceText = accountBalance.textContent;
    if (accountBalanceText.includes(" ")) {
      const firstNumberIndex = accountBalanceText.search(/\d/);
      const firstLetterIndex = accountBalanceText.search(/[a-zA-Z]/);
      const currency = accountBalanceText.substring(
        firstLetterIndex,
        firstNumberIndex - 1
      );
      currencies.push(currency);
    }
  }
  const prices = await getPrices(currencies);

  // Get account total
  let newTotal = 0;
  if (!accountBalances) {
    console.log("BNZBankBuddy: No account balances found");
    return;
  }
  for (let i = 0; i < accountBalances.length; i++) {
    const accountBalance = accountBalances[i];
    const accountBalanceText = accountBalance.textContent;

    // Handling foreign currency
    if (accountBalanceText.includes(" ")) {
      const firstNumberIndex = accountBalanceText.search(/\d/);
      const firstLetterIndex = accountBalanceText.search(/[a-zA-Z]/);
      const currency = accountBalanceText.substring(
        firstLetterIndex,
        firstNumberIndex - 1
      );
      const price = prices[currency];
      const accountBalanceNumber = parseFloat(
        accountBalanceText
          .substring(firstNumberIndex, accountBalanceText.length - 1)
          .replace(/,/g, "")
      );
      newTotal += accountBalanceNumber / price;
      console.log(
        `BNZBankBuddy: ${currency} Account found`,
        (accountBalanceNumber / price).toLocaleString("en-US")
      );
    }
    // Handling NZD
    else {
      const accountBalanceNumber = parseFloat(
        accountBalanceText.replace(/,/g, "")
      );
      newTotal += accountBalanceNumber;
      console.log(
        "BNZBankBuddy: Account found",
        accountBalanceNumber.toLocaleString("en-US")
      );
    }
  }

  // Remove tooltip
  if (tooltip) {
    tooltip.remove();
  }

  // Update overall
  overall.textContent = newTotal.toLocaleString("en-US");
}, 1000);
