document.getElementById("add-note").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("about:") ||
      tab.url === ""
    ) {
      alert("Cannot add notes on this page!");
      return;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: createNote,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      }
    );
  });
});

function createNote() {
  const note = document.createElement("div");
  note.className = "note";
  
  // ایجاد بخش قابل ویرایش جداگانه
  const noteContent = document.createElement("div");
  noteContent.className = "note-content";
  noteContent.contentEditable = true;
  noteContent.textContent = "New Note";

  Object.assign(note.style, {
    position: "absolute",
    minWidth: "200px",
    minHeight: "150px",
    backgroundColor: "#ffff88",
    padding: "15px",
    zIndex: "1000",
    color: "black",
    direction: "ltr",
    cursor: "move",
    boxShadow: "3px 3px 5px rgba(0,0,0,0.2)",
    borderRadius: "5px",
  });

  const randomOffsetX = Math.random() * (50 - 20) + 20;
  const randomOffsetY = Math.random() * (50 - 20) + 20;
  note.style.left = `${(window.innerWidth - 150) / 2 + randomOffsetX + window.scrollX}px`;
  note.style.top = `${(window.innerHeight - 150) / 2 + randomOffsetY + window.scrollY}px`;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "×";
  Object.assign(deleteButton.style, {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: "25px",
    zIndex: "1001",
  });
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    note.remove();
  });

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  Object.assign(colorPicker.style, {
    position: "absolute",
    bottom: "5px",
    left: "5px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    border: "none",
    background: "none",
    zIndex: "1001",
  });
  colorPicker.addEventListener("input", (e) => {
    note.style.backgroundColor = e.target.value;
  });

  const resizeHandle = document.createElement("div");
  resizeHandle.innerHTML = `
    <svg style="width:20px;height:20px" viewBox="0 0 24 24">
      <path fill="#666" d="M20,20H16V18H18V16H20M14,20H10V18H12V16H14M8,20H4V18H6V16H8M20,14H18V12H16V10H18V8H20M14,8H12V6H10V4H12V6H14V8Z" />
    </svg>
  `;
  Object.assign(resizeHandle.style, {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "20px",
    height: "20px",
    cursor: "nwse-resize",
    zIndex: "1001",
  });

  let isDragging = false;
  let dragStartX, dragStartY, initialLeft, initialTop;

  note.addEventListener("mousedown", (e) => {
    // فقط روی بدنه اصلی نوت درگ انجام شود
    if (e.target !== note && !e.target.closest('.note-content')) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialLeft = note.offsetLeft;
    initialTop = note.offsetTop;
    note.style.zIndex = 10000;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      note.style.left = `${initialLeft + deltaX}px`;
      note.style.top = `${initialTop + deltaY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    note.style.zIndex = 1000;
  });

  let isResizing = false;
  let resizeStartX, resizeStartY, initialWidth, initialHeight;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    initialWidth = note.offsetWidth;
    initialHeight = note.offsetHeight;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  });

  function resize(e) {
    if (isResizing) {
      const newWidth = initialWidth + (e.clientX - resizeStartX);
      const newHeight = initialHeight + (e.clientY - resizeStartY);
      note.style.width = `${Math.max(150, newWidth)}px`;
      note.style.height = `${Math.max(100, newHeight)}px`;
    }
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }
  note.appendChild(noteContent);
  note.appendChild(deleteButton);
  note.appendChild(colorPicker);
  note.appendChild(resizeHandle);
  document.body.appendChild(note);

}
