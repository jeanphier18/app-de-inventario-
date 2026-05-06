// ============================================================
//  TeleRed Inventory Management System — Business Logic
//  app-telered.js
// ============================================================

const TeleRed = (() => {
  const STORAGE_KEY = 'telered_inventory';

  // ── Seed Data ────────────────────────────────────────────
  const SEED = [
    { id: 'TR-001', name: 'Router WiFi 6 AX3000',      category: 'Redes',        stock: 42,  price: 189.99, image: null },
    { id: 'TR-002', name: 'Switch 24 Puertos PoE',      category: 'Redes',        stock: 15,  price: 349.00, image: null },
    { id: 'TR-003', name: 'Cable UTP Cat6 (305m)',       category: 'Cableado',     stock: 8,   price: 72.50,  image: null },
    { id: 'TR-004', name: 'Access Point Outdoor',        category: 'Redes',        stock: 23,  price: 215.00, image: null },
    { id: 'TR-005', name: 'Patch Panel 48p',             category: 'Cableado',     stock: 5,   price: 98.75,  image: null },
    { id: 'TR-006', name: 'Firewall UTM Enterprise',     category: 'Seguridad',    stock: 3,   price: 1250.00, image: null },
    { id: 'TR-007', name: 'Cámara IP PTZ 4K',            category: 'Seguridad',    stock: 18,  price: 320.00, image: null },
    { id: 'TR-008', name: 'Rack 42U 600x1000',           category: 'Infraestructura', stock: 7, price: 540.00, image: null },
    { id: 'TR-009', name: 'UPS 1500VA LCD',              category: 'Infraestructura', stock: 11, price: 165.00, image: null },
    { id: 'TR-010', name: 'Transceptor SFP+ 10G',        category: 'Redes',        stock: 60,  price: 28.50,  image: null },
  ];

  // ── Storage helpers ──────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // ── State ────────────────────────────────────────────────
  let inventory = load() || [...SEED];
  let editingId = null;
  let searchTerm = '';
  let sortKey = 'id';
  let sortDir = 1;

  // ── ID generator ─────────────────────────────────────────
  function nextId() {
    const nums = inventory
      .map(p => parseInt(p.id.replace('TR-', ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return `TR-${String(max + 1).padStart(3, '0')}`;
  }

  // ── CRUD ─────────────────────────────────────────────────
  function getAll() {
    return [...inventory];
  }

  function getById(id) {
    return inventory.find(p => p.id === id) || null;
  }

  function create(data) {
    const product = {
      id:       data.id?.trim() || nextId(),
      name:     data.name.trim(),
      category: data.category.trim(),
      stock:    parseInt(data.stock, 10),
      price:    parseFloat(data.price),
      image:    data.image || null,
    };
    if (!product.name || isNaN(product.stock) || isNaN(product.price)) {
      throw new Error('Datos de producto inválidos.');
    }
    if (inventory.some(p => p.id === product.id)) {
      throw new Error(`El ID/SKU "${product.id}" ya existe.`);
    }
    inventory.push(product);
    save(inventory);
    return product;
  }

  function update(id, data) {
    const idx = inventory.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Producto no encontrado.');
    inventory[idx] = {
      ...inventory[idx],
      name:     data.name.trim(),
      category: data.category.trim(),
      stock:    parseInt(data.stock, 10),
      price:    parseFloat(data.price),
      image:    data.image !== undefined ? data.image : inventory[idx].image,
    };
    save(inventory);
    return inventory[idx];
  }

  function remove(id) {
    inventory = inventory.filter(p => p.id !== id);
    save(inventory);
  }

  // ── Search & Sort ─────────────────────────────────────────
  function setSearch(term) { searchTerm = term.toLowerCase(); render(); }

  function setSort(key) {
    if (sortKey === key) sortDir *= -1;
    else { sortKey = key; sortDir = 1; }
    render();
  }

  function filtered() {
    return inventory
      .filter(p =>
        !searchTerm ||
        p.id.toLowerCase().includes(searchTerm) ||
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      });
  }

  // ── Stats ─────────────────────────────────────────────────
  function stats() {
    const total = inventory.length;
    const lowStock = inventory.filter(p => p.stock <= 5).length;
    const value = inventory.reduce((s, p) => s + p.stock * p.price, 0);
    const cats = new Set(inventory.map(p => p.category)).size;
    return { total, lowStock, value, cats };
  }

  // ── Export ────────────────────────────────────────────────
  function exportJSON() {
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telered_inventory_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── DOM helpers ──────────────────────────────────────────
  const $ = id => document.getElementById(id);

  function fmt(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(n);
  }

  function stockBadge(n) {
    if (n === 0)  return `<span class="badge badge-out">Sin Stock</span>`;
    if (n <= 5)   return `<span class="badge badge-low">${n}</span>`;
    return `<span class="badge badge-ok">${n}</span>`;
  }

  function catBadge(cat) {
    const colors = {
      'Redes':           'cat-redes',
      'Cableado':        'cat-cable',
      'Seguridad':       'cat-sec',
      'Infraestructura': 'cat-infra',
    };
    return `<span class="cat-badge ${colors[cat] || 'cat-other'}">${cat}</span>`;
  }

  function sortIcon(key) {
    if (sortKey !== key) return '<span class="sort-icon">↕</span>';
    return `<span class="sort-icon active">${sortDir === 1 ? '↑' : '↓'}</span>`;
  }

  // ── Render stats ─────────────────────────────────────────
  function renderStats() {
    const s = stats();
    $('stat-total').textContent  = s.total;
    $('stat-low').textContent    = s.lowStock;
    $('stat-value').textContent  = fmt(s.value);
    $('stat-cats').textContent   = s.cats;
  }

  // ── Render table ──────────────────────────────────────────
  function renderTable() {
    const rows = filtered();
    const tbody = $('tbody');
    const empty = $('empty-state');

    if (!rows.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    tbody.innerHTML = rows.map(p => `
      <tr class="table-row" data-id="${p.id}">
        <td class="td-img">${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-thumb" />` : '<span class="no-image">Sin imagen</span>'}</td>
        <td class="td-sku">${p.id}</td>
        <td class="td-name">${p.name}</td>
        <td>${catBadge(p.category)}</td>
        <td>${stockBadge(p.stock)}</td>
        <td class="td-price">${fmt(p.price)}</td>
        <td class="td-actions">
          <button class="btn-edit" onclick="TeleRed.startEdit('${p.id}')">✏ Editar</button>
          <button class="btn-del"  onclick="TeleRed.confirmDelete('${p.id}', '${p.name.replace(/'/g,"\\'")}')">✕ Borrar</button>
        </td>
      </tr>`).join('');

    // Update sort headers
    document.querySelectorAll('[data-sort]').forEach(th => {
      const k = th.dataset.sort;
      th.querySelector('.sort-icon').outerHTML = sortIcon(k);
      th.innerHTML = th.innerHTML; // force refresh trick doesn't work; use proper update
    });
  }

  function updateSortHeaders() {
    document.querySelectorAll('[data-sort]').forEach(th => {
      const k = th.dataset.sort;
      const icon = th.querySelector('.si');
      if (!icon) return;
      icon.textContent = sortKey === k ? (sortDir === 1 ? ' ↑' : ' ↓') : ' ↕';
      icon.classList.toggle('active', sortKey === k);
    });
  }

  // ── Render (main) ─────────────────────────────────────────
  function render() {
    renderStats();
    renderTable();
    updateSortHeaders();
  }

  // ── Modal helpers ─────────────────────────────────────────
  function openModal(title, product = null) {
    $('modal-title').textContent = title;
    $('field-id').value       = product?.id       || '';
    $('field-name').value     = product?.name     || '';
    $('field-cat').value      = product?.category || 'Redes';
    $('field-stock').value    = product?.stock    ?? '';
    $('field-price').value    = product?.price    ?? '';
    $('field-id').disabled    = !!product;
    $('field-image').value    = '';
    $('image-preview').innerHTML = product?.image ? `<img src="${product.image}" alt="Vista previa" />` : '<span class="preview-placeholder">Sin imagen seleccionada</span>';
    $('modal-error').textContent = '';
    $('modal-overlay').classList.remove('hidden');
    setTimeout(() => $('modal-overlay').classList.add('show'), 10);
    ($('field-id').disabled ? $('field-name') : $('field-id')).focus();
  }

  function closeModal() {
    $('modal-overlay').classList.remove('show');
    setTimeout(() => $('modal-overlay').classList.add('hidden'), 250);
    editingId = null;
  }

  // ── Public API ────────────────────────────────────────────
  function startCreate() { editingId = null; openModal('Nuevo Producto'); }

  function startEdit(id) {
    const p = getById(id);
    if (!p) return;
    editingId = id;
    openModal('Editar Producto', p);
  }

  function confirmDelete(id, name) {
    $('confirm-msg').textContent = `¿Eliminar "${name}"? Esta acción no se puede deshacer.`;
    $('confirm-overlay').dataset.id = id;
    $('confirm-overlay').classList.remove('hidden');
    setTimeout(() => $('confirm-overlay').classList.add('show'), 10);
  }

  function closeConfirm() {
    $('confirm-overlay').classList.remove('show');
    setTimeout(() => $('confirm-overlay').classList.add('hidden'), 250);
  }

  function handleSave() {
    const imageFile = $('field-image').files[0];
    const reader = new FileReader();
    
    const saveProduct = (imageData) => {
      const data = {
        id:       $('field-id').value,
        name:     $('field-name').value,
        category: $('field-cat').value,
        stock:    $('field-stock').value,
        price:    $('field-price').value,
        image:    imageData || (editingId ? undefined : null),
      };
      try {
        if (editingId) update(editingId, data);
        else           create(data);
        closeModal();
        render();
        showToast(editingId ? 'Producto actualizado ✓' : 'Producto creado ✓');
      } catch (e) {
        $('modal-error').textContent = e.message;
      }
    };
    
    if (imageFile) {
      reader.onload = (e) => saveProduct(e.target.result);
      reader.readAsDataURL(imageFile);
    } else {
      saveProduct(null);
    }
  }

  function handleDelete() {
    const id = $('confirm-overlay').dataset.id;
    remove(id);
    closeConfirm();
    render();
    showToast('Producto eliminado');
  }

  function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    // Search
    $('search').addEventListener('input', e => setSearch(e.target.value));

    // Sort headers
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => { setSort(th.dataset.sort); });
    });
    
    // Image preview
    $('field-image').addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          $('image-preview').innerHTML = `<img src="${event.target.result}" alt="Vista previa" />`;
        };
        reader.readAsDataURL(file);
      }
    });

    // Buttons
    $('btn-new').addEventListener('click', startCreate);
    $('btn-export').addEventListener('click', exportJSON);
    $('btn-save').addEventListener('click', handleSave);
    $('btn-cancel').addEventListener('click', closeModal);
    $('btn-confirm-del').addEventListener('click', handleDelete);
    $('btn-cancel-del').addEventListener('click', closeConfirm);

    // Close modal on backdrop click
    $('modal-overlay').addEventListener('click', e => { if (e.target === $('modal-overlay')) closeModal(); });
    $('confirm-overlay').addEventListener('click', e => { if (e.target === $('confirm-overlay')) closeConfirm(); });

    // Enter key in modal
    $('modal-overlay').addEventListener('keydown', e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') closeModal(); });

    render();
  }

  return { init, startCreate, startEdit, confirmDelete, exportJSON, getAll, setSearch, setSort };
})();

document.addEventListener('DOMContentLoaded', TeleRed.init);
