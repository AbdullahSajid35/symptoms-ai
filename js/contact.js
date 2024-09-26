document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form values
    var name = document.getElementById("name").value;
    var phone = document.getElementById("phone").value;
    var message = document.getElementById("message").value;

    // Prepare template parameters
    var templateParams = {
      from_name: name,
      from_phone: phone,
      from_message: message,
      to_email: "syedmoazamali4321@gmail.com",
    };

    // Send email using EmailJS
    emailjs.send("service_pxzubdh", "template_g3zjzwa", templateParams).then(
      function (response) {
        console.log("SUCCESS!", response.status, response.text);
        alert("Your message has been sent successfully!");
        document.getElementById("contactForm").reset();
      },
      function (error) {
        console.log("FAILED...", error);
        alert("Failed to send the message. Please try again later.");
      }
    );
  });
