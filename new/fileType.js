window.onload = function () {
    const mediaType = localStorage.getItem("mediaType");
    const fileInput = document.getElementById("imageUpload");

    if (!fileInput) return;

    switch (mediaType) {
        case 'image':
            fileInput.accept = 'image/*';
            break;
        case 'audio':
            fileInput.accept = 'audio/*';
            break;
        case 'video':
            fileInput.accept = 'video/*';
            break;
        default:
            alert("No media type selected. Please go back to the homepage.");
            break;
    }
};
