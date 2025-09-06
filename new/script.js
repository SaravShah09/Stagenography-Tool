// import axios from "axios";

// Redirect to Signup
window.goToSignup = function () {
    window.location.href = "signup.html";
}

// Login User
window.loginUser = function () {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    let errorBox = document.getElementById("login-error");
    localStorage.setItem('email', email);


    axios.post('https://stagenography-tool1.onrender.com/login', { email, password })
        .then(response => {
            // console.log(response.data);
            generateOTP();
        })
        .catch(error => {
            console.log(error)
            errorBox.textContent = error.response.data.message || "Invalid email or password";
            return;
        });
}




// Signup User
window.signupUser = function () {
    const name = document.getElementById("signup-name").value.trim();
    const dob = document.getElementById("signup-dob").value;
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;
    const errorElement = document.getElementById("signup-error");

    // Clear previous error message
    errorElement.innerText = "";

    // Password validation pattern
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
        errorElement.innerText = "Invalid Email format!";
        return;
    }

    if (!name || !dob || !email || !password || !confirmPassword) {
        errorElement.innerText = "All fields are required!";
        return;
    }

    if (!passwordPattern.test(password)) {
        errorElement.innerText = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character!";
        return;
    }

    if (password !== confirmPassword) {
        errorElement.innerText = "Passwords do not match!";
        return;
    }

    const generatedOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("generatedOTP", generatedOTP);

    axios.post('http://localhost:3001/otp', { email, otp: generatedOTP })
        .then(response => {
            // console.log(response.data);
            console.log("OTP sent");
        })
        .catch(error => {
            errorElement.textContent = "Error in sending OTP";
            console.log("Send otp failed: ", error);
            return;
        })

    // alert(`Your OTP is: ${generatedOTP}`); // Simulating email sending
    const userData = {
        name,
        dob,
        email,
        password,
        confirmPassword
    };

    // Save the object to localStorage by converting it to a JSON string
    localStorage.setItem('userData', JSON.stringify(userData));

    window.location.href = "signupotp.html";

}


// Generate OTP and Redirect to OTP Page
window.generateOTP = function () {
    const generatedOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('generatedOTP', generatedOTP);
    const email = localStorage.getItem('email');
    let errorBox = document.getElementById("login-error");
    console.log("email", email);
    console.log("otp", generatedOTP);
    axios.post('https://stagenography-tool1.onrender.com/otp', { email, otp: generatedOTP })
        .then(response => {
            // console.log(response.data);
            console.log("OTP sent");
        })
        .catch(error => {
            const errorMsg = "Signup failed";
            errorBox.textContent = errorMsg;
            // console.log("Send otp failed: ", error);
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
            return;
        })
    console.log("axios completed");
    // alert(`Your OTP is: ${generatedOTP}`); // Simulating email sending
    window.location.href = "otp.html";
}

window.verifySignupOTP = function () {
    const userDataString = localStorage.getItem('userData');

    // If user data is found, parse it into an object
    if (userDataString) {
        const userData = JSON.parse(userDataString);

        const name = userData.name;
        const dob = userData.dob;
        const email = userData.email;
        const password = userData.password;

        let enteredOTP = document.getElementById("otp-input").value;
        let errorBox = document.getElementById("otp-error");
        const generatedOTP = localStorage.getItem('generatedOTP');
        // console.log("generatedOPT=", generatedOTP);
        // console.log("enteredotp=", enteredOTP);
        if (enteredOTP == generatedOTP) {
            // alert("OTP Verified! Redirecting to homepage...");
            axios.post('https://stagenography-tool1.onrender.com/signup', { email, password, name, dob, role: "user" })
                .then(response => {
                    localStorage.setItem('email', email);
                    console.log("Signup Successful");
                    window.location.href = "homepage.html";
                })
                .catch(error => {
                    console.error('Signup failed:', error);
                    errorBox.textContent = "Signup failed";
                    // window.location.href = "index.html";
                });
        } else {
            errorBox.textContent = "Incorrect OTP! Try again.";
        }
    } else {
        console.error("No user data found in localStorage.");
    }
}

// Verify OTP
window.verifyOTP = function () {
    let enteredOTP = document.getElementById("otp-input").value;
    let errorBox = document.getElementById("otp-error");
    const generatedOTP = localStorage.getItem('generatedOTP');
    console.log(generatedOTP);
    if (enteredOTP == generatedOTP) {
        window.location.href = "homepage.html";
    } else {
        errorBox.textContent = "Incorrect OTP! Try again.";
    }
}


// document.getElementById("forgot-password-form").addEventListener("submit", function (event) {
//     event.preventDefault();

//     const email = document.getElementById("email").value.trim();

//     if (email === "") {
//         alert("Please enter a valid email.");
//         return;
//     }

//     alert("A password reset link has been sent to your email.");
// });
