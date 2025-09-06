const BASE_URL = 'https://stagenography-tool1.onrender.com'; // your deployed backend URL

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

    axios.post(`${BASE_URL}/login`, { email, password })
        .then(response => {
            generateOTP();
        })
        .catch(error => {
            console.log(error)
            errorBox.textContent = error.response?.data?.message || "Invalid email or password";
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

    errorElement.innerText = "";

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

    axios.post(`${BASE_URL}/otp`, { email, otp: generatedOTP })
        .then(response => {
            console.log("OTP sent");
        })
        .catch(error => {
            errorElement.textContent = "Error in sending OTP";
            console.log("Send otp failed: ", error);
            return;
        });

    const userData = { name, dob, email, password, confirmPassword };
    localStorage.setItem('userData', JSON.stringify(userData));

    window.location.href = "signupotp.html";
}

// Generate OTP and Redirect to OTP Page
window.generateOTP = function () {
    const generatedOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('generatedOTP', generatedOTP);
    const email = localStorage.getItem('email');
    let errorBox = document.getElementById("login-error");

    axios.post(`${BASE_URL}/otp`, { email, otp: generatedOTP })
        .then(response => {
            console.log("OTP sent");
        })
        .catch(error => {
            const errorMsg = "Signup failed";
            errorBox.textContent = errorMsg;
            console.error("Error response data:", error.response?.data);
            return;
        });

    window.location.href = "otp.html";
}

window.verifySignupOTP = function () {
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
        const userData = JSON.parse(userDataString);
        const { name, dob, email, password } = userData;

        let enteredOTP = document.getElementById("otp-input").value;
        let errorBox = document.getElementById("otp-error");
        const generatedOTP = localStorage.getItem('generatedOTP');

        if (enteredOTP == generatedOTP) {
            axios.post(`${BASE_URL}/signup`, { email, password, name, dob, role: "user" })
                .then(response => {
                    localStorage.setItem('email', email);
                    console.log("Signup Successful");
                    window.location.href = "homepage.html";
                })
                .catch(error => {
                    console.error('Signup failed:', error);
                    errorBox.textContent = "Signup failed";
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

    if (enteredOTP == generatedOTP) {
        window.location.href = "homepage.html";
    } else {
        errorBox.textContent = "Incorrect OTP! Try again.";
    }
}
