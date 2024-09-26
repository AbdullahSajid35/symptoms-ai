const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const randomstring = require("randomstring");
const sgMail = require("@sendgrid/mail");

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  port: "3310",
  user: "root",
  password: "",
  database: "symptoms_ai",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
});

// Route to get user data by username
app.get("/user/:username", (req, res) => {
  console.log("GET /user/:username");
  const username = req.params.username; // Get the username from the URL params

  const selectQuery = "SELECT * FROM users WHERE Username = ?";

  // Fetch the user data from the database
  db.query(selectQuery, [username], (err, result) => {
    if (err) {
      console.error("Error fetching user data from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        // Send back the user data
        console.log("User found:", result[0]);
        res.status(200).json({ user: result[0] });
      } else {
        // User not found
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});
// Route to get user data by Patient
app.get("/patient/:patientId", (req, res) => {
  console.log("GET /patient/:patientId");
  const ID = req.params.patientId; // Get the username from the URL params

  const selectQuery = "SELECT * FROM patients WHERE ID = ?";

  // Fetch the user data from the database
  db.query(selectQuery, [ID], (err, result) => {
    if (err) {
      console.error("Error fetching user data from MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        // Send back the user data
        console.log("User found:", result[0]);
        res.status(200).json({ user: result[0] });
      } else {
        // User not found
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password, username, PhoneNo } = req.body;

  // Check if the email or username already exists in the database
  const checkQuery = "SELECT * FROM users WHERE Email = ? OR Username = ?";
  const checkValues = [email, username];

  db.query(checkQuery, checkValues, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking user existence in MySQL:", checkErr);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (checkResult.length > 0) {
        // User already exists, return an error
        res.status(400).json({ error: "User already exists" });
      } else {
        // User doesn't exist, proceed with insertion
        const insertQuery =
          "INSERT INTO users (Firstname, Lastname, Email, Password, Username, PhoneNo) VALUES (?, ?, ?, ?, ?, ?)";
        const insertValues = [
          firstname,
          lastname,
          email,
          password,
          username,
          PhoneNo,
        ];

        db.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error inserting data into MySQL:", insertErr);
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res.status(200).json({ message: "Registration successful" });
          }
        });
      }
    }
  });
});

app.put("/edit-profile", (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    phoneNo,
    password,
    address, // Added address
    city, // Added city
    state, // Added state
  } = req.body;

  // Define the SQL query for updating the user's profile
  const updateQuery = `
    UPDATE users
    SET Firstname = ?, Lastname = ?, Email = ?, PhoneNo = ?, Password = ?, Address = ?, City = ?, State = ?
    WHERE Username = ?`;

  // The values to be updated
  const updateValues = [
    firstName,
    lastName,
    email,
    phoneNo,
    password,
    address, // Include address in the update values
    city, // Include city in the update values
    state, // Include state in the update values
    username, // Username is used for identification
  ];

  // Perform the query to update the user profile
  db.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error("Error updating user data in MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json({ message: "Profile updated successfully" });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const selectQuery = "SELECT * FROM users WHERE Username = ?";
  db.query(selectQuery, [username], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    // Compare the provided password with the password in the database
    if (password === user.Password) {
      // Passwords match, user is authenticated
      return res.status(200).json({ message: "Login successful", user: user });
    } else {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  });
});
sgMail.setApiKey(
  "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"
);

app.post("/patient_info", (req, res) => {
  const {
    firstname,
    address,
    contact,
    id,
    place_of_birth,
    gender,
    marital_status,
    doctor_fname,
    doctor_lname,
  } = req.body;

  const checkQuery = "SELECT * FROM patients WHERE id = ?";
  const checkValues = [id];

  db.query(checkQuery, checkValues, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking patient existence in MySQL:", checkErr);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (checkResult.length > 0) {
        res.status(400).json({ error: "Patient with same id already exists" });
      } else {
        const insertQuery =
          "INSERT INTO patients (ID, Firstname, Address, Contact, PlaceOfBirth, Gender,MaritalStatus, DoctorFname, DoctorLname) VALUES (?, ?, ?, ?, ?, ?,?,?,?)";
        const insertValues = [
          id,
          firstname,
          address,
          contact,
          place_of_birth,
          gender,
          marital_status,
          doctor_fname,
          doctor_lname,
        ];

        db.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            console.error(
              "Error inserting patient data into MySQL:",
              insertErr
            );
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res
              .status(200)
              .json({ message: "Patient data insertion successful" });
          }
        });
      }
    }
  });
});

app.post("/patient_result", (req, res) => {
  const { id, disease, examination } = req.body;

  const checkQuery = "SELECT * FROM patients WHERE id = ?";
  const checkValues = [id];

  db.query(checkQuery, checkValues, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking patient existence in MySQL:", checkErr);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (checkResult.length > 0) {
        const insertQuery =
          "UPDATE patients SET Disease = ?, Examination = ? WHERE ID = ?;";
        const insertValues = [disease, examination, id];

        db.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            console.error(
              "Error inserting patient data into MySQL:",
              insertErr
            );
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res
              .status(200)
              .json({ message: "Patient data insertion successful" });
          }
        });
      }
    }
  });
});

app.post("/patient_plan", (req, res) => {
  const { id, plan } = req.body;

  const checkQuery = "SELECT * FROM patients WHERE ID = ?";
  const checkValues = [id];

  db.query(checkQuery, checkValues, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking patient existence in MySQL:", checkErr);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (checkResult.length > 0) {
        const insertQuery =
          "UPDATE patients SET TreatmentPlan = ? WHERE ID = ?;";
        const insertValues = [plan, id];

        db.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            console.error(
              "Error inserting patient data into MySQL:",
              insertErr
            );
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res
              .status(200)
              .json({ message: "Patient data insertion successful" });
          }
        });
      }
    }
  });
});

app.post("/patient_history", (req, res) => {
  const { patient_id, diseases } = req.body; // Extract patient_id and diseases from request body

  // Validate the input
  if (!patient_id || !Array.isArray(diseases) || diseases.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid patient_id or diseases list." });
  }

  // Prepare the insert query
  const insertQuery = "INSERT INTO history (patient_id, disease) VALUES (?, ?)";

  // Iterate over the diseases array and insert each one
  diseases.forEach((disease) => {
    const insertValues = [patient_id, disease];

    db.query(insertQuery, insertValues, (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error inserting disease data into MySQL:", insertErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  });

  // Respond once all insert queries have been executed
  res
    .status(200)
    .json({ message: "Patient history data insertion successful" });
});

app.post("/forget-password", (req, res) => {
  const { Username } = req.body;

  const sql = `SELECT email FROM users WHERE username = ?`;
  db.query(sql, [Username], (error, results) => {
    if (error) {
      console.error("Error searching for user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const email = results[0].email;
    const newPassword = randomstring.generate(10);

    const updateSql = `UPDATE users SET Password = ? WHERE email = ?`;
    db.query(updateSql, [newPassword, email], (updateError, updateResults) => {
      if (updateError) {
        console.error("Error updating password:", updateError);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const msg = {
        to: email,
        from: "bashayerh77@gmail.com",
        subject: "New Password for Symptom AI",
        text: `Your new password for Symptom AI is: ${newPassword}`,
      };

      sgMail
        .send(msg)
        .then(() => {
          res.status(200).json({ message: "New password sent to your email" });
        })
        .catch((emailError) => {
          console.error(emailError.toString());
          res.status(500).json({ error: "Internal Server Error" });
        });
    });
  });
});

app.get("/patient_history/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Patient ID is required" });
  }

  const selectQuery = "SELECT * FROM history WHERE patient_id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const diseases = results.map((row) => row.disease);
    return res.status(200).json({ diseases });
  });
});

app.get("/patient_data/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Patient ID is required" });
  }

  const selectQuery = "SELECT * FROM patients WHERE ID = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const patient = results[0];
    return res.status(200).json({ patient });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
