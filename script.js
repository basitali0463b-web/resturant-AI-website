/* =========================================================
   Aheer's Kitchen - script.js (plain JavaScript, no libraries)
   Everything is saved in the browser's localStorage.

   1. Settings & default data     6. Orders (checkout, history)
   2. Storage helpers             7. Reservations
   3. Small utilities             8. Reviews & contact
   4. Menu                        9. Staff / admin panel
   5. Cart                       10. Events & start-up
   ========================================================= */
'use strict';

/* ---------- 1. Settings & default data ---------- */
const CONFIG = {
  taxRate: 0.05,            // 5% tax
  deliveryFee: 150,         // flat delivery fee (Rs.)
  adminPin: '1234',         // demo staff PIN (frontend only, NOT secure)
  openHour: 12,             // opens 12:00
  closeHour: 23.5,          // closes 23:30
  slotCapacity: 40,         // max guests per reservation hour
  coupons: {                // code -> discount rules
    WELCOME10: { pct: 0.10, min: 0 },
    FEAST15:   { pct: 0.15, min: 3000 }
  }
};

const CATEGORIES = ['Starters', 'BBQ', 'Mains', 'Breads', 'Fast Food', 'Desserts', 'Drinks'];
const ORDER_STATUS = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const RES_STATUS = ['Pending', 'Confirmed', 'Cancelled'];

const DEFAULT_MENU = [
  { id: 1,  name: 'Chicken Samosa (4 pcs)', cat: 'Starters',  price: 350,  emoji: '🥟', desc: 'Crispy pastry filled with spiced chicken and herbs.', popular: false },
  { id: 2,  name: 'Dahi Bhallay',           cat: 'Starters',  price: 400,  emoji: '🥣', desc: 'Soft lentil dumplings in chilled yogurt with tamarind chutney.', popular: false },
  { id: 3,  name: 'Crispy Fish Fingers',    cat: 'Starters',  price: 750,  emoji: '🐟', desc: 'Golden fried fish strips with tartar dip.', popular: false },
  { id: 4,  name: 'Chicken Malai Boti',     cat: 'BBQ',       price: 1250, emoji: '🍢', desc: 'Creamy marinated chicken grilled over charcoal.', popular: true },
  { id: 5,  name: 'Seekh Kabab (6 pcs)',    cat: 'BBQ',       price: 1100, emoji: '🍢', desc: 'Minced beef kababs with hand-ground spices.', popular: false },
  { id: 6,  name: 'Mutton Chops',           cat: 'BBQ',       price: 2200, emoji: '🥩', desc: 'Tender mutton chops marinated overnight.', popular: false },
  { id: 7,  name: 'Chapli Kabab (2 pcs)',   cat: 'BBQ',       price: 650,  emoji: '🍖', desc: 'Peshawari-style kababs, crisp outside and juicy inside.', popular: false },
  { id: 8,  name: 'Chicken Karahi (Half)',  cat: 'Mains',     price: 1900, emoji: '🍛', desc: 'Wok-cooked chicken with tomato, ginger and green chilli.', popular: true },
  { id: 9,  name: 'Mutton Biryani',         cat: 'Mains',     price: 1100, emoji: '🍚', desc: 'Fragrant basmati layered with tender mutton and saffron.', popular: true },
  { id: 10, name: 'Beef Nihari',            cat: 'Mains',     price: 1450, emoji: '🍲', desc: 'Slow-cooked overnight and served with fresh ginger.', popular: false },
  { id: 11, name: 'Butter Chicken',         cat: 'Mains',     price: 1600, emoji: '🍗', desc: 'Tandoori chicken in a rich buttery tomato gravy.', popular: false },
  { id: 12, name: 'Daal Makhni',            cat: 'Mains',     price: 850,  emoji: '🥘', desc: 'Black lentils simmered with butter and cream.', popular: false },
  { id: 13, name: 'Garlic Naan',            cat: 'Breads',    price: 120,  emoji: '🫓', desc: 'Tandoor-baked naan brushed with garlic butter.', popular: false },
  { id: 14, name: 'Tandoori Roti',          cat: 'Breads',    price: 50,   emoji: '🫓', desc: 'Whole-wheat roti, hot from the tandoor.', popular: false },
  { id: 15, name: 'Lacha Paratha',          cat: 'Breads',    price: 100,  emoji: '🥞', desc: 'Flaky, layered and golden.', popular: false },
  { id: 16, name: 'Zinger Burger',          cat: 'Fast Food', price: 750,  emoji: '🍔', desc: 'Crunchy spicy chicken fillet with house sauce.', popular: true },
  { id: 17, name: 'Loaded Fries',           cat: 'Fast Food', price: 550,  emoji: '🍟', desc: 'Fries topped with cheese sauce and jalapeños.', popular: false },
  { id: 18, name: 'Alfredo Pasta',          cat: 'Fast Food', price: 1100, emoji: '🍝', desc: 'Creamy white sauce, grilled chicken and mushrooms.', popular: false },
  { id: 19, name: 'Club Sandwich',          cat: 'Fast Food', price: 800,  emoji: '🥪', desc: 'Triple-decker with chicken, egg and fresh veggies.', popular: false },
  { id: 20, name: 'Gulab Jamun (2 pcs)',    cat: 'Desserts',  price: 300,  emoji: '🍮', desc: 'Warm milk dumplings soaked in rose syrup.', popular: false },
  { id: 21, name: 'Kheer',                  cat: 'Desserts',  price: 350,  emoji: '🥛', desc: 'Creamy rice pudding with cardamom and pistachio.', popular: false },
  { id: 22, name: 'Chocolate Brownie',      cat: 'Desserts',  price: 500,  emoji: '🍫', desc: 'Fudgy brownie served warm with ice cream.', popular: false },
  { id: 23, name: 'Gajar Halwa',            cat: 'Desserts',  price: 450,  emoji: '🥕', desc: 'Slow-cooked carrot halwa with khoya and nuts.', popular: false },
  { id: 24, name: 'Mango Lassi',            cat: 'Drinks',    price: 350,  emoji: '🥭', desc: 'Thick yogurt shake with ripe mango.', popular: true },
  { id: 25, name: 'Doodh Soda',             cat: 'Drinks',    price: 250,  emoji: '🥤', desc: 'The classic milk and soda fizz.', popular: false },
  { id: 26, name: 'Kashmiri Chai',          cat: 'Drinks',    price: 300,  emoji: '🍵', desc: 'Pink tea with almonds and pistachios.', popular: false },
  { id: 27, name: 'Mint Margarita',         cat: 'Drinks',    price: 400,  emoji: '🍹', desc: 'Cool mint and lemon, no alcohol.', popular: false }
].map(function (d) { d.available = true; return d; });

const SAMPLE_REVIEWS = [
  { id: 'r1', name: 'Ayesha K.', rating: 5, comment: 'The chicken karahi was perfect and the service was quick. Will visit again!', date: '2026-09-12T19:00:00' },
  { id: 'r2', name: 'Hamza R.', rating: 5, comment: 'Best malai boti I have had. The naan was fresh and hot.', date: '2026-09-18T21:10:00' },
  { id: 'r3', name: 'Sara M.', rating: 4, comment: 'Lovely family atmosphere and great biryani. Desserts were a nice surprise.', date: '2026-09-25T20:30:00' }
];

/* ---------- 2. Storage helpers ---------- */
// Every read/write is wrapped in try/catch because localStorage can be blocked
// (private mode, strict browser settings). A memory copy keeps the site working.
const memory = {};
const DB = {
  get: function (key, fallback) {
    try {
      const raw = localStorage.getItem('aheer_' + key);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return key in memory ? memory[key] : fallback;
  },
  set: function (key, value) {
    memory[key] = value;
    try { localStorage.setItem('aheer_' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  },
  remove: function (key) {
    delete memory[key];
    try { localStorage.removeItem('aheer_' + key); } catch (e) { /* ignore */ }
  }
};

// App state (loaded from storage)
let menu = [], cart = [], orders = [], reservations = [], reviews = [], messages = [];
let couponCode = null;
let activeCat = 'All';
let ratingSel = 0;
let isAdmin = false;
let adminTab = 'overview';
let modalView = null;      // function that renders the open modal (so it can refresh)

function loadAll() {
  menu = DB.get('menu', null) || DEFAULT_MENU.map(function (d) { return Object.assign({}, d); });
  cart = DB.get('cart', []);
  orders = DB.get('orders', []);
  reservations = DB.get('reservations', []);
  reviews = DB.get('reviews', null) || SAMPLE_REVIEWS.slice();
  messages = DB.get('messages', []);
  couponCode = DB.get('coupon', null);
  DB.set('menu', menu);      // make sure defaults are stored on first visit
  DB.set('reviews', reviews);
}

/* ---------- 3. Small utilities ---------- */
const $ = function (sel) { return document.querySelector(sel); };
const $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

// Escape user text before putting it in innerHTML (prevents HTML injection)
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function money(n) { return 'Rs. ' + Math.round(n).toLocaleString('en-US'); }
function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fmtDay(dateStr) {
  const p = dateStr.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(t) {
  const p = t.split(':'); let h = +p[0];
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return h + ':' + p[1] + ' ' + ap;
}
function validPhone(p) { return /^[0-9+\-\s]{10,15}$/.test(p.trim()); }
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(function () { el.remove(); }, 3200);
}
function formError(form, msg) { form.querySelector('.form-error').textContent = msg || ''; }

/* ---- Modal helpers ---- */
function showModal(viewFn, wide) {
  modalView = viewFn;
  $('#modalBody').innerHTML = viewFn();
  $('#modalBox').classList.toggle('wide', !!wide);
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden', 'false');
}
function closeModal() {
  modalView = null; isAdmin = false;   // closing the modal also logs staff out
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden', 'true');
  $('#modalBody').innerHTML = '';
}
function refreshModal() { if (modalView) $('#modalBody').innerHTML = modalView(); }

/* ---------- 4. Menu ---------- */
function renderFilters() {
  const cats = ['All'].concat(CATEGORIES);
  $('#filters').innerHTML = cats.map(function (c) {
    return '<button class="filter' + (c === activeCat ? ' active' : '') + '" data-act="filter" data-id="' + esc(c) + '">' + esc(c) + '</button>';
  }).join('');
}

function dishCard(i) {
  const tone = Math.max(0, CATEGORIES.indexOf(i.cat));
  return '<article class="dish' + (i.available ? '' : ' sold') + '">' +
    '<div class="dish-img tone-' + tone + '"><span>' + esc(i.emoji || '🍽️') + '</span>' +
    (i.popular ? '<em class="tag">🔥 Popular</em>' : '') +
    (i.available ? '' : '<em class="tag off">Sold out</em>') + '</div>' +
    '<div class="dish-body"><h3>' + esc(i.name) + '</h3><p>' + esc(i.desc) + '</p>' +
    '<div class="dish-foot"><strong>' + money(i.price) + '</strong>' +
    '<button class="btn btn-primary btn-sm" data-act="add" data-id="' + i.id + '"' + (i.available ? '' : ' disabled') + '>Add +</button></div></div></article>';
}

function renderMenu() {
  const q = $('#search').value.trim().toLowerCase();
  const list = menu.filter(function (i) {
    const inCat = activeCat === 'All' || i.cat === activeCat;
    const inText = !q || (i.name + ' ' + i.desc + ' ' + i.cat).toLowerCase().indexOf(q) !== -1;
    return inCat && inText;
  });
  $('#menuGrid').innerHTML = list.length ? list.map(dishCard).join('') : '<p class="empty">No dishes match your search. Try another word or category.</p>';
  $('#statDishes').textContent = menu.length;
}

/* ---------- 5. Cart ---------- */
function cartLines() {
  return cart.map(function (c) {
    const m = menu.find(function (x) { return x.id === c.id; });
    return m ? Object.assign({}, m, { qty: c.qty }) : null;
  }).filter(Boolean);
}
function cartCount() { return cart.reduce(function (n, c) { return n + c.qty; }, 0); }
function saveCart() { DB.set('cart', cart); renderCart(); }

function addToCart(id, qty) {
  const item = menu.find(function (x) { return x.id === id; });
  if (!item || !item.available) { toast('Sorry, that dish is sold out.', 'err'); return; }
  const line = cart.find(function (c) { return c.id === id; });
  if (line) line.qty = Math.min(20, line.qty + (qty || 1));
  else cart.push({ id: id, qty: qty || 1 });
  saveCart();
  toast(item.name + ' added to cart', 'ok');
}
function changeQty(id, delta) {
  const line = cart.find(function (c) { return c.id === id; });
  if (!line) return;
  line.qty += delta;
  if (line.qty > 20) line.qty = 20;
  if (line.qty <= 0) cart = cart.filter(function (c) { return c.id !== id; });
  saveCart();
}
function removeFromCart(id) { cart = cart.filter(function (c) { return c.id !== id; }); saveCart(); }

// Work out subtotal, discount, tax, delivery and total
function calcTotals(type) {
  const subtotal = cartLines().reduce(function (s, l) { return s + l.price * l.qty; }, 0);
  const rule = couponCode ? CONFIG.coupons[couponCode] : null;
  const discount = rule && subtotal >= rule.min ? Math.round(subtotal * rule.pct) : 0;
  const tax = Math.round((subtotal - discount) * CONFIG.taxRate);
  const delivery = type === 'Delivery' && subtotal > 0 ? CONFIG.deliveryFee : 0;
  return { subtotal: subtotal, discount: discount, tax: tax, delivery: delivery, total: subtotal - discount + tax + delivery };
}

function summaryHTML(t) {
  return '<div class="sum">' +
    '<div><span>Subtotal</span><span>' + money(t.subtotal) + '</span></div>' +
    (t.discount ? '<div class="disc"><span>Discount (' + esc(couponCode) + ')</span><span>− ' + money(t.discount) + '</span></div>' : '') +
    '<div><span>Tax (' + (CONFIG.taxRate * 100) + '%)</span><span>' + money(t.tax) + '</span></div>' +
    (t.delivery ? '<div><span>Delivery fee</span><span>' + money(t.delivery) + '</span></div>' : '') +
    '<div class="total"><span>Total</span><span>' + money(t.total) + '</span></div></div>';
}

function renderCart() {
  $('#cartCount').textContent = cartCount();
  const lines = cartLines();
  const body = $('#cartBody');
  if (!lines.length) {
    body.innerHTML = '<div class="list"><p class="none">Your cart is empty.<br>Add something delicious from the menu! 🍛</p></div>';
    return;
  }
  const t = calcTotals('Dine-in');
  const rule = couponCode ? CONFIG.coupons[couponCode] : null;
  body.innerHTML =
    '<ul class="cart-list">' + lines.map(function (l) {
      return '<li class="cart-row"><span class="ce">' + esc(l.emoji) + '</span>' +
        '<div><b>' + esc(l.name) + '</b><small>' + money(l.price) + ' each' + (l.available ? '' : ' · SOLD OUT') + '</small></div>' +
        '<div class="qty"><button data-act="dec" data-id="' + l.id + '" aria-label="Decrease">−</button><span>' + l.qty + '</span>' +
        '<button data-act="inc" data-id="' + l.id + '" aria-label="Increase">+</button></div>' +
        '<strong>' + money(l.price * l.qty) + '</strong>' +
        '<button class="x" data-act="remove" data-id="' + l.id + '" aria-label="Remove">✕</button></li>';
    }).join('') + '</ul>' +
    '<div class="coupon"><input id="couponInput" placeholder="Coupon code (try WELCOME10)" value="' + (couponCode ? esc(couponCode) : '') + '">' +
    '<button class="btn btn-ghost btn-sm" data-act="applyCoupon">Apply</button></div>' +
    (couponCode && rule && t.subtotal < rule.min ? '<p class="form-error">' + esc(couponCode) + ' needs a minimum order of ' + money(rule.min) + '.</p>' : '') +
    summaryHTML(t) +
    '<p class="muted">Delivery fee (' + money(CONFIG.deliveryFee) + ') is added at checkout if you choose delivery.</p>' +
    '<div style="display:grid;gap:8px;margin-top:14px">' +
    '<button class="btn btn-primary" data-act="checkout">Checkout</button>' +
    '<button class="btn btn-ghost" data-act="clearCart">Clear cart</button></div>';
}

function applyCoupon() {
  const code = ($('#couponInput').value || '').trim().toUpperCase();
  if (!code) { couponCode = null; DB.remove('coupon'); renderCart(); toast('Coupon removed'); return; }
  if (!CONFIG.coupons[code]) { toast('Invalid coupon code', 'err'); return; }
  couponCode = code; DB.set('coupon', code);
  renderCart(); toast('Coupon ' + code + ' applied', 'ok');
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); renderCart(); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); }

/* ---------- 6. Orders (checkout, history) ---------- */
function checkoutView() {
  const t = calcTotals('Dine-in');
  return '<h2>Checkout</h2>' +
    '<form id="checkoutForm" class="form" novalidate>' +
    '<div class="row"><label>Full name<input name="name" required placeholder="Your name"></label>' +
    '<label>Phone<input name="phone" type="tel" required placeholder="03xx xxxxxxx"></label></div>' +
    '<div class="row"><label>Order type<select name="type" id="ckType" data-act="ckType">' +
    '<option>Dine-in</option><option>Pickup</option><option>Delivery</option></select></label>' +
    '<label>Payment<select name="payment"><option>Cash</option><option>Card on arrival</option></select></label></div>' +
    '<label id="addrWrap" style="display:none">Delivery address<textarea name="address" rows="2" placeholder="House, street, area"></textarea></label>' +
    '<label>Notes (optional)<input name="notes" placeholder="Less spicy, no onions…"></label>' +
    '<div id="ckSummary">' + summaryHTML(t) + '</div>' +
    '<p class="form-error" role="alert"></p>' +
    '<button class="btn btn-primary" type="submit">Place order</button></form>';
}

function openCheckout() {
  if (!cartLines().length) { toast('Your cart is empty.', 'err'); return; }
  closeCart();
  showModal(checkoutView);
}

function placeOrder(form) {
  const f = new FormData(form);
  const name = (f.get('name') || '').trim(), phone = (f.get('phone') || '').trim();
  const type = f.get('type'), address = (f.get('address') || '').trim();
  formError(form, '');

  if (name.length < 2) return formError(form, 'Please enter your name.');
  if (!validPhone(phone)) return formError(form, 'Please enter a valid phone number (10–15 digits).');
  if (type === 'Delivery' && address.length < 6) return formError(form, 'Please enter your delivery address.');

  const lines = cartLines();
  if (!lines.length) return formError(form, 'Your cart is empty.');
  const soldOut = lines.filter(function (l) { return !l.available; });
  if (soldOut.length) return formError(form, 'Sold out: ' + soldOut.map(function (l) { return l.name; }).join(', ') + '. Please remove it from the cart.');

  const seq = DB.get('orderSeq', 1000) + 1;
  DB.set('orderSeq', seq);
  const t = calcTotals(type);
  const eta = type === 'Delivery' ? 45 : type === 'Pickup' ? 25 : 20;

  const order = {
    id: 'ORD-' + seq,
    items: lines.map(function (l) { return { id: l.id, name: l.name, emoji: l.emoji, price: l.price, qty: l.qty }; }),
    subtotal: t.subtotal, discount: t.discount, tax: t.tax, delivery: t.delivery, total: t.total,
    coupon: t.discount ? couponCode : null,
    customer: { name: name, phone: phone, address: address },
    type: type, payment: f.get('payment'), notes: (f.get('notes') || '').trim(),
    status: 'Pending', eta: eta, createdAt: new Date().toISOString()
  };
  orders.push(order);
  DB.set('orders', orders);

  cart = []; couponCode = null; DB.remove('coupon'); saveCart();

  showModal(function () {
    return '<div class="success"><div class="big">🎉</div><h2>Order placed!</h2>' +
      '<p>Thank you, <b>' + esc(name) + '</b>. We have received your order.</p>' +
      '<div class="oid">' + order.id + '</div>' +
      '<p>' + esc(type) + ' · Estimated time: <b>' + eta + ' min</b></p>' +
      '<p>Total to pay: <b>' + money(order.total) + '</b> (' + esc(order.payment) + ')</p>' +
      '<p class="muted" style="margin:12px 0">You can track the status under “My Orders”.</p>' +
      '<button class="btn btn-primary" data-act="closeModal">Done</button></div>';
  });
}

function ordersView() {
  const list = orders.slice().reverse();
  return '<h2>My orders</h2><p class="muted" style="margin-bottom:12px">Orders placed from this device.</p>' +
    '<div class="list">' + (list.length ? list.map(function (o) {
      return '<div class="item"><div class="item-top"><div><b>' + o.id + '</b><small>' + fmtDateTime(o.createdAt) + ' · ' + esc(o.type) + '</small></div>' +
        '<span class="pill ' + o.status + '">' + o.status + '</span></div>' +
        '<p style="margin-top:6px;font-size:.92rem">' + o.items.map(function (i) { return i.qty + '× ' + esc(i.name); }).join(', ') + '</p>' +
        '<div class="item-top" style="margin-top:6px"><b>' + money(o.total) + '</b>' +
        '<div class="actions" style="margin:0">' +
        '<button class="btn btn-ghost btn-sm" data-act="reorder" data-id="' + o.id + '">Order again</button>' +
        (o.status === 'Pending' ? '<button class="btn btn-danger btn-sm" data-act="cancelOrder" data-id="' + o.id + '">Cancel</button>' : '') +
        '</div></div></div>';
    }).join('') : '<p class="none">You have not placed any orders yet.</p>') + '</div>';
}

function updateOrder(id, changes) {
  const o = orders.find(function (x) { return x.id === id; });
  if (o) { Object.assign(o, changes); DB.set('orders', orders); }
}

/* ---------- 7. Reservations ---------- */
function guestsInSlot(date, time, ignoreId) {
  const hour = time.slice(0, 2);
  return reservations.reduce(function (sum, r) {
    const same = r.date === date && r.time.slice(0, 2) === hour && r.status !== 'Cancelled' && r.id !== ignoreId;
    return sum + (same ? r.guests : 0);
  }, 0);
}

function submitReservation(form) {
  const f = new FormData(form);
  const name = (f.get('name') || '').trim(), phone = (f.get('phone') || '').trim();
  const date = f.get('date'), time = f.get('time'), guests = parseInt(f.get('guests'), 10);
  formError(form, '');

  if (name.length < 2) return formError(form, 'Please enter your name.');
  if (!validPhone(phone)) return formError(form, 'Please enter a valid phone number.');
  if (!date) return formError(form, 'Please choose a date.');
  if (date < todayStr()) return formError(form, 'The date cannot be in the past.');
  if (!time || time < '12:00' || time > '23:00') return formError(form, 'We take reservations between 12:00 PM and 11:00 PM.');
  if (date === todayStr()) {
    const now = new Date();
    const nowStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    if (time <= nowStr) return formError(form, 'That time has already passed today.');
  }
  if (!(guests >= 1 && guests <= 20)) return formError(form, 'Guests must be between 1 and 20.');
  const left = CONFIG.slotCapacity - guestsInSlot(date, time);
  if (guests > left) return formError(form, left > 0 ? 'Only ' + left + ' seats left in that hour. Try another time.' : 'That hour is fully booked. Please pick another time.');

  const seq = DB.get('resSeq', 0) + 1;
  DB.set('resSeq', seq);
  reservations.push({
    id: 'RES-' + (100 + seq), name: name, phone: phone, date: date, time: time, guests: guests,
    occasion: f.get('occasion'), notes: (f.get('notes') || '').trim(), status: 'Pending', createdAt: new Date().toISOString()
  });
  DB.set('reservations', reservations);
  form.reset();
  form.elements.time.value = '19:00'; form.elements.guests.value = 2;
  renderReservations();
  toast('Table requested! We will confirm shortly.', 'ok');
}

function renderReservations() {
  const list = reservations.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
  $('#resList').innerHTML = list.length ? list.map(function (r) {
    return '<div class="item"><div class="item-top"><div><b>' + fmtDay(r.date) + ' · ' + fmtTime(r.time) + '</b>' +
      '<small>' + r.id + ' · ' + esc(r.name) + ' · ' + r.guests + ' guest' + (r.guests > 1 ? 's' : '') + ' · ' + esc(r.occasion) + '</small></div>' +
      '<span class="pill ' + r.status + '">' + r.status + '</span></div>' +
      (r.status !== 'Cancelled' ? '<div class="actions"><button class="btn btn-danger btn-sm" data-act="cancelRes" data-id="' + r.id + '">Cancel</button></div>' : '') +
      '</div>';
  }).join('') : '<p class="none">No reservations yet. Book your first table!</p>';
}

/* ---------- 8. Reviews & contact ---------- */
function avgRating() {
  if (!reviews.length) return 0;
  return reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length;
}

function renderReviews() {
  const avg = avgRating();
  $('#statRating').textContent = avg.toFixed(1);
  $('#ratingSummary').innerHTML = reviews.length
    ? '<span class="stars">' + stars(Math.round(avg)) + '</span> ' + avg.toFixed(1) + ' out of 5 · ' + reviews.length + ' review' + (reviews.length > 1 ? 's' : '')
    : 'Be the first to review us!';
  $('#reviewList').innerHTML = reviews.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (r) {
    return '<div class="item"><div class="item-top"><b>' + esc(r.name) + '</b><span class="stars">' + stars(r.rating) + '</span></div>' +
      '<small>' + fmtDateTime(r.date) + '</small><p>' + esc(r.comment) + '</p></div>';
  }).join('');
}

function renderStarPicker() {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += '<button type="button" class="' + (i <= ratingSel ? 'on' : '') + '" data-act="rate" data-id="' + i + '" aria-label="' + i + ' star">★</button>';
  }
  $('#starPicker').innerHTML = html;
}

function submitReview(form) {
  const f = new FormData(form);
  const name = (f.get('name') || '').trim(), comment = (f.get('comment') || '').trim();
  formError(form, '');
  if (name.length < 2) return formError(form, 'Please enter your name.');
  if (!ratingSel) return formError(form, 'Please choose a star rating.');
  if (comment.length < 5) return formError(form, 'Please write a short comment (at least 5 characters).');
  reviews.push({ id: 'r' + Date.now(), name: name, rating: ratingSel, comment: comment, date: new Date().toISOString() });
  DB.set('reviews', reviews);
  form.reset(); ratingSel = 0; renderStarPicker(); renderReviews();
  toast('Thank you for your review!', 'ok');
}

function submitContact(form) {
  const f = new FormData(form);
  const name = (f.get('name') || '').trim(), email = (f.get('email') || '').trim(), message = (f.get('message') || '').trim();
  formError(form, '');
  if (name.length < 2) return formError(form, 'Please enter your name.');
  if (!validEmail(email)) return formError(form, 'Please enter a valid email address.');
  if (message.length < 5) return formError(form, 'Please write a message.');
  messages.push({ id: 'm' + Date.now(), name: name, email: email, message: message, date: new Date().toISOString() });
  DB.set('messages', messages);
  form.reset();
  toast('Message sent. We will get back to you soon!', 'ok');
}

/* ---------- 9. Staff / admin panel ---------- */
function loginView() {
  return '<h2>Staff login</h2><p class="muted" style="margin-bottom:12px">Enter the staff PIN to manage orders, bookings and the menu.</p>' +
    '<form id="adminLogin" class="form" novalidate><label>PIN<input type="password" name="pin" inputmode="numeric" autocomplete="off" placeholder="••••"></label>' +
    '<p class="form-error" role="alert"></p><button class="btn btn-primary" type="submit">Login</button></form>';
}

function adminView() {
  const tabs = [['overview', 'Overview'], ['orders', 'Orders'], ['reservations', 'Reservations'], ['messages', 'Messages'], ['menu', 'Menu']];
  return '<h2>Staff dashboard</h2><p class="muted" style="margin-bottom:12px">Welcome, Basit Aheer (Owner). Changes appear on the customer side straight away.</p>' +
    '<div class="admin-tabs">' + tabs.map(function (t) {
      return '<button class="filter' + (adminTab === t[0] ? ' active' : '') + '" data-act="adminTab" data-id="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>' + adminTabHTML();
}

function statusSelect(act, id, current, options) {
  return '<select class="status-sel" data-act="' + act + '" data-id="' + id + '">' + options.map(function (s) {
    return '<option' + (s === current ? ' selected' : '') + '>' + s + '</option>';
  }).join('') + '</select>';
}

function adminTabHTML() {
  if (adminTab === 'overview') {
    const revenue = orders.filter(function (o) { return o.status !== 'Cancelled'; }).reduce(function (s, o) { return s + o.total; }, 0);
    const pending = orders.filter(function (o) { return o.status === 'Pending'; }).length;
    const todayRes = reservations.filter(function (r) { return r.date === todayStr() && r.status !== 'Cancelled'; }).length;
    return '<div class="stat-grid">' +
      '<div class="stat"><strong>' + orders.length + '</strong><span>Total orders</span></div>' +
      '<div class="stat"><strong>' + pending + '</strong><span>Pending orders</span></div>' +
      '<div class="stat"><strong>' + money(revenue) + '</strong><span>Revenue (excl. cancelled)</span></div>' +
      '<div class="stat"><strong>' + todayRes + '</strong><span>Reservations today</span></div>' +
      '<div class="stat"><strong>' + messages.length + '</strong><span>Messages</span></div>' +
      '<div class="stat"><strong>' + avgRating().toFixed(1) + '</strong><span>Average rating</span></div></div>' +
      '<div class="danger-zone"><button class="btn btn-danger btn-sm" data-act="resetAll">Reset all site data</button> ' +
      '<button class="btn btn-ghost btn-sm" data-act="logout">Log out</button></div>';
  }

  if (adminTab === 'orders') {
    const list = orders.slice().reverse();
    return '<div class="list">' + (list.length ? list.map(function (o) {
      return '<div class="item"><div class="admin-row"><div><b>' + o.id + '</b> · ' + esc(o.customer.name) + ' · ' + esc(o.customer.phone) +
        '<small>' + fmtDateTime(o.createdAt) + ' · ' + esc(o.type) + ' · ' + esc(o.payment) + (o.customer.address ? ' · ' + esc(o.customer.address) : '') + '</small></div>' +
        statusSelect('ordStatus', o.id, o.status, ORDER_STATUS) + '</div>' +
        '<p style="margin-top:6px;font-size:.92rem">' + o.items.map(function (i) { return i.qty + '× ' + esc(i.name); }).join(', ') + '</p>' +
        (o.notes ? '<small>Note: ' + esc(o.notes) + '</small>' : '') +
        '<div class="admin-row" style="margin-top:8px"><b>' + money(o.total) + '</b>' +
        '<button class="btn btn-danger btn-sm" data-act="delOrder" data-id="' + o.id + '">Delete</button></div></div>';
    }).join('') : '<p class="none">No orders yet.</p>') + '</div>';
  }

  if (adminTab === 'reservations') {
    const list = reservations.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    return '<div class="list">' + (list.length ? list.map(function (r) {
      return '<div class="item"><div class="admin-row"><div><b>' + fmtDay(r.date) + ' · ' + fmtTime(r.time) + '</b> · ' + r.guests + ' guests' +
        '<small>' + r.id + ' · ' + esc(r.name) + ' · ' + esc(r.phone) + ' · ' + esc(r.occasion) + '</small>' +
        (r.notes ? '<small>Request: ' + esc(r.notes) + '</small>' : '') + '</div>' +
        '<div>' + statusSelect('resStatus', r.id, r.status, RES_STATUS) + ' <button class="btn btn-danger btn-sm" data-act="delRes" data-id="' + r.id + '">Delete</button></div></div></div>';
    }).join('') : '<p class="none">No reservations yet.</p>') + '</div>';
  }

  if (adminTab === 'messages') {
    const list = messages.slice().reverse();
    return '<div class="list">' + (list.length ? list.map(function (m) {
      return '<div class="item"><div class="admin-row"><div><b>' + esc(m.name) + '</b> · ' + esc(m.email) + '<small>' + fmtDateTime(m.date) + '</small></div>' +
        '<button class="btn btn-danger btn-sm" data-act="delMsg" data-id="' + m.id + '">Delete</button></div>' +
        '<p style="margin-top:6px">' + esc(m.message) + '</p></div>';
    }).join('') : '<p class="none">No messages yet.</p>') + '</div>';
  }

  // Menu management tab
  return '<form id="addItemForm" class="inline-form" novalidate>' +
    '<input name="name" placeholder="Dish name" required>' +
    '<select name="cat">' + CATEGORIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
    '<input name="price" type="number" min="1" placeholder="Price" required>' +
    '<input name="emoji" placeholder="Emoji" maxlength="4">' +
    '<input class="full" name="desc" placeholder="Short description" required>' +
    '<p class="form-error full" role="alert"></p>' +
    '<button class="btn btn-primary btn-sm full" type="submit">Add dish</button></form>' +
    '<div class="list">' + menu.map(function (m) {
      return '<div class="item admin-row"><div>' + esc(m.emoji) + ' <b>' + esc(m.name) + '</b> <small>' + esc(m.cat) + ' · ' + money(m.price) + '</small></div>' +
        '<div><button class="btn btn-ghost btn-sm" data-act="toggleAvail" data-id="' + m.id + '">' + (m.available ? 'Mark sold out' : 'Mark available') + '</button> ' +
        '<button class="btn btn-danger btn-sm" data-act="delItem" data-id="' + m.id + '">Delete</button></div></div>';
    }).join('') + '</div>';
}

function adminLogin(form) {
  const pin = new FormData(form).get('pin');
  if (pin !== CONFIG.adminPin) return formError(form, 'Wrong PIN. Please try again.');
  isAdmin = true; adminTab = 'overview';
  showModal(adminView, true);
  toast('Welcome back, Basit!', 'ok');
}

function addMenuItem(form) {
  const f = new FormData(form);
  const name = (f.get('name') || '').trim(), desc = (f.get('desc') || '').trim(), price = parseInt(f.get('price'), 10);
  formError(form, '');
  if (name.length < 2) return formError(form, 'Enter a dish name.');
  if (!(price > 0)) return formError(form, 'Enter a valid price.');
  if (desc.length < 3) return formError(form, 'Enter a short description.');
  const nextId = menu.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
  menu.push({ id: nextId, name: name, cat: f.get('cat'), price: price, emoji: (f.get('emoji') || '').trim() || '🍽️', desc: desc, available: true, popular: false });
  DB.set('menu', menu);
  renderMenu(); refreshModal();
  toast('Dish added to the menu', 'ok');
}

/* ---------- 10. Events & start-up ---------- */
function renderAll() {
  renderFilters(); renderMenu(); renderCart(); renderReservations(); renderReviews(); renderStarPicker(); updateOpenChip();
}

function updateOpenChip() {
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  const open = h >= CONFIG.openHour && h < CONFIG.closeHour;
  const chip = $('#openChip');
  chip.className = 'chip ' + (open ? 'open' : 'closed');
  chip.textContent = open ? 'Open now · until 11:30 PM' : 'Closed now · opens at 12:00 PM';
}

// One click handler for every button that has data-act
document.addEventListener('click', function (e) {
  const t = e.target.closest('[data-act]');
  if (!t || t.tagName === 'SELECT') return;
  const act = t.dataset.act, id = t.dataset.id;

  switch (act) {
    case 'filter': activeCat = id; renderFilters(); renderMenu(); break;
    case 'add': addToCart(+id); break;
    case 'inc': changeQty(+id, 1); break;
    case 'dec': changeQty(+id, -1); break;
    case 'remove': removeFromCart(+id); break;
    case 'clearCart': cart = []; saveCart(); break;
    case 'applyCoupon': applyCoupon(); break;
    case 'openCart': openCart(); break;
    case 'closeCart': closeCart(); break;
    case 'checkout': openCheckout(); break;
    case 'closeModal': closeModal(); break;
    case 'openOrders': showModal(ordersView); break;
    case 'reorder': {
      const o = orders.find(function (x) { return x.id === id; });
      if (o) { o.items.forEach(function (i) { const m = menu.find(function (x) { return x.id === i.id; }); if (m && m.available) addToCart(i.id, i.qty); }); closeModal(); openCart(); }
      break;
    }
    case 'cancelOrder':
      if (confirm('Cancel order ' + id + '?')) { updateOrder(id, { status: 'Cancelled' }); refreshModal(); toast('Order cancelled'); }
      break;
    case 'cancelRes':
      if (confirm('Cancel reservation ' + id + '?')) {
        const r = reservations.find(function (x) { return x.id === id; });
        if (r) { r.status = 'Cancelled'; DB.set('reservations', reservations); renderReservations(); toast('Reservation cancelled'); }
      }
      break;
    case 'rate': ratingSel = +id; renderStarPicker(); break;
    case 'openAdmin': showModal(isAdmin ? adminView : loginView, isAdmin); break;
    case 'adminTab': adminTab = id; refreshModal(); break;
    case 'logout': isAdmin = false; closeModal(); toast('Logged out'); break;
    case 'delOrder':
      if (confirm('Delete order ' + id + '?')) { orders = orders.filter(function (x) { return x.id !== id; }); DB.set('orders', orders); refreshModal(); }
      break;
    case 'delRes':
      if (confirm('Delete reservation ' + id + '?')) { reservations = reservations.filter(function (x) { return x.id !== id; }); DB.set('reservations', reservations); renderReservations(); refreshModal(); }
      break;
    case 'delMsg':
      messages = messages.filter(function (x) { return x.id !== id; }); DB.set('messages', messages); refreshModal();
      break;
    case 'toggleAvail': {
      const m = menu.find(function (x) { return x.id === +id; });
      if (m) { m.available = !m.available; DB.set('menu', menu); renderMenu(); renderCart(); refreshModal(); }
      break;
    }
    case 'delItem':
      if (confirm('Remove this dish from the menu?')) {
        menu = menu.filter(function (x) { return x.id !== +id; }); DB.set('menu', menu);
        cart = cart.filter(function (c) { return c.id !== +id; }); DB.set('cart', cart);
        renderMenu(); renderCart(); refreshModal();
      }
      break;
    case 'resetAll':
      if (confirm('This deletes ALL orders, reservations, reviews, messages and menu changes on this browser. Continue?')) {
        ['menu', 'cart', 'orders', 'reservations', 'reviews', 'messages', 'coupon', 'orderSeq', 'resSeq'].forEach(DB.remove);
        loadAll(); renderAll(); closeModal(); toast('All data has been reset', 'ok');
      }
      break;
  }
});

// Dropdown changes (order type in checkout, status selects in admin)
document.addEventListener('change', function (e) {
  const t = e.target, act = t.dataset ? t.dataset.act : null;
  if (act === 'ckType') {
    const isDelivery = t.value === 'Delivery';
    $('#addrWrap').style.display = isDelivery ? 'flex' : 'none';
    $('#ckSummary').innerHTML = summaryHTML(calcTotals(t.value));
  } else if (act === 'ordStatus') {
    updateOrder(t.dataset.id, { status: t.value }); refreshModal(); toast('Order ' + t.dataset.id + ' → ' + t.value, 'ok');
  } else if (act === 'resStatus') {
    const r = reservations.find(function (x) { return x.id === t.dataset.id; });
    if (r) { r.status = t.value; DB.set('reservations', reservations); renderReservations(); refreshModal(); toast(r.id + ' → ' + t.value, 'ok'); }
  }
});

// All forms
document.addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  switch (form.id) {
    case 'checkoutForm': placeOrder(form); break;
    case 'reserveForm': submitReservation(form); break;
    case 'reviewForm': submitReview(form); break;
    case 'contactForm': submitContact(form); break;
    case 'adminLogin': adminLogin(form); break;
    case 'addItemForm': addMenuItem(form); break;
  }
});

// Live menu search
document.addEventListener('input', function (e) { if (e.target.id === 'search') renderMenu(); });

// Escape key closes cart / modal
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeCart(); closeModal(); }
});

// Click on the dark area around a modal closes it
$('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });

// Mobile menu + header shadow + active nav link
$('#menuToggle').addEventListener('click', function () { $('#nav').classList.toggle('open'); });
$$('#nav a').forEach(function (a) { a.addEventListener('click', function () { $('#nav').classList.remove('open'); }); });
window.addEventListener('scroll', function () {
  $('#header').classList.toggle('scrolled', window.scrollY > 10);
  let current = 'home';
  $$('main section[id]').forEach(function (s) { if (window.scrollY + 120 >= s.offsetTop) current = s.id; });
  $$('#nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
});

// If another browser tab changes the data (e.g. staff updates an order), refresh this tab
window.addEventListener('storage', function () {
  loadAll(); renderAll();
  if (modalView === ordersView || modalView === adminView) refreshModal();   // don't wipe a half-filled form
});

// Start
loadAll();
$('#year').textContent = new Date().getFullYear();
$('#resDate').min = todayStr();
$('#resDate').value = todayStr();
renderAll();
setInterval(updateOpenChip, 60000);
