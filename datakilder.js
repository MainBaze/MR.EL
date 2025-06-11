const datasets = [
  {
    title: "DO1-DO2-DO3 sikringskurve",
    kilde: "datakilder/data/do1-do2-do3-sikringskurve/KILDE-BILLEDE-DO1-DO2-DO3-SIKRINGSKURVE-IKMIN.png"
  },
  {
    title: "Gummi kabel",
    kilde: "datakilder/data/gummi-kabel/BILLEDE-XTREM-H07RN-F-450-750-V.png",
    table: "datakilder/data/gummi-kabel/JSON-XTREM-H07RN-F-450-750-V.json"
  },
  {
    title: "K-værdi",
    kilde: "datakilder/data/k-værdi/KILDE-BILLEDE-43A-K-VÆRDI.png",
    table: "datakilder/data/k-værdi/JSON-43A-K-VÆRDI.json"
  },
  {
    title: "Kontaktor AC1 ohmsk",
    kilde: "datakilder/data/kontaktor-ac1-ohmsk/KONTAKTOR-AC1-OHMSK.png"
  },
  {
    title: "Korrektionsfaktor samlet fremføring",
    kilde: "datakilder/data/korrektionsfaktor-samlet-fremføring/KILDE-BILLEDE-B.52.17-SAMLET-FREMFØRING.png",
    table: "datakilder/data/korrektionsfaktor-samlet-fremføring/JSON-B.52.17-KORREKTIONSFAKTOR-SAMLET-FREMFØRING.json"
  },
  {
    title: "Korrektionsfaktor temperatur",
    kilde: "datakilder/data/korrektionsfaktor-temperatur/KILDE-BILLEDE-B.52.14-KORREKTIONSFAKTOR-TEMPERATUR.png",
    table: "datakilder/data/korrektionsfaktor-temperatur/JSON-B.52.14-KORREKTIONSFAKTOR-TEMPERATUR.json"
  },
  {
    title: "Oplæg",
    kilde: "datakilder/data/oplæg/KILDE-BILLEDE-OPLÆG.png",
    note: "Test"
  },
  {
    title: "Sikkerheds CEE gruppe-afbrydere",
    kilde: "datakilder/data/sikkerheds-cee-gruppe-afbrydere/KILDE-BILLEDE-SIKKERDS-CEE-GRUPPE-AFBRYDERE.png"
  },
  {
    title: "Smeltesikringer oversigt",
    kilde: "datakilder/data/smeltesikringer-oversigt/KILDE-BILLEDE-SMELTESIKRINGER-OVERSIGT.png"
  },
  {
    title: "Thermorelæ og kontaktor motor",
    kilde: "datakilder/data/thermorelæ-og-kontaktor-motor/KILDE-BILLEDE-CI6-CI50-DANFOSS.png"
  },
  {
    title: "XLPE kabel",
    kilde: "datakilder/data/xlpe-kabel/KILDE-BILLEDE-XLPE-B52.3-B52.5-B52.12.png",
    table: "datakilder/data/xlpe-kabel/JSON-XLPE-90-B52.3-B52.5-COPPER-ALUMINIUM.json"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('dataList');
  datasets.forEach(ds => {
    const li = document.createElement('li');

    const title = document.createElement('span');
    title.textContent = ds.title;
    title.className = 'data-title';
    li.appendChild(title);

    const kilde = document.createElement('span');
    kilde.textContent = 'Kilde';
    kilde.className = 'popupToggle data-link';
    kilde.dataset.image = ds.kilde;
    li.appendChild(kilde);

    if (ds.note) {
      const note = document.createElement('span');
      note.textContent = 'Note';
      note.className = 'data-link note';
      note.title = ds.note;
      li.appendChild(note);
    }

    if (ds.table) {
      const tableLink = document.createElement('span');
      tableLink.textContent = 'Tabel';
      tableLink.className = 'tableToggle data-link';
      tableLink.dataset.json = ds.table;
      li.appendChild(tableLink);
    }

    list.appendChild(li);
  });
});

  const popupContainer = document.getElementById('popupContainer');
  const popupImage = document.getElementById('popupImage');

  list.addEventListener('click', e => {
    const tgt = e.target;
    if (tgt.classList.contains('popupToggle') && tgt.dataset.image) {
      popupImage.src = tgt.dataset.image;
      popupContainer.classList.remove('popup-hidden');
      popupContainer.style.display = 'flex';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      popupContainer.classList.add('popup-hidden');
      popupContainer.style.display = 'none';
    }
  });

  popupContainer.addEventListener('click', () => {
    popupContainer.classList.add('popup-hidden');
    popupContainer.style.display = 'none';
  });

  popupImage.addEventListener('click', e => e.stopPropagation());


function buildTableHTML(data) {
  if (!data.length) return '<table></table>';
  const headers = Object.keys(data[0]);
  let html = '<table><thead><tr>';
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      html += `<td>${row[h] ?? ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

document.addEventListener('click', e => {
  const tgt = e.target;
  if (tgt.classList.contains('tableToggle')) {
    openTableWindow(tgt.dataset.json);
  }
});

function openTableWindow(jsonFile) {
  fetch(jsonFile)
    .then(r => r.json())
    .then(data => {
      const tableHTML = buildTableHTML(data);
      const win = window.open('', '', 'width=800,height=600');
      win.document.write(`<!DOCTYPE html><html lang="da"><head><meta charset="UTF-8"><title>Tabel</title><style>body{font-family:sans-serif;margin:1rem;}#closeBtn{position:fixed;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;cursor:pointer;}table{border-collapse:collapse;width:100%;table-layout:fixed;}th,td{border-right:1px solid #ccc;padding:0.25rem 0.5rem;min-width:80px;}th:first-child,td:first-child{border-left:1px solid #ccc;}tr:not(:last-child) td{border-bottom:1px solid #ccc;}</style></head><body><button id="closeBtn">×</button>${tableHTML}<script>document.getElementById('closeBtn').addEventListener('click',()=>window.close());document.addEventListener('keydown',e=>{if(e.key==='Escape')window.close();});</script></body></html>`);
      win.document.close();
      win.addEventListener('blur', () => { if (!win.closed) win.close(); });
    });
}