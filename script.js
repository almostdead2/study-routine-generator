function formatTimeRange(start, duration) {
  const [h, m] = start.split(':').map(Number);
  const startTime = new Date(0, 0, 0, h, m);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const format = t => t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${format(startTime)} - ${format(endTime)}`;
}

function generateTimeSlots(start, end, duration) {
  const slots = [];
  let current = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);

  while (current < endTime) {
    const range = formatTimeRange(current.toTimeString().slice(0,5), duration);
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
  headerRow.innerHTML = `<th>Day / Time</th>` + slots.map(slot => `<th>${slot}</th>`).join('');
  table.appendChild(headerRow);

  days.forEach(day => {
    const row = document.createElement("tr");
    row.innerHTML = `<th>${day}</th>` + slots.map(() => `<td contenteditable="true"></td>`).join('');
    table.appendChild(row);
  });

  container.appendChild(table);
}

function exportAsImage() {
  html2canvas(document.querySelector("table")).then(canvas => {
    const link = document.createElement("a");
    link.download = "study-routine.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

async function exportAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  const canvas = await html2canvas(document.querySelector("table"));
  const imgData = canvas.toDataURL("image/png");

  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  doc.save("study-routine.pdf");
}

async function exportAsDOCX() {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } = window.docx;

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
