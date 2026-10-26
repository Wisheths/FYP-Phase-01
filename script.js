// INITIAL DATA SEEDING (Sistem Pengurusan Peralatan Makmal SKR 2)
let equipmentData = JSON.parse(localStorage.getItem('skr2_equipment')) || [
  { id: 'PC-SKR2-001', model: 'Dell OptiPlex', serial: 'DL-10024', location: 'Meja 01', condition: 'Baik', status: 'Aktif' },
  { id: 'PC-SKR2-002', model: 'HP ProDesk', serial: 'HP-20481', location: 'Meja 02', condition: 'Perlu diperiksa', status: 'Perlu perhatian' },
  { id: 'PC-SKR2-003', model: 'Lenovo ThinkCentre', serial: 'LN-30912', location: 'Meja 03', condition: 'Baik', status: 'Aktif' },
  { id: 'PC-SKR2-004', model: 'Dell OptiPlex', serial: 'DL-10031', location: 'Meja 04', condition: 'Rosak', status: 'Penyelenggaraan' }
];

let maintenanceData = JSON.parse(localStorage.getItem('skr2_maintenance')) || [
  { id: 'LOG-001', pcId: 'PC-SKR2-002', type: 'Pemeriksaan Rutin', date: '2026-10-15', notes: 'Kipas sistem berbunyi bising dan suhu cip tinggi.', status: 'Dalam Proses' },
  { id: 'LOG-002', pcId: 'PC-SKR2-004', type: 'Pembaikan (Corrective)', date: '2026-10-20', notes: 'Gagal boot. Disyaki kerosakan Power Supply Unit (PSU).', status: 'Belum Selesai' }
];

let currentUserRole = 'Pentadbir';

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  saveToLocalStorage();
  
  // Restore sidebar state
  if (localStorage.getItem('skr2_sidebar_collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }

  changeUserRole('Pentadbir');
  renderAllTables();
  populateDropdowns();
  runPredictionAnalysis();
});

// SIDEBAR COLLAPSE TOGGLE (GEMINI-INSPIRED)
function toggleSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
  const isCollapsed = document.body.classList.contains('sidebar-collapsed');
  localStorage.setItem('skr2_sidebar_collapsed', isCollapsed);
}

function saveToLocalStorage() {
  localStorage.setItem('skr2_equipment', JSON.stringify(equipmentData));
  localStorage.setItem('skr2_maintenance', JSON.stringify(maintenanceData));
}

// DFD 1.0: USER ROLE MANAGEMENT
function changeUserRole(role) {
  currentUserRole = role;
  document.body.setAttribute('data-role', role);
  
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');

  if (role === 'Pentadbir') {
    avatar.textContent = 'A';
    name.textContent = 'Admin';
  } else if (role === 'Juruteknik') {
    avatar.textContent = 'J';
    name.textContent = 'Juruteknik';
  } else if (role === 'Penyelia') {
    avatar.textContent = 'P';
    name.textContent = 'Penyelia';
  }

  renderAllTables();
}

// NAVIGATION SWITCHER
function showSection(sectionId, element) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active-section'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  const sectionEl = document.getElementById(sectionId);
  if (sectionEl) sectionEl.classList.add('active-section');
  if (element) element.classList.add('active');

  const titles = {
    'dashboard': ['Papan Pemuka', 'Ringkasan keadaan komputer di Makmal SKR 2.'],
    'peralatan': ['Pengurusan Peralatan', 'Senarai pendaftaran komputer dan perkakasan Makmal SKR 2.'],
    'penyelenggaraan': ['Pengurusan Penyelenggaraan', 'Rekod sejarah kerosakan dan tindakan pembaikan teknikal.'],
    'modul-ramalan': ['Modul Ramalan Penyelenggaraan', 'Sistem ramalan berasaskan peraturan (Rule-Based Engine) untuk penyelenggaraan.'],
    'laporan': ['Penjanaan Laporan', 'Laporan statistik dan rumusan status makmal untuk pentadbiran.']
  };

  if (titles[sectionId]) {
    document.getElementById('pageTitle').textContent = titles[sectionId][0];
    document.getElementById('pageSubtitle').textContent = titles[sectionId][1];
  }
}

// RENDER ALL TABLES & STATS
function renderAllTables() {
  updateDashboardStats();
  renderDashboardTable();
  renderEquipmentTable();
  renderMaintenanceTable();
  renderReportSection();
}

// DASHBOARD STATS
function updateDashboardStats() {
  const total = equipmentData.length;
  const baik = equipmentData.filter(e => e.condition === 'Baik').length;
  const perhatian = equipmentData.filter(e => e.condition === 'Perlu diperiksa').length;
  const rosak = equipmentData.filter(e => e.condition === 'Rosak').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statBaik').textContent = baik;
  document.getElementById('statPerhatian').textContent = perhatian;
  document.getElementById('statRosak').textContent = rosak;

  // Maintenance alert banner
  const pending = equipmentData.find(e => e.status === 'Perlu perhatian' || e.status === 'Penyelenggaraan');
  if (pending) {
    document.getElementById('maintenanceAlertText').textContent = `${pending.id} (${pending.model}) — Memerlukan pemeriksaan teknikal segera.`;
    document.getElementById('maintenanceAlertBadge').textContent = pending.status;
  } else {
    document.getElementById('maintenanceAlertText').textContent = 'Semua peralatan makmal berada dalam keadaan memuaskan.';
    document.getElementById('maintenanceAlertBadge').textContent = 'Status Baik';
  }
}

function getBadgeClass(status) {
  if (status === 'Aktif' || status === 'Baik') return 'available';
  if (status === 'Perlu perhatian' || status === 'Perlu diperiksa') return 'attention';
  return 'repair';
}

// RENDER DASHBOARD TABLE
function renderDashboardTable() {
  const tbody = document.getElementById('dashboardTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  equipmentData.slice(0, 5).forEach(eq => {
    tbody.innerHTML += `
      <tr>
        <td>${eq.id}</td>
        <td>${eq.model}</td>
        <td>${eq.serial}</td>
        <td>${eq.condition}</td>
        <td><span class="badge ${getBadgeClass(eq.status)}">${eq.status}</span></td>
      </tr>
    `;
  });
}

// DFD 2.0: EQUIPMENT MANAGEMENT (PERALATAN)
function renderEquipmentTable() {
  const tbody = document.getElementById('equipmentTableBody');
  if (!tbody) return;
  const searchEl = document.getElementById('searchEquipment');
  const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
  tbody.innerHTML = '';

  equipmentData.filter(eq => 
    eq.id.toLowerCase().includes(searchTerm) ||
    eq.model.toLowerCase().includes(searchTerm) ||
    eq.serial.toLowerCase().includes(searchTerm)
  ).forEach((eq, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${eq.id}</td>
        <td>${eq.model}</td>
        <td>${eq.serial}</td>
        <td>${eq.location}</td>
        <td>${eq.condition}</td>
        <td><span class="badge ${getBadgeClass(eq.status)}">${eq.status}</span></td>
        <td class="admin-only">
          <button class="button-link" onclick="editEquipment(${index})">Edit</button> | 
          <button class="button-link button-danger" onclick="deleteEquipment(${index})">Hapus</button>
        </td>
      </tr>
    `;
  });
}

// MODAL CONTROLS (EQUIPMENT)
function openAddModal() {
  document.getElementById('modalEquipmentTitle').textContent = 'Tambah Peralatan Baru';
  document.getElementById('equipmentForm').reset();
  document.getElementById('eqIndex').value = "-1";
  document.getElementById('equipmentModal').showModal();
}

function closeAddModal() {
  document.getElementById('equipmentModal').close();
}

function editEquipment(index) {
  const eq = equipmentData[index];
  document.getElementById('modalEquipmentTitle').textContent = 'Kemaskini Peralatan';
  document.getElementById('eqIndex').value = index;
  document.getElementById('eqId').value = eq.id;
  document.getElementById('eqModel').value = eq.model;
  document.getElementById('eqSerial').value = eq.serial;
  document.getElementById('eqLocation').value = eq.location;
  document.getElementById('eqCondition').value = eq.condition;
  document.getElementById('eqStatus').value = eq.status;
  document.getElementById('equipmentModal').showModal();
}

function saveEquipment(event) {
  event.preventDefault();
  const index = parseInt(document.getElementById('eqIndex').value);
  const newEq = {
    id: document.getElementById('eqId').value,
    model: document.getElementById('eqModel').value,
    serial: document.getElementById('eqSerial').value,
    location: document.getElementById('eqLocation').value,
    condition: document.getElementById('eqCondition').value,
    status: document.getElementById('eqStatus').value
  };

  if (index === -1) {
    equipmentData.push(newEq);
  } else {
    equipmentData[index] = newEq;
  }

  saveToLocalStorage();
  renderAllTables();
  populateDropdowns();
  closeAddModal();
}

function deleteEquipment(index) {
  if (confirm('Adakah anda pasti untuk menghapuskan rekod peralatan ini?')) {
    equipmentData.splice(index, 1);
    saveToLocalStorage();
    renderAllTables();
    populateDropdowns();
  }
}

// DFD 3.0: MAINTENANCE MANAGEMENT
function renderMaintenanceTable() {
  const tbody = document.getElementById('maintenanceTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  maintenanceData.forEach(m => {
    tbody.innerHTML += `
      <tr>
        <td>${m.id}</td>
        <td>${m.pcId}</td>
        <td>${m.type}</td>
        <td>${m.date}</td>
        <td>${m.notes}</td>
        <td><span class="badge ${m.status === 'Selesai' ? 'available' : 'repair'}">${m.status}</span></td>
      </tr>
    `;
  });
}

function openMaintenanceModal() {
  document.getElementById('maintenanceForm').reset();
  document.getElementById('maintDate').valueAsDate = new Date();
  document.getElementById('maintenanceModal').showModal();
}

function closeMaintenanceModal() {
  document.getElementById('maintenanceModal').close();
}

function saveMaintenance(event) {
  event.preventDefault();
  const newLog = {
    id: 'LOG-' + String(maintenanceData.length + 1).padStart(3, '0'),
    pcId: document.getElementById('maintPcId').value,
    type: document.getElementById('maintType').value,
    date: document.getElementById('maintDate').value,
    notes: document.getElementById('maintNotes').value,
    status: document.getElementById('maintStatus').value
  };

  maintenanceData.unshift(newLog);

  // Sync back status to equipment if necessary
  const pc = equipmentData.find(e => e.id === newLog.pcId);
  if (pc && newLog.status !== 'Selesai') {
    pc.status = 'Penyelenggaraan';
    pc.condition = 'Rosak';
  } else if (pc && newLog.status === 'Selesai') {
    pc.status = 'Aktif';
    pc.condition = 'Baik';
  }

  saveToLocalStorage();
  renderAllTables();
  closeMaintenanceModal();
}

// POPULATE DROPDOWNS
function populateDropdowns() {
  const predictSelect = document.getElementById('selectPcPrediction');
  const maintSelect = document.getElementById('maintPcId');

  if (predictSelect) predictSelect.innerHTML = '';
  if (maintSelect) maintSelect.innerHTML = '';

  equipmentData.forEach(eq => {
    if (predictSelect) predictSelect.innerHTML += `<option value="${eq.id}">${eq.id} (${eq.model})</option>`;
    if (maintSelect) maintSelect.innerHTML += `<option value="${eq.id}">${eq.id} (${eq.model})</option>`;
  });
}

// DFD 4.0: RULE-BASED PREDICTION ENGINE (Ramalan Berasaskan Peraturan)
function runPredictionAnalysis() {
  const selectEl = document.getElementById('selectPcPrediction');
  if (!selectEl) return;
  
  const selectedId = selectEl.value;
  if (!selectedId) return;

  const pc = equipmentData.find(e => e.id === selectedId);
  if (!pc) return;

  const pcLogs = maintenanceData.filter(m => m.pcId === selectedId);

  document.getElementById('rulePcId').textContent = pc.id;

  // Base score
  let riskScore = 15; 
  let recommendations = [];

  // Rule 1: Hardware Condition Check
  if (pc.condition === 'Rosak') riskScore += 50;
  else if (pc.condition === 'Perlu diperiksa') riskScore += 30;

  // Rule 2: Maintenance History Frequency
  riskScore += (pcLogs.length * 15);

  if (riskScore > 100) riskScore = 95;

  // UI Element Updates
  const badge = document.getElementById('ruleRiskBadge');
  const scoreEl = document.getElementById('ruleRiskScore');
  const scheduleEl = document.getElementById('ruleNextSchedule');
  const listEl = document.getElementById('ruleActionList');

  scoreEl.textContent = `${riskScore}%`;

  // Rule-based Decision Thresholds
  if (riskScore >= 60) {
    badge.textContent = 'Risiko Tinggi';
    badge.className = 'badge repair';
    scheduleEl.textContent = 'Serta-Merta (Dalam 24 jam)';
    recommendations = [
      'Lakukan ujian diagnostik memori RAM & Sektor Hard Disk/SSD.',
      'Periksa unit bekalan kuasa (PSU) dan kestabilan voltan.',
      'Gantikan sebarang komponen perkakasan yang rosak secara fizikal.'
    ];
  } else if (riskScore >= 35) {
    badge.textContent = 'Risiko Sederhana';
    badge.className = 'badge attention';
    scheduleEl.textContent = 'Dalam 7 Hari';
    recommendations = [
      'Pembersihan habuk dalaman kes komputer & kipas pendingin.',
      'Kemaskini pemacu (drivers) dan imbasan keselamatan perisian.',
      'Sapu semula cecair pemindah haba (thermal paste) pada pemproses (CPU).'
    ];
  } else {
    badge.textContent = 'Risiko Rendah';
    badge.className = 'badge available';
    scheduleEl.textContent = '30 Hari Akan Datang';
    recommendations = [
      'Komputer berada dalam keadaan optimum.',
      'Jalankan pembersihan fail sementara (temp files) dan kemaskini OS rutin.'
    ];
  }

  listEl.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
}

// DFD 5.0: REPORT GENERATION (LAPORAN)
function renderReportSection() {
  const total = equipmentData.length;
  const good = equipmentData.filter(e => e.condition === 'Baik').length;
  const maint = equipmentData.filter(e => e.condition !== 'Baik').length;

  const repTotal = document.getElementById('repTotal');
  const repGood = document.getElementById('repGood');
  const repMaintenance = document.getElementById('repMaintenance');
  const repLogsCount = document.getElementById('repLogsCount');

  if (repTotal) repTotal.textContent = total;
  if (repGood) repGood.textContent = good;
  if (repMaintenance) repMaintenance.textContent = maint;
  if (repLogsCount) repLogsCount.textContent = maintenanceData.length;

  const healthPercentage = total > 0 ? Math.round((good / total) * 100) : 0;
  const healthEl = document.getElementById('reportHealthText');
  if (healthEl) {
    healthEl.textContent = 
      `Makmal SKR 2 mencatatkan indeks kesihatan peralatan sebanyak ${healthPercentage}%. Pihak juruteknik telah merekodkan ${maintenanceData.length} tindakan penyelenggaraan secara keseluruhan.`;
  }
}
