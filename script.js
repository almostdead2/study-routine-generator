function formatTimeRange(start, duration) {
  const [h, m] = start.split(':').map(Number);
  const startTime = new Date(0, 0, 0, h, m);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const format = t =>
    t.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(/am/i, 'AM').replace(/pm/i, 'PM');

  return `${format(startTime)} - ${format(endTime)}`;
}

function generateTimeSlots(start, end, duration) {
  const slots = [];
  let current = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);

  while (current < endTime) {
    const range = formatTimeRange(current.toTimeString().slice(0, 5), duration);
    slots.push(range);
    current = new Date(current.getTime() + duration * 60000);
  }

  return slots;
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
      td.contentEditable = true;
      td.addEventListener("click", () => highlightCell(td));
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

// Highlight cell
function highlightCell(td) {
  td.classList.toggle("highlight");
}

// Add/Remove functionality
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
    td.contentEditable = true;
    td.addEventListener("click", () => highlightCell(td));
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
    td.contentEditable = true;
    td.addEventListener("click", () => highlightCell(td));
    table.rows[i].appendChild(td);
  }
}

function removeRow() {
  const table = document.querySelector("table");
  if (!table || table.rows.length <= 2) return;
  table.deleteRow(-1);
}

function removeColumn() {
  const table = document.querySelector("table");
  if (!table || table.rows[0].cells.length <= 2) return;

  for (let i = 0; i < table.rows.length; i++) {
    table.rows[i].deleteCell(-1);
  }
}

// Export functions
function exportAsImage(type = "png") {
  const scale = 8; // Ultra high quality
  html2canvas(document.querySelector("table"), {
    scale: scale,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = `study-routine.${type}`;
    link.href = canvas.toDataURL(`image/${type}`, 1.0);
    link.click();
  });
}

async function exportAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", compress: true });

  const canvas = await html2canvas(document.querySelector("table"), {
    scale: 9, // Good quality under 6MB
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95); // Smaller than PNG

  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  doc.save("study-routine.pdf");
}

async function exportAsDOCX() {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell } = window.docx;

  const tableEl = document.querySelector("table");
  const rows = Array.from(tableEl.rows).map(tr =>
    new TableRow({
      children: Array.from(tr.cells).map(td =>
        new TableCell({
          children: [new Paragraph(td.innerText.trim())],
        })
      )
    })
  );

  const doc = new Document({
    sections: [{
      children: [new Table({ rows })],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "study-routine.docx";
  link.click();
}
