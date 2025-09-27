window.loginAdmin = function () {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const role = "admin";
    let errorBox = document.getElementById("login-error");
    localStorage.setItem('email', email);
    console.log(email);
    console.log(password);

    axios.post('https://stagenography.onrender.com/login', { email, password, role })
        .then(response => {
            generateAdminOTP();
        })
        .catch(error => {
            console.log(error);
            errorBox.textContent = "Invalid email or password";
            return;
        });
}

window.generateAdminOTP = function () {
    const generatedOTP = Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('generatedOTP', generatedOTP);
    const email = localStorage.getItem('email');
    let errorBox = document.getElementById("login-error");
    console.log("email", email);
    console.log("otp", generatedOTP);
    
    axios.post('https://stagenography.onrender.com/otp', { email, otp: generatedOTP })
        .then(response => {
            console.log("OTP sent");
        })
        .catch(error => {
            const errorMsg = "Login failed";
            errorBox.textContent = errorMsg;
            console.error("Error response data:", error.response?.data);
            console.error("Error response status:", error.response?.status);
            console.error("Error response headers:", error.response?.headers);
            return;
        });

    console.log("axios completed");
    window.location.href = "adminOTP.html";
}

window.verifyOTP = function () {
    let enteredOTP = document.getElementById("otp-input").value;
    let errorBox = document.getElementById("otp-error");
    const generatedOTP = localStorage.getItem('generatedOTP');
    console.log("Entered OTP:", enteredOTP);
    console.log("Generated OTP:", generatedOTP);
    
    if (!enteredOTP) {
        errorBox.textContent = "Please enter the OTP";
        return;
    }
    
    if (enteredOTP == generatedOTP) {
        console.log("OTP verified successfully, navigating to homepage");
        window.location.href = "adminHomepage.html";
    } else {
        errorBox.textContent = "Incorrect OTP! Try again.";
    }
}

window.blockUser = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('adminEmailInput').value;
    const statusElement = document.getElementById('adminStatus');
    
    if (!email) {
        statusElement.textContent = 'Please enter an email';
        statusElement.className = 'status-message error';
        return;
    }

    try {
        const response = await axios.post('https://stagenography.onrender.com/admin/blockUser', { email });
        statusElement.textContent = response.data.message;
        statusElement.className = 'status-message success';
    } catch (error) {
        console.error('Error blocking user:', error);
        statusElement.textContent = error.response?.data?.message || 'Error occurred';
        statusElement.className = 'status-message error';
    }
}

window.unblockUser = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('adminEmailInput').value;
    const statusElement = document.getElementById('adminStatus');
    
    if (!email) {
        statusElement.textContent = 'Please enter an email';
        statusElement.className = 'status-message error';
        return;
    }

    try {
        const response = await axios.post('https://stagenography.onrender.com/admin/unblockUser', { email });
        statusElement.textContent = response.data.message;
        statusElement.className = 'status-message success';
    } catch (error) {
        console.error('Error unblocking user:', error);
        statusElement.textContent = error.response?.data?.message || 'Error occurred';
        statusElement.className = 'status-message error';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const verifyButton = document.getElementById('verifyOTP');
    if (verifyButton) {
        verifyButton.addEventListener('click', verifyOTP);
    }

    const resendButton = document.getElementById('resendOTP');
    if (resendButton) {
        resendButton.addEventListener('click', function() {
            generateAdminOTP();
        });
    }
    
    const otpInput = document.getElementById('otp-input');
    if (otpInput) {
        otpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyOTP();
            }
        });
        
        otpInput.focus();
    }

    const blockButton = document.querySelector('.block-btn');
    if (blockButton) {
        blockButton.addEventListener('click', blockUser);
    }

    const unblockButton = document.querySelector('.unblock-btn');
    if (unblockButton) {
        unblockButton.addEventListener('click', unblockUser);
    }

    const emailInput = document.getElementById('adminEmailInput');
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                blockUser();
            }
        });
    }
});
