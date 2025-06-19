// Content script
function addButton() {
  // Select all download anchors based on their API download URL instead of hashed classes
  const downloadButtons = Array.from(
    document.querySelectorAll('a[href*="/api/download/models/"]')
  ).filter((btn) => btn.getAttribute("data-tour") !== "model:download");

  // Loop through each download button
  downloadButtons.forEach((downloadButton) => {
    // Get the parent container of the download button
    const buttonContainer = downloadButton.parentNode;
    const downloadParams = downloadButton.href.split("?")[1];

    // Check if the "Download with Stability Matrix" button already exists
    const existingButton = buttonContainer.parentNode.querySelector(
      'a[href^="stabilitymatrix://downloadCivitModel"]'
    );

    // If the button already exists, skip creating a new one
    if (existingButton) {
      return;
    }

    // Check if the create button exists
    if (downloadParams) {
      // Create a new button element
      const newButton = document.createElement("a");

      newButton.className =
        "mantine-UnstyledButton-root mantine-Button-root mantine-4fe1an";
      newButton.style.backgroundColor = "#68339f";
      newButton.style.border = "none";
      newButton.style.borderRadius = "4px";
      newButton.style.color = "#fff";
      newButton.style.cursor = "pointer";
      // Adjust size and alignment
      newButton.style.padding = "4px 12px"; // slightly shorter height
      newButton.style.margin = "4px 0";
      newButton.style.fontSize = "0.875rem"; // smaller text (~14px)
      newButton.style.textAlign = "center";
      newButton.style.display = "block";

      // Get the IDs from the URL
      const url = new URL(window.location.href);
      let modelId = url.pathname.split("/").pop();

      // Check if the modelId is an integer, and if not, pop again
      let isNum = /^\d+$/.test(modelId);
      if (!isNum) {
        modelId = url.pathname.split("/")[2];
      }
      const modelVersionId = url.searchParams.get("modelVersionId");

      // Create the link based on the IDs
      const link = `stabilitymatrix://downloadCivitModel?modelid=${modelId}${
        modelVersionId
          ? `&modelVersionId=${modelVersionId}&${downloadParams}`
          : `&${downloadParams}`
      }`;

      newButton.href = link;

      // Create the inner content of the button
      const buttonInner = document.createElement("div");
      buttonInner.className = "mantine-3xbgk5 mantine-Button-inner";

      const buttonLabel = document.createElement("span");
      buttonLabel.className = "mantine-qo1k2 mantine-Button-label";
      buttonLabel.textContent = "Download with Stability Matrix";

      buttonInner.appendChild(buttonLabel);
      newButton.appendChild(buttonInner);

      // Insert the new button after the button container
      buttonContainer.parentNode.insertBefore(
        newButton,
        buttonContainer.previousSibling
      );
    }
  });
}

function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations, me) => {
    const element = document.querySelector(selector);
    if (element && element.href) {
      callback(element);
      me.disconnect(); // stop observing
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

// Wait for at least one download anchor to appear before attempting to add our button
waitForElement('a[href*="/api/download/models/"]', () => {
  addButton();
});

navigation.addEventListener("navigate", async (event) => {
  if (!event.canIntercept) {
    return;
  }

  const url = new URL(event.destination.url);
  if (event.downloadRequest !== null) {
    return;
  }

  if (
    !url.href.includes("stabilitymatrix://") &&
    !url.href.includes("/images/")
  ) {
    waitForElement('a[href*="/api/download/models/"]', () => {
      addButton();
    });
  }
});
