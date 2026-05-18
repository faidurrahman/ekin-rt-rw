async function check() {
  const url = "https://script.google.com/macros/s/AKfycbzkrxnweRh3ofAywKt1diC8oiz89dQqu5fk5vk54BO1RYoEEPvJg1eC0EmjT8DusUOk/exec?sheetName=Data_Berkas";
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data.data[0]));
}

check();
