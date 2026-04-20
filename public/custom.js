const mainPersonId = "936323c7-0f0d-4b2d-b623-c469666943fd"; // ID of person auto-selected when loaded

function formatDate(s) {
  if (!s) return '';
  const m = /^([^-]{4})-([^-]{1,2})-([^-]{1,2})$/.exec(s);
  if (!m) return s;
  const [, yyyy, mm, dd] = m;
  return `${dd.padStart(2, "0")}.${mm.padStart(2, "0")}.${yyyy}`;
}

function parseDateParts(s) {
  if (!s) return null;
  const str = String(s).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(str);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (isValidDateParts(year, month, day)) {
      return {year, month, day, precision: 'day'};
    }
    return null;
  }
  m = /^(\d{4})-(\d{1,2})$/.exec(str);
  if (m) {
    const year = Number(m[1]);
    return {year, precision: 'year'};
  }
  m = /^(\d{4})$/.exec(str);
  if (m) {
    const year = Number(m[1]);
    return {year, precision: 'year'};
  }
  return null;
}

function isValidDateParts(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function computeExactAge(birthParts, refDate) {
  let age = refDate.getFullYear() - birthParts.year;
  const refMonth = refDate.getMonth() + 1;
  const refDay = refDate.getDate();
  if (refMonth < birthParts.month || (refMonth === birthParts.month && refDay < birthParts.day)) {
    age -= 1;
  }
  return age;
}

function computeAge(birthParts, refParts, refDate) {
  if (!birthParts) return null;
  if (refParts && birthParts.precision === 'day' && refParts.precision === 'day') {
    const ref = new Date(refParts.year, refParts.month - 1, refParts.day);
    return computeExactAge(birthParts, ref);
  }
  if (refDate && birthParts.precision === 'day') {
    return computeExactAge(birthParts, refDate);
  }
  const refYear = refParts ? refParts.year : refDate?.getFullYear();
  if (!Number.isFinite(refYear)) return null;
  return refYear - birthParts.year;
}

function formatAgeLabel(age) {
  if (!Number.isFinite(age) || age < 0) return '';
  return `(${age})`;
}

function getAgeLabels(dd) {
  const birthParts = parseDateParts(dd.birth_date);
  const deathParts = parseDateParts(dd.death_date);
  let birthAgeLabel = '';
  let deathAgeLabel = '';

  if (birthParts && !dd.death_date) {
    const age = computeAge(birthParts, null, new Date());
    if (Number.isFinite(age) && age >= 0 && age < 100) {
      birthAgeLabel = formatAgeLabel(age);
    }
  }

  if (birthParts && deathParts) {
    const age = computeAge(birthParts, deathParts, null);
    deathAgeLabel = formatAgeLabel(age);
  }

  return {birthAgeLabel, deathAgeLabel};
}

function createCard(d) {
  const dd = d.data.data;
  const {birthAgeLabel, deathAgeLabel} = getAgeLabels(dd);
  let html = `<div class="card-inner card-image-rect">`;
  html += `<div class="person-icon">`;
  if (dd.avatar_url) {
    const avatarAltText = `${dd.nick_name ?? ''} ${dd.first_name ?? ''} ${dd.family_name ?? ''}`;
    html += `<img src="${dd.avatar_url}" alt="${avatarAltText}">`;
  } else {
    html += `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="fill: currentColor" data-icon="person">
        <g data-icon="person">
          <path d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 
            64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 
            0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"></path>
        </g>
      </svg>
  `;
  }
  html += `</div>`;
  html += `<div class="card-label">`;
  html += `<div class="person-name-line-1">
    <span class="person-nick-name">${dd.nick_name ?? ''}</span>
    <span class="person-first-name">${dd.first_name ?? ''}</span>
    <span class="person-second-names">${dd.second_names ?? ''}</span>
  </div>`;
  html += `<div class="person-name-line-2">`;
  html += `<span class="person-family-name">${dd.family_name ?? ''}</span> `;
  if (dd.birth_name) {
    html += `<span class="person-birth-name">geb. ${dd.birth_name ?? ''}</span>`;
  }
  html += `</div>`;
  html += `<div class="person-dates">`;
  if (dd.birth_date) {
    const agePart = birthAgeLabel ? ` ${birthAgeLabel}` : '';
    html += `<div class="person-birth-date">∗&nbsp;${formatDate(dd.birth_date)}${agePart} ${formatDate(dd.birth_place)}</div>`;
  }
  if (dd.marriage_date) {
    html += `<div class="person-marriage-date">⚭&nbsp;${formatDate(dd.marriage_date)} ${formatDate(dd.marriage_place)}</div>`;
  }
  if (dd.divorce_date) {
    html += `<div class="person-divorce-date">⚮&nbsp;${formatDate(dd.divorce_date)}</div>`;
  }
  if (dd.death_date) {
    const agePart = deathAgeLabel ? ` ${deathAgeLabel}` : '';
    html += `<div class="person-death-date">†&nbsp;${formatDate(dd.death_date)}${agePart} ${formatDate(dd.death_place)}</div>`;
  }
  html += `</div>`; // person-dates
  html += `<div class="person-note"><span class="clamp" title="${dd.note ?? ''}">${dd.note ?? ''}</span></div>`;
  html += `</div>`; // card-label
  html += `</div>`; // card-inner
  return html;
}

// Load JSON file
const res = await fetch("data/data.json");
if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
const data = await res.json();

function getSelectedIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get('id');
}

function updateUrlForId(id) {
  if (!id) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get('id') === id) return;
  url.searchParams.set('id', id);
  history.replaceState(null, '', url);
}

function getExistingPersonId(id) {
  if (!id) return null;
  return data.find(person => person.id === id) ? id : null;
}

function selectPersonById(id, {updateUrl = true, initial = false} = {}) {
  if (!id) return;
  f3Chart.updateMainId(id).updateTree({initial});
  if (updateUrl) updateUrlForId(id);
}

const initialPersonId = getExistingPersonId(getSelectedIdFromUrl()) || mainPersonId;

// Create family chart
const f3Chart = f3.createChart('#chart', data)
  .setTransitionTime(200)
  .setCardXSpacing(350)
  .setCardYSpacing(200)
  .setSingleParentEmptyCard(false)
  .setShowSiblingsOfMain(true)
  .setDuplicateBranchToggle(true)
  .setOrientationVertical()
  .setSortChildrenFunction((a, b) => a.data['birth_date'] === b.data['birth_date'] ? 0 : a.data['birth_date'] > b.data['birth_date'] ? 1 : -1);

f3Chart.setCardHtml()
  .setCardDisplay([
    ["nick_name", "first_name", "second_names"],
    ["family_name", "birth_name"],
    ["birth_date", "birth_place"],
    ["death_date", "death_place"],
    ["note"]
  ])
  .setCardInnerHtmlCreator(createCard)
  .setOnCardClick((event, datum) => {
    if (!datum || !datum.data) return;
    selectPersonById(datum.data.id);
  })
  .setCardDim({"height_auto": true})
  .setCardDim({"width": 300, "height": 120})
  .setMiniTree(true)
  .setStyle('imageRect')
  .setOnHoverPathToMain();

f3Chart
  .updateMainId(initialPersonId)
  .updateTree({initial: true});

updateUrlForId(initialPersonId);
