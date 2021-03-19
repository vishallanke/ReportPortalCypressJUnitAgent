# ReportPortal Cypress JUnit Agent


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

2. Set below Environment Variables inside CI/CD. Below is just an example, you can change values as per your requirements
```
export REPORTPORTAL_APIURL="https://reporting.bt.com:443"
export REPORTPORTAL_USERNAME="superadmin"
export REPORTPORTAL_PASSWORD="erebus"
export REPORTPORTAL_BASICAUTHKEY="Basic dWk6dWltYW4="
export REPORTPORTAL_PROJECTNAME="PERSONAL"
export REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME="Android"
export REPORTPORTAL_JUNIT_RESULTS_DIR_PATH="../cypress/junitresults"
export REPORTPORTAL_API_TOKEN="d04b43b4-abcd-123r-aj76-aa2398619fd8"
export REPORTPORTAL_DEEPMERGE_NAME="PERSONAL"
export REPORTPORTAL_DEEPMERGE_ATTRIBUTES="Environment#Platform-INT#Schedule#Nightly#PipelineId#50982#ProjectId#982456"
export REPORTPORTAL_DEEPMERGE="false"
export REPORTPORTAL_DEEPMERGE_DESCRIPTION="<a href=\"https://code.siemens.com/horizon/platform-tests/horizon-qa/-/pipelines/8335450\">Go to Pipeline</a><br/><a href=\"https://code.siemens.com/horizon/platform-tests/horizon-qa/-/pipelines/8335450\">Go to Job</a><br/>"

```

| Sr. | Variable | Comments |
| --- | --- | --- |
| 1 | REPORTPORTAL_APIURL | Report Portal API Endpoint |
| 2 | REPORTPORTAL_PROJECTNAME | Name of the Project |
| 3 | REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME | JUnit XML files will be copied inside this Directory. Name of the Launch will start with this. This can be your test project name|
| 4 | REPORTPORTAL_API_TOKEN | API Token for Report Portal. |
| 5 | REPORTPORTAL_JUNIT_RESULTS_DIR_PATH | Location where Cypress JUnit files will be stored. We assume that it is inside `Cypress/junitresults` directory. Then, please provide value of this as `../cypress/junitresults` |
| 6 | REPORTPORTAL_DEEPMERGE_NAME | Report Portal Name of the Deep Merge |
| 7 | REPORTPORTAL_DEEPMERGE_ATTRIBUTES | Specify attribute for Deep Merge. It has to be hash seperated. For example, Environment#INT#Schedule#Nightly#Vertical#AccountManager#Project#E2ECrossVerticalQA |
| 8 | REPORTPORTAL_DEEPMERGE | Set value to true to perform deep merge. If you do not want to do deep merge, then set this flag to false. However, we recommend doing deep merge so that you can set Tags |
| 9 | REPORTPORTAL_DEEPMERGE_DESCRIPTION | For example, `<a href=\"https://code.abc.com/tests/qa/-/pipelines/8335450\">Go to Pipeline</a><br/><a href=\"https://code.abc.com/tests/qa/-/pipelines/8335450\">Go to Job</a><br/>` |


>>>
How to decide value of `REPORTPORTAL_JUNIT_RESULTS_DIR_PATH` ?
* Value will be `../cypress/junitresults`  for below project hierarchy
```
- project
  - cypress
    - junitresults
      - *.xml files
  - node_modules => Starting Point to navigate to junit directory
    - reportportalcypressjunitagent
      - index.js
```

`junitresults` contains all the XML files

- Consider `reportportalcypressjunitagent` as starting point. `../` will navigate you to `node_modules`. Again `../` will navigate you to `cypress` directory
>>>

3. `npm i reportportalcypressjunitagent` to install reportportalcypressjunitagent. If you are using yarn, then you can use `yarn add reportportalcypressjunitagentypressjunitagent`

4. Execute cypress test cases in background using run command. For example, ` ./node_modules/.bin/cypress run --env configFile=$TEST_ENV --headless --browser chrome`
`--headless` is mandatory

4. Execute `node ./node_modules/reportportalcypressjunitagent/index.js`

5. `Artifact` Job
- Alternatively, you can also create `reportportal.js` file on root and add `require ("reportportalcypressjunitagent")` in this file. In this case, you need to execute `node reportportal.js` command

- `node ./node_modules/reportportalcypressjunitagent/index.js` with `export REPORTPORTAL_DEEPMERGE="false"` will create launches and generates `report-portal-uuid.txt`.
`report-portal-uuid.txt` contains Launch UUID on new line. You can create artifact job, copy this file in your artifacts
```
11e7c1b1-b310-4dc5-a665-c6ccf4c6e033
5a7f8216-2224-4d27-9c64-525b0df7c0e8
704fbfdc-e442-4687-9b5f-23e0ad0acc2d
```

- `node ./node_modules/reportportalcypressjunitagent/index.js` with `export REPORTPORTAL_DEEPMERGE="true"` will read all Launch UUIDs, then call Deep Merge API to merge All the launches
While executing cypress test, you can copy junit artifacts as below
` - cp public/report_portal_copy_artifacts.sh $CYPRESS_DIR/report_portal_copy_artifacts.sh`
` - bash report_portal_copy_artifacts.sh "$artifactsPath" "$JUNIT_DOCKER_DIRECTORY" "$REPORTPORTAL_JUNIT_AV_DIRECTORY_NAME" "$JUNIT_RESULTS_PATH"`

Variables
```
  JUNIT_DOCKER_DIRECTORY: junitresults
  JUNIT_REPORT_DIR_NAME: cypress/junitresults
  JUNIT_RESULTS_PATH: ${CYPRESS_DIR}/${JUNIT_REPORT_DIR_NAME}
  JUNIT_DOCKER_DIRECTORY_ORIGINAL: junitresultsoriginal
  QA_ARTIFACTS_DIR: test_report
```

`report_portal_copy_artifacts.sh` contains
```
  echo "Report portal copy started"
  echo $1 $2 $3
  mkdir ${1}/$2
  mkdir ${1}/$2/$3
  cp -rf $4 $1/$2/$3 || echo "Error Copying JUnit Report Portal Compatible XML Files"
  echo "Report portal copy ended"
```

- Artifacts
```
publish-reportPortal:
  stage: publish-report
  image: $IMAGE
  script:
    - ls && buildDirectory=$(pwd)
    - artifactsPath=${buildDirectory}/${QA_ARTIFACTS_DIR}/${JUNIT_DOCKER_DIRECTORY}
    - cp public/reportportal_push_data.sh $CYPRESS_DIR/reportportal_push_data.sh
    - cp public/reportportal_push_all_data.sh $CYPRESS_DIR/reportportal_push_all_data.sh
    - cp -r $artifactsPath $CYPRESS_DIR
    - cd $CYPRESS_DIR && ls
    - bash reportportal_push_all_data.sh "$artifactsPath" "${CYPRESS_DIR}" "${JUNIT_DOCKER_DIRECTORY}"
  when: always
  only:
    refs:
      - master
      - schedules
    variables:
      - $PUBLISH_REPORT_PORTAL =~ /true/
  artifacts:
    expire_in: 1 week
    when: always
    paths:
      - test_report/junitresults # test_report/junitresults/DeviceComponent/junitresults contains original files generated by cypress tests cases

```

`reportportal_push_all_data.sh`
```
//This file will dynamcially identify all the folders and set ENV variables. PASS "$artifactsPath" "${CYPRESS_DIR} ${JUNIT_DOCKER_DIRECTORY}" as Arguments
echo "Report portal dynamic push data started"
echo $1 $2 $3
for d in "${1}"/*; do
    dir=${d} # ../junitresults/DeviceComponent
    echo "Directory is $dir"
    junitDirName=${d/$1\//}
    junitDirPath="../$3/$junitDirName/$3"
    eval "export REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME=${junitDirName}"
    echo "*** REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME is $REPORTPORTAL_JUNIT_APPLICATION_DIRECTORY_NAME ***"
    eval "export REPORTPORTAL_JUNIT_RESULTS_DIR_PATH=$junitDirPath"
    echo "*** REPORTPORTAL_JUNIT_RESULTS_DIR_PATH is $REPORTPORTAL_JUNIT_RESULTS_DIR_PATH ***"
    node reportportal.js || true
    cp -rf $2/$3 $1 || echo "Error Copying JUnit Report Portal Compatible XML Files"
done
echo "Report portal dynamic push data ended"
```

6. You can set  `export REPORTPORTAL_DEEPMERGE="true"` to perform deep merge. It help you to add tags for launches.
For example,

```
    if [ "${deepMerge}" == "true" ]; then
        pipeline="<a href=\"https://code.abc.com/horizon/tests/qa/-/pipelines/$CI_PIPELINE_ID\">Go to Pipeline</a><br/><a href=\"https://code.abc.com/tests/qa/-/jobs/$jobId\">Go to Job</a>"
        eval "export REPORTPORTAL_DEEPMERGE=true" && eval "export REPORTPORTAL_DEEPMERGE_NAME=$junitDirName" && eval "export REPORTPORTAL_DEEPMERGE_DESCRIPTION=\"$pipeline\"" && eval "export REPORTPORTAL_DEEPMERGE_ATTRIBUTES=\"Environment#$4#Schedule#$5#VerticalName#$junitDirName#Products#Services#Vertical#CrossVertical#PipelineId#$CI_PIPELINE_ID#ProjectId#$CI_PROJECT_ID\"" && node reportportal.js
    fi

```
