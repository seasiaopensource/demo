/**
 * Created by Rohit Gupta on 11/08/2016.
 */

/**
 * @description Define and initializing components namespaces
 */
(function () {
  'use strict';
  angular.module('workflow.components', [
    'workflow.components.workflow',
    'workflow.components.workflowoverview',
    'workflow.components.workflowtemplates',
    'workflow.components.workflowdetails',
    'workflow.components.workflowagent',
    'workflow.components.workflowreviewer'
  ]);
})();
