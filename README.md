# [WIP] ReportPortal Cypress JUnit Agent

***WORK-IN-PROGRESS***

## Current Limitations

- Pending and Skipped tets cases won't get updated to report portal
- Attachments are not visible
- `cy.log` or `console.log` not visible. Failure logs will be visible.

This Agent is created to satisfy requirements in our projects. JUnit reporting is configured on Cypress. Once Cypress tests gets executed, JUnit generates XML files containing test execution results. This agent will import those tests to report portal.
Note - As it was for specific projects, I am modifying JUnit generated XML files so that Feature ID can be visible inside Launches.
Currently, JUnit generated XML files are not compatible with report portal.
I am also making JUnit compatible with report portal

- https://github.com/cypress-io/cypress/issues/4245
- https://github.com/reportportal/reportportal/issues/612


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
| 7 | REPORTPORTAL_JUNIT_RESULTS_DIR_PATH | Location where Cypress JUnit files will be stored. We assume that it is inside `Cypress/junitresults` directory. Then, please provide value of this as `../../cypress/junitresults` |

>>>
How to decide value of `REPORTPORTAL_JUNIT_RESULTS_DIR_PATH` ?
* Value will be `../../cypress/junitresults`  for below project hierarchy
```
- project
  - cypress
    - junitresults
      - *.xml files
  - node_modules
    - @vishallanke
      - reportportalcypressjunitagent
        - index.js
```

- Consider `reportportalcypressjunitagent` as starting point. `../` will navigate you to `node_modules`. Again `../` will navigate you to `cypress` directory
>>>

3. `npm install reportportalcypressjunitagent`

4. Execute `node ./node_modules/@vishallanke/reportportalcypressjunitagent/index.js`
