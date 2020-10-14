/*
  Work In Progress
*/
const axios = require('axios');
const FormData = require('form-data');
var chai = require('chai');
var expect = chai.expect;
const RestClient = require('./restclient');
var zipFolder = require('zip-folder');
const path = require('path');
var fs = require("fs"), parseString = require("xml2js").parseString, xml2js = require("xml2js");
var parser = new xml2js.Parser({ explicitArray: false });

// Report Portal Configuration
var FOLDER = process.env.REPORTPORTAL_JUNIT_RESULTS_DIR_PATH
// Need to change this in Future. Credentials will be removed in Future
const directoryPath = path.join(__dirname, "..", FOLDER);
var report_portal_host = `${process.env.REPORTPORTAL_APIURL}`
var projectName = `${process.env.REPORTPORTAL_PROJECTNAME}`
var projectSpecificAPIToken = `${process.env.REPORTPORTAL_API_TOKEN}`
var username = `${process.env.REPORTPORTAL_USERNAME}`
var password = `${process.env.REPORTPORTAL_PASSWORD}`
var basic_auth = `${process.env.REPORTPORTAL_BASICAUTHKEY}`
var route_report_portal_connect = `${report_portal_host}/uat/sso/oauth/token?grant_type=password&username=${username}&password=${password}`
var endpoint = `${report_portal_host}/api/v1`
let headers = {
  "Authorization": `${basic_auth}`,
  "Content-Type": "application/x-www-form-urlencoded"
}
var importEndpoint = `${endpoint}/${projectName}/launch/import`;

// TODO - Error Handling
getCurrentFilenames(function (getfilenameserror) {
  filebrowser(directoryPath, function (filebrowsererror, data, allDirectories) {
    generateXml(data, function (err) {
      zipDirectory(allDirectories, function (zipListOfDirectories) {
        console.log(`number of directories to be zipped ${zipListOfDirectories.length}`)
        connectToReportPortalWithApiToken(zipListOfDirectories)
      });
    });
  });
});


function filebrowser(dir, done) {
  console.log(`Inside filebrowser`)
  let results = [];
  let allDirectories = [];

  fs.readdir(dir, function (err, list) {
    if (err) return done(err);

    var pending = list.length;

    if (!pending) return done(null, results, allDirectories);

    list.forEach(function (file) {
      file = path.resolve(dir, file);

      fs.stat(file, function (err, stat) {
        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          // Add directory to array [comment if you need to remove the directories from the array]
          //results.push(file);
          allDirectories.push(file);

          filebrowser(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results, allDirectories);
          });
        } else {
          results.push(file);

          if (!--pending) done(null, results, allDirectories);
        }
      });
    });
  });
};

/*
Convert JUniXML Files into Report Portal Compatible Format
*/

function generateXml(fileNamesWithFullPath, done) {
  console.log(`Inside generateXml. Number of files ${fileNamesWithFullPath.length}`)
  var pending = fileNamesWithFullPath.length;

  //listing all files using forEach
  fileNamesWithFullPath.forEach(function (fullyQualifiedFilePath) {
    if (!pending) {
      console.log("Returning null at start")
      return done(null);
    }
    pending = fileNamesWithFullPath.length;
    //console.log(fullyQualifiedFilePath)
    fs.readFile(fullyQualifiedFilePath, "utf-8", function (err, data) {
      if (err) console.log(err);
      try {
        // we then pass the data to our method here
        parser.parseString(data, function (err, result) {
          if (err) console.log(err);
          // save our json to a variable
          var json = result;

          //console.log((json.testsuites.testsuite.length));
          var testsuites = [];
          var rootTestSuite;
          var levelOneTestSuiteAsFeature;
          rootTestSuite = json.testsuites.testsuite[0]
          var childSuiteRequired = false;

          if (json.testsuites.testsuite.length > 1) {
            if (json.testsuites.testsuite[1].testcase != undefined && (json.testsuites.testsuite[1].testcase.length > 0 || json.testsuites.testsuite[1].testcase.length == undefined)) {
              console.log(`ChildSuiteRequired is false`)
              childSuiteRequired = false;
            } else {
              console.log(`ChildSuiteRequired is true`)
              childSuiteRequired = true;
              levelOneTestSuiteAsFeature = json.testsuites.testsuite[1]
            }

            for (var i = 0; i < json.testsuites.testsuite.length; i++) {
              try {
                if (json.testsuites.testsuite[i].testcase.length > 0 || json.testsuites.testsuite[i].testcase.length == undefined) {
                  testsuites.push(json.testsuites.testsuite[i])
                }
              } catch (error) {
                // For other test case blocks exception will be raised and code will continue
              }
            }

            // if updated xml does not contain test case, then delete the file
            if (testsuites.length <= 0 || testsuites.length == undefined) {
              console.log(`XML file does not contain testcase tag. Delete this file ${fullyQualifiedFilePath}`);
              fs.unlinkSync(fullyQualifiedFilePath);
              if (!--pending) {
                return done(null)
              }
            } else {
              try {
                if (childSuiteRequired) {
                  json.testsuites = rootTestSuite
                  json.testsuites.testsuite = levelOneTestSuiteAsFeature
                  json.testsuites.testsuite.childtestsuite = []
                  for (var i = 0; i < testsuites.length; i++) {
                    json.testsuites.testsuite.childtestsuite.push(testsuites[i])
                  }
                } else {
                  json.testsuites = rootTestSuite
                  json.testsuites.testsuite = []
                  for (var i = 0; i < testsuites.length; i++) {
                    json.testsuites.testsuite.push(testsuites[i])
                  }
                }

                var builder = new xml2js.Builder();
                var xml = builder.buildObject(json);
                fs.writeFile(fullyQualifiedFilePath, xml, function (err, data) {
                  if (err) console.log(err);
                  console.log(`XML file successfully updated ${fullyQualifiedFilePath}`);
                  if (!--pending) {
                    console.log(`Returning from writeFile ${fullyQualifiedFilePath}`)
                    return done(null)
                  }
                });
              } catch (err) {
                console.log(`XML file updating error or file is already in correct format ${fullyQualifiedFilePath} ${err}`);
                if (!--pending) {
                  console.log(`Returning from writeFile error ${fullyQualifiedFilePath}`)
                  return done(null)
                }
              }
            }

            /*
                     // Future if required - Logic to split test cases into different XML files
                              var newFileFullPathWithName;

                               for (var i = 0; i < testsuite.length; i++) {
                                 json.testsuites.testsuite = (testsuite[i]);
                                 newFileFullPathWithName = fullyQualifiedFilePath;
                                 if (i > 0) {
                                   var onlyPath = path.dirname(fullyQualifiedFilePath);
                                   newFileFullPathWithName = path.join(onlyPath, uuid.v4() + ".xml");
                                 }

                                 try {
                                   var builder = new xml2js.Builder();
                                   var xml = builder.buildObject(json);
                                   fs.writeFile(newFileFullPathWithName, xml, function (err, data) {
                                     if (err) console.log(err);
                                     console.log("successfully written our update xml to file");
                                   });
                                 } catch (err) {
                                   console.log(err)
                                 }
                               }
           */

          } else {
            if (!--pending) {
              return done(null)
            }
          }
        });
      } catch (err) {
        console.log(err)
      }

    });
  });


}

/*
  ZIP Directory having JUnit XML Files
*/
function zipDirectory(directoryList, done) {
  console.log(`Inside zipDirectory. length ${directoryList.length}`)
  var zipFiles = []
  var pending = directoryList.length;

  directoryList.forEach(directoryNameWithPath => {
    if (!pending) return done(zipFiles);
    pending = directoryList.length;

    var lastDirectoryName = `${path.basename(directoryNameWithPath, '.js')}` + "_" + new Date().toISOString().replace(/:/g, '-') + ".zip";
    const directoryZipPath = path.join(directoryPath, lastDirectoryName);
    console.log(`${directoryZipPath}`)

    zipFolder(directoryNameWithPath, directoryZipPath, function (err) {
      if (err) {
        console.log(`Error from zipFolder ${directoryZipPath}`)
        if (!--pending) return done(zipFiles);
      } else {
        console.log(`ZIP Generated ${directoryZipPath}`)
        zipFiles.push(directoryZipPath)
        if (!--pending) return done(zipFiles);
      }
    });
  })
}

/*
  Connect to report portal using Rest Client
*/
function connectToReportPortalWithApiToken(zipListOfDirectories) {
  console.log(`Inside connectToReportPortalWithApiToken`)
    zipListOfDirectories.forEach(function (directoryZipPath, done) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(directoryZipPath));
      let importHeader = formData.getHeaders()
      importHeader['Accept'] = 'application/json'
      importHeader['Authorization'] = `bearer ${projectSpecificAPIToken}`
      RestClient.request('POST', importEndpoint, formData, { headers: importHeader }).then(response => {
        console.log(response.message)
      })
    })

}

/*
  Connect to report portal using Rest Client
*/
function connectToReportPortal(zipListOfDirectories) {
  console.log(`Inside connectToReportPortal`)

  RestClient.request('POST', route_report_portal_connect, {}, { headers: headers }).then(response => {
    var token = response.access_token

    zipListOfDirectories.forEach(function (directoryZipPath, done) {

      const formData = new FormData();
      formData.append('file', fs.createReadStream(directoryZipPath));
      let importHeader = formData.getHeaders()
      importHeader['Accept'] = 'application/json'
      importHeader['Authorization'] = `bearer ${token}`

      RestClient.request('POST', importEndpoint, formData, { headers: importHeader }).then(response => {
        console.log(response.message)
      })
    })
  })
}

/*
  Connect to report portal using Axios
*/
function connectToReportPortalWithoutClient(zipListOfDirectories) {
  console.log(`Inside connectToReportPortalWithoutClient`)
  axios.post(route_report_portal_connect, {}, {
    headers: headers
  }).then(res => {
    expect(res.status).to.equal(200)
    var token = `${res.data.access_token}`

    zipListOfDirectories.forEach(function (directoryZipPath) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(directoryZipPath));
      let importHeader = formData.getHeaders()
      importHeader['Accept'] = 'application/json'
      importHeader['Authorization'] = `bearer ${token}`

      axios.post(importEndpoint, formData, {
        // You need to use `getHeaders()` in Node.js because Axios doesn't automatically set the multipart form boundary in Node.
        headers: importHeader
      }).then(res => {
        expect(res.status).to.equal(200)
        console.log(res.data.message)
      }).catch(err => {
        console.log(err)
      })
    })

  }).catch(err => {
    console.log(err)
  })

}

/*
Read Dir Name as Vertical Name
  Create Directory - Fetch Name from Env Variable
  Move All files to Directory
*/
function getCurrentFilenames(done) {
  console.log(`Inside getCurrentFilenames`)

  // Read folder from env variable and create directory
  var JUNIT_APPLICATION_DIRECTORY_NAME = process.env.REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME;
  const updatedAppDirectory = path.join(directoryPath, JUNIT_APPLICATION_DIRECTORY_NAME);
  !fs.existsSync(updatedAppDirectory) && fs.mkdirSync(updatedAppDirectory);

  fs.readdir(directoryPath, (err, list) => {
    var pending = list.length;
    if (!pending) return done(null);

    list.forEach(function (fileName) {
      console.log(`File => ${fileName}`);
      var oldFilePath = path.join(directoryPath, fileName);
      var newFilePath = path.join(updatedAppDirectory, fileName);

      if (fs.lstatSync(oldFilePath).isFile()) {
        fs.rename(oldFilePath, newFilePath, function (err) {
          if (err) throw err
          console.log(`Successfully moved ${oldFilePath}`)
          if (!--pending) done(null);
        })
      } else {
        if (!--pending) done(null);
      }
    });
  });
}
