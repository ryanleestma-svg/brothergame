/**
 * Lender Tracker — Google Sheets backend (Apps Script Web App)
 * ------------------------------------------------------------
 * This turns a normal Google Sheet into a shared, live database for the
 * Lender Tracker app. All 2-3 teammates point the app at ONE deployment
 * URL and edit the same Sheet in real time. No API keys, no extra accounts.
 *
 * SETUP (about 3 minutes — see LENDER-TRACKER-SETUP.md for screenshots-in-words):
 *  1. Create a new Google Sheet (sheets.new).
 *  2. Extensions -> Apps Script.
 *  3. Delete anything in the editor, paste THIS entire file, click Save.
 *  4. Click Deploy -> New deployment -> type "Web app".
 *       - Description: Lender Tracker API
 *       - Execute as: Me
 *       - Who has access: Anyone   (this only exposes YOUR sheet's data via the
 *         random URL; only people you share the URL with can reach it)
 *  5. Click Deploy, authorize when asked, and COPY the Web app URL.
 *  6. Paste that URL into the Lender Tracker app's Settings screen. Done.
 *
 * The tabs (Lenders / Activities / Tasks / Config) are created automatically
 * the first time the app connects, and they stay human-readable so you can
 * also look at / edit the raw Sheet whenever you want.
 */

var HEADERS = {
  Lenders: ['id','name','institution','type','contact','email','phone','stage','priority','owner','amount','probability','lastContact','nextAction','nextActionDate','notes','createdAt','updatedAt'],
  Activities: ['id','lenderId','date','type','user','summary','createdAt'],
  Tasks: ['id','title','date','lenderId','assignee','done','doneAt','notes','createdAt','updatedAt']
};

function doGet(e) {
  return handle(e, false);
}

function doPost(e) {
  return handle(e, true);
}

function handle(e, isPost) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    ensureSheets();

    var action, payload;
    if (isPost) {
      var body = JSON.parse(e.postData.contents || '{}');
      action = body.action;
      payload = body.payload;
    } else {
      action = (e && e.parameter && e.parameter.action) || 'getAll';
      payload = {};
    }

    var result;
    switch (action) {
      case 'ping':          result = { ok: true, pong: true }; break;
      case 'getAll':        result = { ok: true, data: getAll() }; break;
      case 'upsertLender':  result = { ok: true, item: upsertRow('Lenders', payload) }; break;
      case 'deleteLender':  result = { ok: true, deleted: deleteLender(payload.id) }; break;
      case 'addActivity':   result = { ok: true, item: upsertRow('Activities', payload) }; break;
      case 'deleteActivity':result = { ok: true, deleted: deleteRow('Activities', payload.id) }; break;
      case 'upsertTask':    result = { ok: true, item: upsertRow('Tasks', payload) }; break;
      case 'deleteTask':    result = { ok: true, deleted: deleteRow('Tasks', payload.id) }; break;
      case 'saveConfig':    result = { ok: true, config: saveConfig(payload) }; break;
      case 'bulkUpsertLenders': result = { ok: true, count: bulkUpsertLenders(payload.items) }; break;
      default:              result = { ok: false, error: 'Unknown action: ' + action };
    }
    return json(result);
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Sheet setup ---------- */

function ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
    } else if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sh.setFrozenRows(1);
    }
  });
  var cfg = ss.getSheetByName('Config');
  if (!cfg) {
    cfg = ss.insertSheet('Config');
    cfg.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
    cfg.setFrozenRows(1);
    cfg.getRange(2, 1, 3, 2).setValues([
      ['teamMembers', JSON.stringify(['Me', 'Teammate 1', 'Teammate 2'])],
      ['targetMin', '20'],
      ['targetMax', '50']
    ]);
  }
  // Remove the default empty "Sheet1" if it is untouched.
  var s1 = ss.getSheetByName('Sheet1');
  if (s1 && ss.getSheets().length > 1 && s1.getLastRow() === 0) {
    ss.deleteSheet(s1);
  }
}

/* ---------- Read ---------- */

function getAll() {
  return {
    lenders: sheetToObjects('Lenders'),
    activities: sheetToObjects('Activities'),
    tasks: sheetToObjects('Tasks'),
    config: readConfig()
  };
}

function sheetToObjects(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.join('') === '') continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;
      obj[key] = normalize(row[c]);
    }
    if (obj.id) out.push(obj);
  }
  return out;
}

function normalize(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return v;
}

function readConfig() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  var values = sh.getDataRange().getValues();
  var cfg = {};
  for (var r = 1; r < values.length; r++) {
    if (values[r][0]) cfg[values[r][0]] = values[r][1];
  }
  var team = [];
  try { team = JSON.parse(cfg.teamMembers || '[]'); } catch (e) { team = []; }
  return {
    teamMembers: team,
    targetMin: Number(cfg.targetMin || 20),
    targetMax: Number(cfg.targetMax || 50)
  };
}

/* ---------- Write ---------- */

function upsertRow(sheetName, payload) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var headers = HEADERS[sheetName];
  var now = new Date().toISOString();

  if (!payload.id) payload.id = Utilities.getUuid();
  if (headers.indexOf('createdAt') > -1 && !payload.createdAt) payload.createdAt = now;
  if (headers.indexOf('updatedAt') > -1) payload.updatedAt = now;

  var rowIndex = findRowById(sh, payload.id);
  var rowValues = headers.map(function (h) {
    return payload[h] === undefined || payload[h] === null ? '' : payload[h];
  });

  if (rowIndex > 0) {
    // Preserve createdAt already stored.
    var existing = sh.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    var createdIdx = headers.indexOf('createdAt');
    if (createdIdx > -1 && existing[createdIdx]) rowValues[createdIdx] = existing[createdIdx];
    sh.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sh.appendRow(rowValues);
  }
  return payload;
}

function bulkUpsertLenders(items) {
  var n = 0;
  (items || []).forEach(function (it) { upsertRow('Lenders', it); n++; });
  return n;
}

function deleteRow(sheetName, id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var rowIndex = findRowById(sh, id);
  if (rowIndex > 0) { sh.deleteRow(rowIndex); return true; }
  return false;
}

function deleteLender(id) {
  deleteRow('Lenders', id);
  // Cascade: remove that lender's activities and tasks.
  cascadeDelete('Activities', 'lenderId', id);
  cascadeDelete('Tasks', 'lenderId', id);
  return true;
}

function cascadeDelete(sheetName, colName, value) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var headers = HEADERS[sheetName];
  var col = headers.indexOf(colName);
  if (col < 0) return;
  var values = sh.getDataRange().getValues();
  for (var r = values.length - 1; r >= 1; r--) {
    if (values[r][col] === value) sh.deleteRow(r + 1);
  }
}

function findRowById(sh, id) {
  var ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (var r = 1; r < ids.length; r++) {
    if (ids[r][0] === id) return r + 1;
  }
  return -1;
}

function saveConfig(payload) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  var map = {
    teamMembers: JSON.stringify(payload.teamMembers || []),
    targetMin: String(payload.targetMin),
    targetMax: String(payload.targetMax)
  };
  var values = sh.getDataRange().getValues();
  var seen = {};
  for (var r = 1; r < values.length; r++) {
    var key = values[r][0];
    if (map[key] !== undefined) {
      sh.getRange(r + 1, 2).setValue(map[key]);
      seen[key] = true;
    }
  }
  Object.keys(map).forEach(function (key) {
    if (!seen[key]) sh.appendRow([key, map[key]]);
  });
  return readConfig();
}
