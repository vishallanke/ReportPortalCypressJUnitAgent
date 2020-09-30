# ReportPortal Cypress JUnit Agent

***WORK-IN-PROGRESS***

This Agent is created to satisfy requirements in our projects. JUnit reporting is configured on Cypress. Once Cypress tests gets executed, JUnit generates XML files containing test execution results. This agent will import those tests to report portal.
Note - As it was for specific projects, I am modifying JUnit generated XML files so that Feature ID can be visible inside Launches.
Currently, JUnit geenrated XML files are not compatible with report portal.
I am also making JUnit compatible with report portal

https://github.com/reportportal/reportportal/issues/612


Steps
1. Cypress JUnit Configuration
```
{
  "reporterEnabled": "mochawesome, mocha-junit-reporter",
  "mochawesomeReporterOptions": {
    "mochaFile": "cypress/results/results-[hash].xml",
    "overwrite": false,
    "html": true,
    "json": true,
    "timestamp": true
  },
  "mochaJunitReporterReporterOptions": {
    "mochaFile": "cypress/junitresults/junit-[hash].xml",
    "attachments": true,
    "rootSuiteTitle" : "Cypress Test",
    "testsuitesTitle" : "End to End Repo",
    "jenkinsMode" : true,
    "useFullSuiteTitle": true
  }
}
```

2. Set below Environment Variables inside CI/CD
```
export REPORTPORTAL_APIURL="http://ec2-25-467-123-124.ap-south-1.compute.amazonaws.com:8080"
export REPORTPORTAL_USERNAME="superadmin"
export REPORTPORTAL_PASSWORD="erebus"
export REPORTPORTAL_BASICAUTHKEY="Basic bAk7dWltYW5="
export REPORTPORTAL_PROJECTNAME="DEFAULT_PERSONAL"
export REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME="DeviceComponent"
export REPORTPORTAL_JUNIT_RESULTS_DIR_PATH="../../cypress/junitresults"
```
| Sr. | Variable | Comments |
| --- | --- | --- |
| 1 | REPORTPORTAL_APIURL | Report Portal API URL |
| 2 | REPORTPORTAL_USERNAME | Report Portal User Name |
| 3 | REPORTPORTAL_PASSWORD | Report Portal Password |
| 4 | REPORTPORTAL_BASICAUTHKEY | Open to report Portal. Press F12. Go to Network. Select XHR. Login to Report Portal. Analyze 'Token' Call. You will find Authorization parameter. https://github.com/reportportal/reportportal/issues/1151 |
| 5 | REPORTPORTAL_PROJECTNAME | Name of the Project |
| 6 | REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME | JUnit XML files will be copied inside this Directory. This will be part of name of your Launch |
| 7 | REPORTPORTAL_JUNIT_RESULTS_DIR_PATH | Location where Cypress JUnit files will be stored. We assume that it is inside `Cypress/junitresults` directory. Then, please provide value of this as `../../../../cypress/junitresults` |

3. `npm install reportportalcypressjunitagent`

4. Execute `node ./node_modules/@vishallanke/reportportalcypressjunitagent/index.js`


## Sample Logs after executing index.js

```
MINGW32 /d/Gitlab_Projects/ReportPortalCypressJUnitAgent/ReportPortalCypressJUnitAgent (master)
$ node index
Inside getCurrentFilenames
File => DeviceComponent
File => junit-1a17a883bc9964ca4afd9b96b0c9ae98.xml
File => junit-1dc9cb1b1eb616379c985a1c482eb452.xml
Successfully moved D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\ReportPortal
CypressJUnitAgent\cypress\junitresults\junit-1a17a883bc9964ca4afd9b96b0c9ae98.xm
l
Successfully moved D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\ReportPortal
CypressJUnitAgent\cypress\junitresults\junit-1dc9cb1b1eb616379c985a1c482eb452.xm
l
data length 2
childSuiteRequired is true
childSuiteRequired is true
XML file successfully updated D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\R
eportPortalCypressJUnitAgent\cypress\junitresults\DeviceComponent\junit-1a17a883
bc9964ca4afd9b96b0c9ae98.xml
XML file successfully updated D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\R
eportPortalCypressJUnitAgent\cypress\junitresults\DeviceComponent\junit-1dc9cb1b
1eb616379c985a1c482eb452.xml
Returning null from error
directoryList length 1
D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\ReportPortalCypressJUnitAgent\c
ypress\junitresults\DeviceComponent_2020-09-29T14-56-58.339Z.zip
ZIP Generated D:\Gitlab_Projects\ReportPortalCypressJUnitAgent\ReportPortalCypre
ssJUnitAgent\cypress\junitresults\DeviceComponent_2020-09-29T14-56-58.339Z.zip
number of directories to be zipped 1
Inside connectToReportPortalWithoutClient
Launch with id = 896ba762-b5b0-42e4-9839-ce1d41ef669b is successfully imported.

```