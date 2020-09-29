# ReportPortal Cypress JUnit Agent

This Agent is created to satisfy requirements in our projects. JUnit reporting is configured on Cypress. Once Cypress tests gets executed, JUnit generates XML files containing test execution results. This agent will import those tests to report portal.
Note - As it was for specific projects, I am modifying JUnit generated XML files so that Feature ID can be visible inside Launches


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
export REPORTPORTAL_APIURL="http://ec2-14-222-29-254.ap-south-1.compute.amazonaws.com:8080"
export REPORTPORTAL_USERNAME="superadmin"
export REPORTPORTAL_PASSWORD="erebus"
export REPORTPORTAL_BASICAUTHKEY="Basic dAk7dWltYW5="
export REPORTPORTAL_PROJECTNAME="DEFAULT_PERSONAL"
export REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME="Launch"
export REPORTPORTAL_JUNIT_RESULTS_DIR_PATH="../../cypress/junitresults"
```
| Sr. | Variable | Comments |
| --- | --- | --- |
| 1 | REPORTPORTAL_APIURL | Report Portal API URL |
| 2 | REPORTPORTAL_USERNAME | Report Portal User Name |
| 3 | REPORTPORTAL_PASSWORD | Report Portal Password |
| 4 | REPORTPORTAL_BASICAUTHKEY | Open to report Portal. Press F12. Go to Network. Select XHR. Login to Report Portal. Analyze 'Token' Call. You will find Authorization parameter. https://github.com/reportportal/reportportal/issues/1151 |
| 5 | REPORTPORTAL_PROJECTNAME | Name of the Project |
| 6 | REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME | 28 |
| 7 | REPORTPORTAL_JUNIT_RESULTS_DIR_PATH | 28 |



3. Execute `node node_modules/ReportPortalCypressJUnitAgent/index.js`
