// Original code from https://github.com/jamiewilson/form-to-google-sheets
// Updated for 2021 and ES6 standards

const sheetName = 'Sign'
const scriptProp = PropertiesService.getScriptProperties()



function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}



function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    //Logger.log(e.parameter)

    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));


    let resToSend = "";

    if (e.parameter["getList"]) {

      const sheetList = doc.getSheetByName('NameList');

      const listEmployees = sheetList.getRange(2, 1, sheetList.getLastRow() - 1, 1).getValues();
      const listEmployees2 = listEmployees.map((val) => {
        return val.toString();
      });
      // const listToSend = JSON.stringify(listEmployees2);

      resToSend = listEmployees2;


    } else {
      const sheet = doc.getSheetByName(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      const nextRow = sheet.getLastRow() + 1

      const newRow = headers.map(function (header) {
        // return header === 'Date' ? new Date() : e.parameter[header]
        if (header === "Date") return new Date();
        if (header === "Employee") return e.parameter["Employee"];
        if (header === "Signature") return SpreadsheetApp.newCellImage().setSourceUrl(e.parameter["Signature"]).build();
      })

      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

      resToSend = newRow;

    }
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': resToSend }))
      .setMimeType(ContentService.MimeType.JSON)
  }


  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

