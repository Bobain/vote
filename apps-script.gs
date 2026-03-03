/**
 * Google Apps Script — Backend pour le vote Jugement Majoritaire
 *
 * Setup :
 * 1. Créer un Google Sheet vierge
 * 2. Extensions → Apps Script → coller ce code
 * 3. Déployer → Nouvelle version → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copier l'URL et la coller dans index.html (VOTRE_URL_APPS_SCRIPT)
 */

// Colonnes fixes (l'ordre dans le Sheet ne dépend pas du shuffle côté page)
var NAMES = ['Guinguette','Saltimbanque','Ritournelle','Bateleur','Bastringue','Baladin','Parvis','Liesse','Chapeau'];
var MAX_VOTES_PER_IP = 4;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var ip = data.ip || 'inconnu';
    var pseudo = data.pseudo;

    // En-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Horodatage', 'Pseudonyme', 'IP'].concat(NAMES));
    }

    // Vérifications sur les votes existants
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existing = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
      var ipCount = 0;
      for (var i = 0; i < existing.length; i++) {
        if (existing[i][1] === pseudo) {
          return jsonResponse({ status: 'error', error: 'Ce pseudonyme a déjà été utilisé.' });
        }
        if (existing[i][2] === ip) {
          ipCount++;
        }
      }
      if (ip !== 'inconnu' && ipCount >= MAX_VOTES_PER_IP) {
        return jsonResponse({ status: 'error', error: 'Maximum ' + MAX_VOTES_PER_IP + ' votes par connexion atteint.' });
      }
    }

    // Construire la ligne
    var row = [new Date(), pseudo, ip];
    NAMES.forEach(function(name) {
      row.push(data[name] || '');
    });

    sheet.appendRow(row);

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
