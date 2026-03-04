async function loadAccounts() {

  const response = await fetch("/accounts");
  const accounts = await response.json();

  const tableBody = document.querySelector("#accountsTable tbody");
  tableBody.innerHTML = "";

  let v1Count = 0;
  let v2Count = 0;

  accounts.forEach(acc => {

    if (acc.v1_generated) v1Count++;
    if (acc.v2_generated) v2Count++;

    const row = document.createElement("tr");

    const updated = acc.last_updated
      ? new Date(acc.last_updated).toLocaleString()
      : "—";

    row.innerHTML = `
      <td>${acc.account_id}</td>
      <td class="${acc.v1_generated ? "success" : "missing"}">
        ${acc.v1_generated ? "✓" : "X"}
      </td>
      <td class="${acc.v2_generated ? "success" : "missing"}">
        ${acc.v2_generated ? "✓" : "X"}
      </td>
      <td>${updated}</td>
    `;

    tableBody.appendChild(row);

  });

  document.getElementById("totalAccounts").innerText = accounts.length;
  document.getElementById("v1Count").innerText = v1Count;
  document.getElementById("v2Count").innerText = v2Count;

}

loadAccounts();