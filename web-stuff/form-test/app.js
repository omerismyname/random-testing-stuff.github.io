const line = document.querySelector(".form form span .line");
const textarea = document.querySelector(".form form span textarea");
const warning = document.querySelector(".form .warning");

textarea.addEventListener("blur", () => {
  if (line.checkValidity()) {
    textarea.style.borderColor = "lightgreen";
  } else {
    textarea.style.borderColor = "";
  }
});

line.addEventListener("blur", () => {
  if (line.value == "" && textarea.value == "") {
    textarea.style.borderColor = "";
  }
});


const guestbook = document.querySelector(".guestbook");

function loadGuestbook() {
  fetch("https://guestbook.omer.ws", {cache: "no-cache"})
  .then(response => response.json())
  .then(data => {
    guestbook.innerHTML = "";
    for(const d of data) {
      guestbook.innerHTML += `<div class="entry"><span class="name">${d.name}</span><span class="message">${d.message}</span><span class="date">${new Date(d.date).toLocaleDateString()}</span></div>`;
    }
  })
  .catch(err => console.log("Error while fetching data" + err));
}


function onFormSubmit() {
  fetch("https://guestbook.omer.ws",
  {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: line.value,
      message: textarea.value
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      warning.style.display = "none";
      loadGuestbook();
    } else {
      warning.style.display = "block";
      warning.innerHTML = data.error;
    }
  })
  .catch(err => {
    warning.style.display = "block";
    warning.innerHTML = "Failed to submit";
    console.log(err);
  });
  return false;
}

loadGuestbook();