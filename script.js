// ... (Keep all your existing code unchanged above this)

function createImageControls(td) {
  const wrapper = document.createElement("div");
  wrapper.className = "image-controls";
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.zIndex = "1"; // ensures buttons show above image

  const img = document.createElement("img");
  img.style.maxWidth = "100px";
  img.style.maxHeight = "100px";
  img.style.display = "block";
  img.style.margin = "5px auto";
  img.style.position = "relative";
  img.style.zIndex = "0";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "block";
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const directions = ["↑", "↓", "←", "→"];
  directions.forEach(dir => {
    const btn = document.createElement("button");
    btn.textContent = dir;
    btn.className = "no-export";
    btn.style.fontSize = "10px";
    btn.style.margin = "1px";
    btn.style.padding = "2px 5px";
    btn.addEventListener("click", () => {
      const step = 5;
      const top = parseInt(img.style.top || "0");
      const left = parseInt(img.style.left || "0");
      if (dir === "↑") img.style.top = (top - step) + "px";
      if (dir === "↓") img.style.top = (top + step) + "px";
      if (dir === "←") img.style.left = (left - step) + "px";
      if (dir === "→") img.style.left = (left + step) + "px";
      img.style.position = "relative";
    });
    wrapper.appendChild(btn);
  });

  const resizeSlider = document.createElement("input");
  resizeSlider.type = "range";
  resizeSlider.min = "10";
  resizeSlider.max = "200";
  resizeSlider.value = "100";
  resizeSlider.className = "no-export";
  resizeSlider.style.width = "100%";
  resizeSlider.addEventListener("input", () => {
    const scale = resizeSlider.value / 100;
    img.style.width = `${scale * 100}%`;
    img.style.height = "auto";
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.className = "no-export";
  deleteBtn.style.fontSize = "12px";
  deleteBtn.style.margin = "2px";
  deleteBtn.addEventListener("click", () => {
    img.remove();
    wrapper.remove();
  });

  wrapper.appendChild(fileInput);
  wrapper.appendChild(img);
  wrapper.appendChild(resizeSlider);
  wrapper.appendChild(deleteBtn);

  td.appendChild(wrapper);
}

function makeCellEditable(td) {
  td.contentEditable = true;
  td.addEventListener("click", () => {
    highlightCell(td);
    if (!td.querySelector(".image-controls")) {
      createImageControls(td);
    }
  });
}

function generateRoutine() {
  const container = document.getElementById("routineContainer");
  container.innerHTML = "";

  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const duration = parseInt(document.getElementById("slotDuration").value);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = generateTimeSlots(startTime, endTime, duration);

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  const dayHeader = document.createElement("th");
  dayHeader.contentEditable = true;
  dayHeader.innerText = "Day / Time";
  headerRow.appendChild(dayHeader);

  slots.forEach(slot => {
    const th = document.createElement("th");
    th.contentEditable = true;
    th.innerText = slot;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  days.forEach(day => {
    const row = document.createElement("tr");

    const dayCell = document.createElement("th");
    dayCell.contentEditable = true;
    dayCell.innerText = day;
    row.appendChild(dayCell);

    slots.forEach(() => {
      const td = document.createElement("td");
      makeCellEditable(td);
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

// Also replace inside `addRow` and `addColumn`
function addRow() {
  const table = document.querySelector("table");
  if (!table) return;
  const row = document.createElement("tr");

  const th = document.createElement("th");
  th.contentEditable = true;
  th.innerText = "New Day";
  row.appendChild(th);

  const columnCount = table.rows[0].cells.length - 1;
  for (let i = 0; i < columnCount; i++) {
    const td = document.createElement("td");
    makeCellEditable(td);
    row.appendChild(td);
  }

  table.appendChild(row);
}

function addColumn() {
  const table = document.querySelector("table");
  if (!table) return;

  const headerCell = document.createElement("th");
  headerCell.contentEditable = true;
  headerCell.innerText = "New Time";
  table.rows[0].appendChild(headerCell);

  for (let i = 1; i < table.rows.length; i++) {
    const td = document.createElement("td");
    makeCellEditable(td);
    table.rows[i].appendChild(td);
  }
}
