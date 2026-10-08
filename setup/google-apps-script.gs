// Paste into Extensions > Apps Script in your private HARVVEST Enquiries sheet.
// Set SHEET_ID and ENQUIRY_DISPATCH_TOKEN in Project Settings > Script properties.
// Deploy as a Web app, execute as yourself, access Anyone.
function doPost(e) {
  var json = function(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); };
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('ENQUIRY_DISPATCH_TOKEN');
    if (!token || data.token !== token) return json({stored:false});
    if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 100 || typeof data.mobile !== 'string' || !/^[+\d ()-]{10,20}$/.test(data.mobile) || data.mobile.replace(/\D/g,'').length < 10 || ['HARVVEST Trading Program','Advanced Mastery Program','Help me choose'].indexOf(data.program) === -1 || ['Offline','Online'].indexOf(data.mode) === -1 || typeof data.message !== 'string' || data.message.length > 1500 || typeof data.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(data.requestId)) return json({stored:false});
    if (!lock.tryLock(5000)) return json({stored:false});
    var spreadsheet = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    var sheet = spreadsheet.getSheetByName('Enquiries') || spreadsheet.insertSheet('Enquiries');
    if (sheet.getLastRow() === 0) sheet.appendRow(['Date & Time','Full Name','Mobile Number','Interested Program','Learning Mode','Message','Request ID']);
    // Dedupe retry after a timeout: a request is written once.
    if (sheet.getLastRow() > 1 && sheet.getRange(2,7,sheet.getLastRow()-1,1).createTextFinder(data.requestId).matchEntireCell(true).findNext()) return json({stored:true});
    // Prefix user text to prevent spreadsheet formula execution and preserve phone numbers.
    var literal = function(value) { return "'" + String(value || ''); };
    sheet.appendRow([new Date(),literal(data.name.trim()),literal(data.mobile),literal(data.program),literal(data.mode),literal(data.message),data.requestId]);
    SpreadsheetApp.flush();
    return json({stored:true});
  } catch (error) { return json({stored:false}); }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}
