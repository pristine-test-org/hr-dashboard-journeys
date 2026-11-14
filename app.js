/* Pinecrest HR: a small test dashboard. Everything lives in this browser's localStorage. No network calls. */
(function () {
  'use strict';

  var KEY_PEOPLE = 'hrd.people.v1';
  var KEY_SESSION = 'hrd.session';

  var USERS = {
    admin: { password: 'demo-admin', name: 'Nurul Huda', role: 'HR admin' },
    dana: { password: 'demo-dana', name: 'Dana Ortiz', role: 'Team manager' }
  };

  var DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Data', 'Quality Assurance', 'Infrastructure', 'Operations', 'Human Resources'];
  var STATUSES = {
    overdue: { label: 'Overdue', color: '#d93025' },
    ontrack: { label: 'On track', color: '#1e9e57' },
    pending: { label: 'Pending', color: '#f2a900' }
  };

  var SEED = [
    ['p01', 'Ahmad Faiz Rahman', 'Senior Software Engineer', 'Engineering', '2022-03-14', 'ontrack'],
    ['p02', 'Siti Aminah Yusof', 'Software Engineer', 'Engineering', '2023-06-01', 'overdue'],
    ['p03', 'Tan Wei Jian', 'Engineering Manager', 'Engineering', '2020-09-21', 'ontrack'],
    ['p04', 'Priya Sharma', 'QA Engineer', 'Quality Assurance', '2022-11-07', 'pending'],
    ['p05', 'Muhammad Hafiz Ismail', 'DevOps Engineer', 'Infrastructure', '2021-07-19', 'ontrack'],
    ['p06', 'Nur Alia Zainal', 'Product Manager', 'Product', '2021-02-08', 'overdue'],
    ['p07', 'Kevin Lee Chun Wai', 'Software Engineer', 'Engineering', '2023-01-16', 'pending'],
    ['p08', 'Farah Aziz', 'UI/UX Designer', 'Design', '2022-05-30', 'ontrack'],
    ['p09', 'Rajesh Kumar', 'Data Analyst', 'Data', '2023-04-11', 'ontrack'],
    ['p10', 'Chong Mei Ling', 'Senior Software Engineer', 'Engineering', '2021-10-04', 'pending'],
    ['p11', 'Daniel Wong', 'DevOps Engineer', 'Infrastructure', '2023-09-05', 'overdue'],
    ['p12', 'Zulaikha Osman', 'Scrum Master', 'Product', '2022-06-20', 'ontrack']
  ].map(function (r) {
    return {
      id: r[0], name: r[1], title: r[2], department: r[3], startDate: r[4], status: r[5],
      email: r[1].toLowerCase().split(' ').slice(0, 2).join('.') + '@example.com', photo: ''
    };
  });

  // ---------- storage ----------
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { localStorage.setItem(key, value); }

  function people() {
    var raw = read(KEY_PEOPLE);
    if (raw) { try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ } }
    savePeople(SEED);
    return SEED.slice();
  }
  function savePeople(list) { write(KEY_PEOPLE, JSON.stringify(list)); }
  function findPerson(id) { return people().filter(function (p) { return p.id === id; })[0] || null; }
  function resetData() { try { localStorage.removeItem(KEY_PEOPLE); } catch (e) { /* ignore */ } people(); }

  function session() { var u = read(KEY_SESSION); return u && USERS[u] ? u : null; }

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || '')[0] || '?').toUpperCase() + ((parts.length > 1 ? parts[parts.length - 1][0] : '') || '').toUpperCase();
  }
  function hue(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; return h; }
  function avatarSrc(p) {
    if (p.photo) return p.photo;
    var h = hue(p.name);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(' + h + ',55%,88%)"/>' +
      '<text x="32" y="41" font-family="system-ui,sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="hsl(' + h + ',45%,32%)">' + esc(initials(p.name)) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  // ---------- shell ----------
  function shell(current) {
    var user = USERS[session()];
    var links = [['people', 'people.html', 'People'], ['add', 'add.html', 'Add person'], ['reports', 'reports.html', 'Reports']];
    var nav = links.map(function (l) {
      return '<a href="' + l[1] + '"' + (l[0] === current ? ' aria-current="page"' : '') + '>' + l[2] + '</a>';
    }).join('');
    var shellEl = $('#shell');
    var top = document.createElement('header');
    top.className = 'topbar';
    top.innerHTML = '<a class="brand" href="people.html"><span class="brand-mark">P</span>Pinecrest HR</a>' +
      '<button type="button" class="menu-btn" aria-expanded="false" aria-controls="side">Menu</button>';
    var side = document.createElement('aside');
    side.className = 'side'; side.id = 'side';
    side.innerHTML = '<a class="brand" href="people.html"><span class="brand-mark">P</span>Pinecrest HR</a>' +
      '<nav aria-label="Main">' + nav + '</nav>' +
      '<div class="side-foot"><span class="who">' + esc(user.name) + '</span><span>' + esc(user.role) + '</span>' +
      '<button type="button" id="sign-out">Sign out</button><button type="button" id="reset-data">Reset demo data</button></div>';
    shellEl.insertBefore(side, shellEl.firstChild);
    document.body.insertBefore(top, shellEl);
    var btn = $('.menu-btn', top);
    btn.addEventListener('click', function () {
      var open = shellEl.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
    $('#sign-out').addEventListener('click', function () {
      try { localStorage.removeItem(KEY_SESSION); } catch (e) { /* ignore */ }
      location.href = 'index.html';
    });
    $('#reset-data').addEventListener('click', function () {
      resetData();
      location.href = 'people.html?reset=1';
    });
  }

  // ---------- pages ----------
  var pages = {};

  pages.signin = function () {
    var form = $('#signin-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var u = form.username.value.trim().toLowerCase();
      var pw = form.password.value;
      var alert = $('#signin-error');
      if (!u || !pw) { alert.textContent = 'Enter your username and password.'; alert.hidden = false; return; }
      if (!USERS[u] || USERS[u].password !== pw) { alert.textContent = 'That username and password don’t match.'; alert.hidden = false; form.password.value = ''; form.password.focus(); return; }
      write(KEY_SESSION, u);
      var next = param('next');
      location.href = next && /^[a-z]+\.html(\?[\w=&%.-]*)?$/.test(next) ? next : 'people.html';
    });
    $('#reset-signin').addEventListener('click', function (e) {
      e.preventDefault(); resetData(); toast('Demo data is back to the start.');
    });
  };

  pages.people = function () {
    if (param('reset')) toast('Demo data is back to the start.');
    if (param('saved')) toast('Saved.');
    var list = people();
    $('#count').textContent = list.length;
    var body = $('#people-body');
    var search = $('#search');
    function draw() {
      var q = search.value.trim().toLowerCase();
      var shown = list.filter(function (p) {
        return !q || (p.name + ' ' + p.title + ' ' + p.department + ' ' + p.email).toLowerCase().indexOf(q) !== -1;
      });
      if (!shown.length) {
        body.innerHTML = '<tr><td colspan="4" class="empty">No one matches “' + esc(search.value.trim()) + '”.</td></tr>';
        return;
      }
      body.innerHTML = shown.map(function (p) {
        return '<tr>' +
          '<td><div class="person-cell"><img class="avatar" alt="" src="' + avatarSrc(p) + '"><div><a href="person.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a><div class="sub">' + esc(p.title) + '</div></div></div></td>' +
          '<td class="col-dept">' + esc(p.department) + '</td>' +
          '<td class="col-start">' + esc(fmtDate(p.startDate)) + '</td>' +
          '<td><span class="pill" style="background:' + STATUSES[p.status].color + '"></span></td>' +
          '</tr>';
      }).join('');
    }
    search.addEventListener('input', draw);
    draw();
    // Snag: this button does nothing at all.
    $('#export').addEventListener('click', function () { /* intentionally nothing */ });
  };

  pages.person = function () {
    var p = findPerson(param('id'));
    var main = $('#main');
    if (!p) {
      main.innerHTML = '<div class="card empty"><h1>We couldn’t find that person</h1><p>They may have been removed, or the demo data was reset.</p><a class="btn btn-primary" href="people.html">Back to people</a></div>';
      return;
    }
    if (param('saved')) toast('Profile saved.');
    document.title = p.name + ' · Pinecrest HR';
    $('#p-photo').src = avatarSrc(p);
    $('#p-name').textContent = p.name;
    $('#p-title').textContent = p.title;
    $('#p-email').textContent = p.email;
    $('#p-dept').textContent = p.department;
    $('#p-start').textContent = fmtDate(p.startDate);
    $('#p-status').style.background = STATUSES[p.status].color;
    $('#edit-link').href = 'edit.html?id=' + encodeURIComponent(p.id);
    $('#welcome').addEventListener('click', function () { toast('Welcome email sent to ' + p.email + '.'); });
  };

  pages.add = function () { personForm(null); };
  pages.edit = function () {
    var p = findPerson(param('id'));
    if (!p) {
      $('#main').innerHTML = '<div class="card empty"><h1>We couldn’t find that person</h1><p>They may have been removed, or the demo data was reset.</p><a class="btn btn-primary" href="people.html">Back to people</a></div>';
      return;
    }
    document.title = 'Edit ' + p.name + ' · Pinecrest HR';
    $('#edit-heading').textContent = 'Edit ' + p.name;
    $('#cancel').href = 'person.html?id=' + encodeURIComponent(p.id);
    personForm(p);
  };

  pages.reports = function () {
    var box = $('#report-box');
    function load() {
      box.innerHTML = '<div class="spinner" aria-label="Loading"></div><p class="sub" style="text-align:center">Crunching the numbers…</p>';
      setTimeout(function () {
        box.innerHTML = '<div class="err500" role="alert"><div class="code">500</div><h2>Internal Server Error</h2>' +
          '<p class="sub">The reports service failed to respond. Request ID: rq_7f3a91c2</p>' +
          '<button type="button" class="btn btn-ghost" id="retry">Try again</button></div>';
        $('#retry').addEventListener('click', load);
      }, 700);
    }
    load();
  };

  // ---------- the add / edit form ----------
  function personForm(existing) {
    var form = $('#person-form');
    var sel = form.department;
    sel.innerHTML = '<option value="">Choose a department</option>' + DEPARTMENTS.map(function (d) { return '<option>' + esc(d) + '</option>'; }).join('');
    var photo = existing ? existing.photo : '';
    if (existing) {
      form.name.value = existing.name;
      form.email.value = existing.email;
      form.title.value = existing.title;
      sel.value = existing.department;
      form.startDate.value = existing.startDate;
      form.status.value = existing.status;
    }
    var preview = $('#photo-preview img');
    function showPreview() { preview.src = photo || avatarSrc({ name: form.name.value || '?', photo: '' }); }
    showPreview();
    form.name.addEventListener('input', function () { if (!photo) showPreview(); });

    var status = $('#photo-status');
    function takeFile(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) { status.textContent = 'That isn’t an image. Try a JPG, PNG or GIF.'; return; }
      status.textContent = 'Reading ' + file.name + '…';
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var size = 256, c = document.createElement('canvas');
          var s = Math.min(img.width, img.height);
          c.width = size; c.height = size;
          c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          photo = c.toDataURL('image/jpeg', 0.85);
          showPreview();
          status.textContent = file.name + ' is ready. Save to keep it.';
          $('#remove-photo').hidden = false;
        };
        img.onerror = function () { status.textContent = 'We couldn’t read that image. Try another one.'; };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
    var picker = $('#photo-input');
    picker.addEventListener('change', function () { takeFile(picker.files[0]); });
    var drop = $('#dropzone');
    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'dragend'].forEach(function (t) {
      drop.addEventListener(t, function () { drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      e.preventDefault(); drop.classList.remove('over');
      takeFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    });
    var remove = $('#remove-photo');
    remove.hidden = !photo;
    remove.addEventListener('click', function () { photo = ''; picker.value = ''; showPreview(); status.textContent = 'Photo removed. Save to keep it that way.'; remove.hidden = true; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {
        name: form.name.value.trim(), email: form.email.value.trim().toLowerCase(), title: form.title.value.trim(),
        department: sel.value, startDate: form.startDate.value, status: form.status.value
      };
      var errors = {};
      if (v.name.length < 2) errors.name = 'Add their full name.';
      if (!v.email) errors.email = 'Add a work email.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'That email doesn’t look right.';
      else if (people().some(function (p) { return p.email === v.email && (!existing || p.id !== existing.id); })) errors.email = 'Someone already has that email.';
      if (!v.title) errors.title = 'Add a job title.';
      if (!v.department) errors.department = 'Pick a department.';
      if (!v.startDate) errors.startDate = 'Pick a start date.';
      else {
        var max = new Date(); max.setFullYear(max.getFullYear() + 1);
        if (new Date(v.startDate + 'T00:00:00') > max) errors.startDate = 'Start dates can be at most a year away.';
      }
      ['name', 'email', 'title', 'department', 'startDate'].forEach(function (f) {
        var wrap = form[f].closest('.field');
        var msg = $('.error', wrap);
        wrap.classList.toggle('has-error', !!errors[f]);
        form[f].setAttribute('aria-invalid', errors[f] ? 'true' : 'false');
        msg.textContent = errors[f] || '';
      });
      var keys = Object.keys(errors);
      var alert = $('#form-alert');
      if (keys.length) {
        alert.textContent = keys.length === 1 ? 'One thing to fix before saving.' : keys.length + ' things to fix before saving.';
        alert.hidden = false;
        form[keys[0]].focus();
        return;
      }
      alert.hidden = true;
      var list = people();
      var record;
      if (existing) {
        record = list.filter(function (p) { return p.id === existing.id; })[0];
        Object.keys(v).forEach(function (k) { record[k] = v[k]; });
        record.photo = photo;
      } else {
        record = Object.assign({ id: 'p' + Date.now().toString(36), photo: photo }, v);
        list.unshift(record);
      }
      try { savePeople(list); } catch (err) {
        alert.textContent = 'This browser is out of room for photos. Use a smaller image, or reset the demo data.';
        alert.hidden = false; return;
      }
      location.href = 'person.html?id=' + encodeURIComponent(record.id) + '&saved=1';
    });
  }

  // ---------- start ----------
  var page = document.body.getAttribute('data-page');
  if (page !== 'signin') {
    if (!session()) return; // the head guard is already sending this tab to sign-in
    shell(page === 'edit' || page === 'person' ? 'people' : page);
  }
  people();
  if (pages[page]) pages[page]();
}());
