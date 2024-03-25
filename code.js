// Original code from https://github.com/jamiewilson/form-to-google-sheets
// Updated for 2021 and ES6 standards

const sheetNamePrefix = 'Sign '
const scriptProp = PropertiesService.getScriptProperties()

function test() {
  const obj = {};
  obj.parameter = ["getList"];
  const res = doPost(obj);
  console.log(res);
  Logger.log(res);
}

// save current table in property
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
    //if (true) {

      const ssName = SpreadsheetApp.openById("1xDqGouT9ySKS_4JDz8eq4LbHsJ6udrlgrPLcDWCx2Ag"); // open shared name list
      const sheetList = ssName.getSheetByName('sign in');

      const listEmployees = sheetList.getRange(2, 1, sheetList.getLastRow() - 1, 1).getValues();

      const nameImages = getImages();

      const listNamesImageId = listEmployees.map((val) => {
        const name = val.toString().trim();
        imageId = nameImages[name];
        return { name: name, imageId: imageId };
      });

      resToSend = listNamesImageId;

      Logger.log(JSON.stringify(resToSend));

    } else {
      const sheetName = sheetNamePrefix + e.parameter["SignDate"] + " Shift " + e.parameter["Shift"];

      console.log(e.parameter);
      console.log(sheetName);

      var sheet = doc.getSheetByName(sheetName);
      if (!sheet) {
        sheet = doc.insertSheet(sheetName);
        sheet.appendRow(["Date", "Employee", "Signature"]);
      }

      const nextRow = sheet.getLastRow() + 1;
      const img = SpreadsheetApp.newCellImage().setSourceUrl(e.parameter["Signature"]).build();
      const newRow = [new Date(), e.parameter["Employee"], img];
      //todo: make append row?
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': resToSend }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    Logger.log(e);
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

function getImages() {
  var folders = DriveApp.getFoldersByName("Avatar");
  const res = {};
  if (folders.hasNext()) {
    var folder = folders.next();
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      const fileName = file.getName()
      const name = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const id = file.getId()
      res[name] = id;
    }
  }
  return res;
}

function test2() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sh = activeSpreadsheet.getSheetByName("Test");

  const newRow = [new Date(), "aaa", 123];

  try {
    var folders = DriveApp.getFoldersByName("Avatar");
    if (folders.hasNext()) {
      var folder = folders.next();
      var files = folder.getFiles();
      while (files.hasNext()) {
        var file = files.next();
        const name = file.getName()
        const id = file.getId()
        const x = file.getUrl().toString();;
        Logger.log({ name, id, x });
      }




      //Logger.log(folder);
      //console.log(folder);
    }

    //sh.getRange(1, 1, 1, newRow.length).setValues([newRow]);
    //sh.getRange(1, 1).setValue(JSON.stringify(newRow));
  }
  catch (e) {
    console.log(e);
  }
}

function test3() {
  var e = { parameter: ["getList"] };
  doPost(e);
}


