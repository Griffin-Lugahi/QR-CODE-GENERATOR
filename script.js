const presets = {
  url: {
    fields: [
      { id: 'url', label: 'Website URL', placeholder: 'https://example.com', type: 'text' }
    ],
    build: function(f) {
      return f.url || '';
    }
  },
  text: {
    fields: [
      { id: 'text', label: 'Message or text', placeholder: 'Hello, world!', type: 'textarea' }
    ],
    build: function(f) {
      return f.text || '';
    }
  },
  email: {
    fields: [
      { id: 'to',      label: 'To',      placeholder: 'someone@example.com', type: 'text' },
      { id: 'subject', label: 'Subject', placeholder: 'Hello!',              type: 'text' },
      { id: 'body',    label: 'Body',    placeholder: 'Your message...',      type: 'textarea' }
    ],
    build: function(f) {
      if (!f.to) return '';
      return 'mailto:' + f.to
        + '?subject=' + encodeURIComponent(f.subject || '')
        + '&body='    + encodeURIComponent(f.body    || '');
    }
  },
  phone: {
    fields: [
      { id: 'phone', label: 'Phone number', placeholder: '+1 555 000 0000', type: 'text' }
    ],
    build: function(f) {
      return f.phone ? 'tel:' + f.phone.replace(/\s/g, '') : '';
    }
  },
  wifi: {
    fields: [
      { id: 'ssid', label: 'Network name (SSID)', placeholder: 'MyNetwork', type: 'text' },
      { id: 'pass', label: 'Password',            placeholder: 'password',  type: 'text' },
      { id: 'enc',  label: 'Encryption',          type: 'select', options: ['WPA', 'WEP', 'nopass'] }
    ],
    build: function(f) {
      if (!f.ssid) return '';
      return 'WIFI:T:' + (f.enc || 'WPA') + ';S:' + f.ssid + ';P:' + (f.pass || '') + ';;';
    }
  }
};

var currentPreset = 'url';
var debounceTimer  = null;

/* ---------- Render form fields ---------- */
function renderFields(preset) {
  var container = document.getElementById('fields');
  container.innerHTML = '';

  presets[preset].fields.forEach(function(field) {
    var wrap = document.createElement('div');
    wrap.className = 'field-wrap';

    var lbl = document.createElement('label');
    lbl.className = 'field-label';
    lbl.textContent = field.label;
    lbl.setAttribute('for', 'field-' + field.id);
    wrap.appendChild(lbl);

    var el;
    if (field.type === 'textarea') {
      el = document.createElement('textarea');
      el.rows = 3;
    } else if (field.type === 'select') {
      el = document.createElement('select');
      field.options.forEach(function(opt) {
        var o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        el.appendChild(o);
      });
    } else {
      el = document.createElement('input');
      el.type = 'text';
    }

    el.id = 'field-' + field.id;
    if (field.placeholder) el.placeholder = field.placeholder;
    el.dataset.fieldId = field.id;

    el.addEventListener('input',  scheduleGenerate);
    el.addEventListener('change', scheduleGenerate);

    wrap.appendChild(el);
    container.appendChild(wrap);
  });
}

/* ---------- Read field values ---------- */
function getFieldValues() {
  var vals = {};
  document.querySelectorAll('[data-field-id]').forEach(function(el) {
    vals[el.dataset.fieldId] = el.value;
  });
  return vals;
}

/* ---------- Debounce ---------- */
function scheduleGenerate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(generate, 300);
}

/* ---------- Generate QR ---------- */
function generate() {
  var content   = presets[currentPreset].build(getFieldValues());
  var container = document.getElementById('qr-container');
  var actions   = document.getElementById('actions');
  var meta      = document.getElementById('meta');
  var size      = parseInt(document.getElementById('size-slider').value, 10);
  var fg        = document.getElementById('fg-color').value;
  var bg        = document.getElementById('bg-color').value;
  var ec        = document.getElementById('ec-level').value;

  if (!content.trim()) {
    container.innerHTML =
      '<div class="placeholder">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/></svg>' +
        '<p>Enter content above to generate your QR code</p>' +
      '</div>';
    actions.style.display = 'none';
    meta.textContent = '';
    return;
  }

  container.innerHTML = '';

  try {
    new QRCode(container, {
      text:         content,
      width:        size,
      height:       size,
      colorDark:    fg,
      colorLight:   bg,
      correctLevel: QRCode.CorrectLevel[ec]
    });
    actions.style.display = 'flex';
    meta.textContent = content.length + ' characters \u00b7 ' + ec + ' error correction';
  } catch (e) {
    container.innerHTML = '<div class="placeholder"><p>Content too long or invalid</p></div>';
    actions.style.display = 'none';
  }
}

/* ---------- Tab switching ---------- */
document.getElementById('preset-tabs').addEventListener('click', function(e) {
  var btn = e.target.closest('[data-preset]');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  currentPreset = btn.dataset.preset;
  renderFields(currentPreset);
  generate();
});

/* ---------- Controls ---------- */
document.getElementById('size-slider').addEventListener('input', function() {
  document.getElementById('size-val').textContent = this.value + 'px';
  scheduleGenerate();
});

document.getElementById('fg-color').addEventListener('input', scheduleGenerate);
document.getElementById('bg-color').addEventListener('input', scheduleGenerate);
document.getElementById('ec-level').addEventListener('change', scheduleGenerate);

/* ---------- Download ---------- */
document.getElementById('download-btn').addEventListener('click', function() {
  var canvas = document.querySelector('#qr-container canvas');
  var img    = document.querySelector('#qr-container img');
  var a      = document.createElement('a');
  a.download = 'qrcode.png';
  if (canvas) {
    a.href = canvas.toDataURL('image/png');
  } else if (img) {
    a.href = img.src;
  } else {
    return;
  }
  a.click();
});

/* ---------- Copy to clipboard ---------- */
document.getElementById('copy-btn').addEventListener('click', function() {
  var canvas = document.querySelector('#qr-container canvas');
  if (!canvas) return;
  var btn = document.getElementById('copy-btn');
  canvas.toBlob(function(blob) {
    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      .then(function() {
        btn.textContent = '\u2713 Copied!';
        setTimeout(function() { btn.textContent = '\u29e7 Copy'; }, 1500);
      })
      .catch(function() {
        btn.textContent = 'Copy failed';
        setTimeout(function() { btn.textContent = '\u29e7 Copy'; }, 1500);
      });
  });
});

/* ---------- Init ---------- */
renderFields('url');