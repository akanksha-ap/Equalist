// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
      const selectedText = window.getSelection().toString();
      sendResponse({ text: selectedText });
    }
  });
  
  function applyColorBlindMode(mode) {
    // Remove previous colorblind classes
    document.body.classList.remove("deuteranopia", "protanopia", "tritanopia");
  
    if (mode === "deuteranopia") {
      document.body.classList.add("deuteranopia");
    } else if (mode === "protanopia") {
      document.body.classList.add("protanopia");
    } else if (mode === "tritanopia") {
      document.body.classList.add("tritanopia");
    }
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "applySettings") {
      const { textSize, contrast, darkMode, colorBlindMode } = message;
  
      document.body.style.fontSize = `${textSize}%`;
      document.body.style.filter = contrast ? "contrast(150%)" : "contrast(100%)";
      document.body.style.backgroundColor = darkMode ? "#000" : "#fff";
      document.body.style.color = darkMode ? "#fff" : "#000";
  
      // Apply colorblind mode
      applyColorBlindMode(colorBlindMode);
    }
  });