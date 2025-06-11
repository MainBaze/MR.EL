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
    kilde: "datakilder/data/oplæg/KILDE-BILLEDE-OPLÆG.png"
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

function buildTable(data) {
  const table = document.createElement('table');
  if (!data.length) return table;
  const headers = Object.keys(data[0]);
  const thead = document.createElement('thead');
  const thr = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    thr.appendChild(th);
  });
  thead.appendChild(thr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h] ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

document.addEventListener('click', e => {
  const tgt = e.target;
  if (tgt.classList.contains('tableToggle')) {
    fetch(tgt.dataset.json)
      .then(r => r.json())
      .then(data => {
        const tablePopup = document.getElementById('tablePopup');
        const popupTable = document.getElementById('popupTable');
        popupTable.innerHTML = '';
        popupTable.appendChild(buildTable(data));
        tablePopup.classList.remove('popup-hidden');
        tablePopup.style.display = 'flex';
      });
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeTable();
});

document.getElementById('closeTablePopup')?.addEventListener('click', closeTable);
document.getElementById('tablePopup')?.addEventListener('click', e => {
  if (e.target.id === 'tablePopup') closeTable();
});

function closeTable() {
  const tp = document.getElementById('tablePopup');
  tp.classList.add('popup-hidden');
  tp.style.display = 'none';
}