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
var NAMES = ['Guinguette','Saltimbanque','Farandole','Ritournelle','Bateleur','Bastringue','Baladin','Parvis','Liesse','Chapeau'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // En-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Horodatage', 'Pseudonyme'].concat(NAMES));
    }

    // Construire la ligne
    var row = [new Date(), data.pseudo];
    NAMES.forEach(function(name) {
      row.push(data[name] || '');
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
