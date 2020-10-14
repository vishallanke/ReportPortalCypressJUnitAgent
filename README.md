# [WIP] ReportPortal Cypress JUnit Agent

***WORK-IN-PROGRESS***

## [WIP] Planned

[Work In Progress]
Send below details to report portal -
- Update Pending and Skipped tets cases
- Show Attachments
- Show `cy.log` or `console.log`

Currently, JUnit generated XML files are not compatible with report portal. Once Cypress tests gets executed, JUnit generates XML files containing test execution results. This agent will make JUnit XML files compatible to report portal and send them to report portal

* Reference of Defects
- https://github.com/cypress-io/cypress/issues/4245
- https://github.com/reportportal/reportportal/issues/612
- https://github.com/cypress-io/cypress/issues/3199


Steps
1. Configure JUnit in Cypress
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
export REPORTPORTAL_APIURL="http://ec2-32-234-123.south-1.compute.amazonaws.com:8080"
export REPORTPORTAL_PROJECTNAME="DEFAULT_PERSONAL"
export REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME="NameOfLaunch"
export REPORTPORTAL_JUNIT_RESULTS_DIR_PATH="../../cypress/junitresults"
export REPORTPORTAL_API_TOKEN="xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

```

| Sr. | Variable | Comments |
| --- | --- | --- |
| 1 | REPORTPORTAL_APIURL | Report Portal API Endpoint |
| 2 | REPORTPORTAL_PROJECTNAME | Name of the Project |
| 3 | REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME | JUnit XML files will be copied inside this Directory. Name of the Launch will start with this. |
| 4 | REPORTPORTAL_API_TOKEN | API Token for Report Portal. |
| 5 | REPORTPORTAL_JUNIT_RESULTS_DIR_PATH | Location where Cypress JUnit files will be stored. We assume that it is inside `Cypress/junitresults` directory. Then, please provide value of this as `../../cypress/junitresults` |

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

3. `npm install reportportalcypressjunitagent` to install reportportalcypressjunitagent. If you are using yarn, then you can use `yarn add @vishallanke/reportportalcypressjunitagentypressjunitagent`

4. Execute cypress test cases in background using run command. For example, ` ./node_modules/.bin/cypress run --env configFile=$TEST_ENV --headless --browser chrome`

4. Execute `node ./node_modules/@vishallanke/reportportalcypressjunitagent/index.js`

Alternatively, you can also create `reportportal.js` file on root and add `require ("@vishallanke/reportportalcypressjunitagent/")` in this file. In this case, you need to execute `node reportportal.js` command