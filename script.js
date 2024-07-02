// script.js

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");
  const uploadInput = document.getElementById("uploadInput");
  const templateCarousel = document.getElementById("templateCarousel");
  const downloadButton = document.getElementById("downloadButton");
  const deleteButton = document.getElementById("deleteButton");
  let backgroundImage = null;
  let overlays = [];

  // Function to handle image upload
  uploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (readerEvent) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        backgroundImage = img;
      };
      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });

  // Function to add overlay from carousel to canvas
  function addOverlayToCanvas(overlayImageSrc, w, h) {
    const img = new Image();
    img.onload = function () {
      overlays.push({
        image: img,
        x: 50,
        y: 50,
        width: w,
        height: h,
        rotation: 0,
      }); // Initial position and size
      redrawCanvas();
    };
    img.src = overlayImageSrc;
  }

  // Variables to handle resizing and rotating
  let selectedOverlay = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragAngleStartOverlay = 0;
  let dragAngleStartMouse = 0;
  const EditState = {
    ROTATION: "rotation",
    POSITION: "position",
    SCALE: "scale",
  };

  let editState = EditState.POSITION;

  // Function to handle radio button click event
  function handleRadioButtonClick(event) {
    const value = event.target.id;
    console.log(value);
    // Perform different actions based on the selected radio button
    switch (value) {
      case "rotationButton":
        editState = EditState.ROTATION;
        break;
      case "scaleButton":
        editState = EditState.SCALE;
        break;
      case "positionButton":
        editState = EditState.POSITION;
        break;
      default:
        editState = EditState.POSITION;
        break;
    }
  }

  // Add event listener to radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(function (radioButton) {
    radioButton.addEventListener("click", handleRadioButtonClick);
  });

  // Function to handle mouse down event on overlays for resizing and rotating
  canvas.addEventListener("mousedown", function (event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Check if clicked inside any overlay
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      if (
        mouseX >= overlay.x &&
        mouseX <= overlay.x + overlay.width &&
        mouseY >= overlay.y &&
        mouseY <= overlay.y + overlay.height
      ) {
        selectedOverlay = overlay;
        isDragging = true;
        dragAngleStartOverlay = overlay.rotation;
        const centerX = selectedOverlay.x + selectedOverlay.width / 2;
        const centerY = selectedOverlay.y + selectedOverlay.height / 2;
        dragAngleStartMouse = Math.atan2(mouseY - centerY, mouseX - centerX);
        dragStartX = mouseX - overlay.x;
        dragStartY = mouseY - overlay.y;
        break;
      }
    }

    // If we aren't dragging, deselect the overlay
    if (!isDragging) {
      selectedOverlay = null;
    }
  });

  // Function to handle mouse move event for resizing and rotating overlays
  canvas.addEventListener("mousemove", function (event) {
    if (isDragging && selectedOverlay) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      // Depending on edit state, perform different actions
      if (editState === EditState.POSITION) {
        selectedOverlay.x = mouseX - dragStartX;
        selectedOverlay.y = mouseY - dragStartY;
      } else if (editState === EditState.ROTATION) {
        const centerX = selectedOverlay.x + selectedOverlay.width / 2;
        const centerY = selectedOverlay.y + selectedOverlay.height / 2;
        const angle =
          dragAngleStartOverlay +
          Math.atan2(mouseY - centerY, mouseX - centerX) -
          dragAngleStartMouse;
        selectedOverlay.rotation = angle;
      } else if (editState === EditState.SCALE) {
        selectedOverlay.width = mouseX - selectedOverlay.x;
        selectedOverlay.height = mouseY - selectedOverlay.y;
      }

      redrawCanvas();
    }
  });

  // Function to handle mouse up event to stop resizing and rotating
  canvas.addEventListener("mouseup", function () {
    isDragging = false;
    // selectedOverlay = null;
    redrawCanvas();
  });

  // Function to delete selected overlay
  function deleteSelectedOverlay() {
    if (selectedOverlay) {
      const index = overlays.indexOf(selectedOverlay);
      overlays.splice(index, 1);
      selectedOverlay = null;
      redrawCanvas();
    }
  }

  // Example: Implement a delete button for overlays
  deleteButton.addEventListener("click", function () {
    deleteSelectedOverlay();
  });

  downloadButton.addEventListener("click", function () {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // Function to redraw the canvas with current background and overlays
  function redrawCanvas(includeSelected = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    overlays.forEach(function (overlay) {
      // Draw a square around the selected overlay
      if (includeSelected && overlay === selectedOverlay) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(overlay.x, overlay.y, overlay.width, overlay.height);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(
        overlay.x + overlay.width / 2,
        overlay.y + overlay.height / 2
      );
      ctx.rotate(overlay.rotation);
      ctx.drawImage(
        overlay.image,
        -overlay.width / 2,
        -overlay.height / 2,
        overlay.width,
        overlay.height
      );
      ctx.restore();
    });
  }

  // Initialize the template carousel with overlay options
  const templateImages = ["trumptardio.png"];

  templateImages.forEach(function (template) {
    const img = new Image();
    // img.crossOrigin = "anonymous";
    img.src = template;
    img.onload = function () {
      templateCarousel.appendChild(img);
    };

    img.addEventListener("click", function () {
      addOverlayToCanvas(img.src, img.width, img.height);
    });
  });
});