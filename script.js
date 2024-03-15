// Content script
function addButton() {
  // Select all the existing download buttons
  const downloadButtons = document.querySelectorAll(
    '.mantine-UnstyledButton-root[href^="/api/download/models/"]'
  );
  const createButton = document.querySelectorAll(
    '.mantine-UnstyledButton-root[data-activity="create:model"]'
  );

  // Loop through each download button
  downloadButtons.forEach((downloadButton) => {
    // Get the parent container of the download button
    const buttonContainer = downloadButton.parentNode;
    const downloadParams = downloadButton.href.split('?')[1];

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

      // Get the IDs from the URL
      const url = new URL(window.location.href);
      let modelId = url.pathname.split("/").pop();
      // Check if the modelId is an integer, and if not, pop again
      if (isNaN(parseInt(modelId))) {
        modelId = url.pathname.split("/")[2];
      }
      const modelVersionId = url.searchParams.get("modelVersionId");

      // Create the link based on the IDs
      const link = `stabilitymatrix://downloadCivitModel?modelid=${modelId}${
        modelVersionId ? `&modelVersionId=${modelVersionId}&${downloadParams}` : `&${downloadParams}`
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
addButton();
navigation.addEventListener('navigate', (event) => {
  if (!event.canIntercept) {
    return;
  }
  
  const url = new URL(event.destination.url);
  if (event.downloadRequest !== null) {
    return;
  }

  if (!url.href.includes("stabilitymatrix://") && !url.href.includes("/images/")) {
    setTimeout(addButton, 500);
  }
});