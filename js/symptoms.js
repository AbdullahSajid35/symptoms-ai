const ul = document.querySelector("ul"),
  input = document.querySelector(".input"),
  tagNumb = document.querySelector(".details span");

let maxTags = 30;
let minTags = 5;
tags = [];

countTags();
createTag();

function countTags() {
  input.focus();
  tagNumb.innerText = maxTags - tags.length;
}

function handleSubmit() {
  if (tags.length >= minTags) {
    fetch("https://zeeshan485-disease-prediction.hf.space/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: tags,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse the response as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(
          "Response Data:",
          data.disease,
          data.examination,
          sessionStorage.getItem("patient_id")
        );
        fetch("http://localhost:3000/patient_result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: sessionStorage.getItem("patient_id"),
            disease: data.disease,
            examination: data.examination,
          }),
        })
          .then((response) => {
            if (response.ok) {
              window.location.href = "./diagnoseresult.html";
            } else {
              // Handle error responses
              response.json().then((data) => {
                alert(
                  "Failed to save medical history. " +
                    (data.error || "Please try again.")
                );
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
          });
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      });
  } else {
    alert(`Please add at least ${minTags} tags.`);
  }
}

function createTag() {
  ul.querySelectorAll("li").forEach((li) => li.remove());
  tags
    .slice()
    .reverse()
    .forEach((tag) => {
      let liTag = `<li>${tag} <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
      ul.insertAdjacentHTML("afterbegin", liTag);
    });
  countTags();
}

function remove(element, tag) {
  let index = tags.indexOf(tag);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  element.parentElement.remove();
  countTags();
}

function addTag(e) {
  if (e.key == "Enter") {
    let tag = e.target.value.replace(/\s+/g, " ");
    if (tag.length > 1 && !tags.includes(tag)) {
      if (tags.length < maxTags) {
        tag.split(",").forEach((tag) => {
          tags.push(tag);
          createTag();
        });
      }
    }
    e.target.value = "";
  }
}

input.addEventListener("keyup", addTag);

const removeBtn = document.querySelector(".reset-btn");
removeBtn.addEventListener("click", () => {
  tags.length = 0;
  ul.querySelectorAll("li").forEach((li) => li.remove());
  countTags();
});
