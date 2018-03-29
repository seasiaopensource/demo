/**
 * Created by ranavivek2567 on 5/15/2017.
 */
(function () {
  'use strict';

  /**
   * This class handles all the functions of the workflow main frame component
   * @property currentView
   * @property boardSelectorVisible
   * @property clearFilters
   */
   class Workflow {
    private userId: string;
    private customerId: string;

    private tasksToReview: any[];
    private tasksToAttend: any[];

    private selectedTab: number;
    private selectedEntry: any;
    private showDetails: boolean;

    /**
     * define constructor for the class
     * @param zmUserCacheService
     * @param zmWorkflowService
     */
    constructor(private zmUserCacheService, private zmWorkflowService) {
      this.selectedTab = 0;
      this.selectedEntry = {};
      this.showDetails = false;

      this.tasksToAttend = [];
      this.tasksToReview = [];

      let user = this.zmUserCacheService.readUser();
      this.userId = user.id;
      this.customerId = user.customerId;
    }

    $onInit() {
      this.getAssignedTasksToReview();
      this.getAssignedAgentTasks();
    }

    selectTab(tab: number, entry?: any): void {
      if (!entry) {
        this.showDetails = false;
        this.selectedEntry = {};
      } else {
        this.showDetails = true;
        this.selectedEntry = angular.copy(entry);
      }
      this.selectedTab = tab;
    }

    hideDetails(): void {
      this.showDetails = false;
      this.selectedEntry = {};
    }

    getAssignedTasksToReview(): void {
        this.zmWorkflowService.getAssignedTasksToReview(this.userId)
          .then((response) => {
            let workflows = response;
            workflows.forEach(workflow => { workflow.tasks = workflow.tasks.filter(task => task.status !== 'DONE'); });
            this.tasksToReview = workflows.filter(workflow => workflow.tasks.length > 0);
          });
    }

    getAssignedAgentTasks(): void {
        this.zmWorkflowService.getAssignedAgentTasks(this.userId)
          .then((response) => {
            let workflows = response;
            workflows.forEach(workflow => { workflow.tasks = workflow.tasks.filter(task => !task.reviewReady && task.status !== 'DONE'); });
            this.tasksToAttend = workflows.filter(workflow => workflow.tasks.length > 0);
          });
    }
  }

  angular.module('workflow.components.workflow', [])
    .controller('zmWorkflowController', Workflow)
    .component('zmWorkflow', {
      templateUrl: 'app/main/workflow/components/workflow/workflow.html',
      controller: 'zmWorkflowController as vm'
    });
})();
