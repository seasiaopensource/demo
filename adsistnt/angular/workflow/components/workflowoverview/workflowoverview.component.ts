/**
 * Created by ranavivek2567 on 5/15/2017.
 */
(function () {
  'use strict';

  /**
   * Class WorkflowOverview
   * @property boardList
   * @property overview
   * @property overviewWorkflow
   * @property timeline
   * @property dtOptions
   * @property openDetails
   * @property selectedWorkflowEntry
   * @property showOpenDetails
   */
  class WorkflowOverview {
    private workflows: any;
    private dtOptions: any;
    private tasksToReview: any[];
    private agentTasks: any[];
    private userId: any;
    private customerId: any;

    private parent: any;

    /**
     * define constructor for the class@param zmWorkflowDialogService
     * @param zmWorkflowService
     * @param $rootScope
     * @param $mdDialog
     * @param zmUserService
     */
    constructor(private zmWorkflowDialogService, private zmWorkflowService, private $rootScope, private $mdDialog, private zmUserCacheService, private zmDialogService) {
      this.dtOptions = {
        dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        pagingType: 'simple',
        autoWidth: true,
        responsive: true
      };
      let user = this.zmUserCacheService.readUser();
      this.customerId = user.customerId;
      this.userId = user.id;
      this.loadWorkflows();
    }

    /**
     * Function to open dummy dialog
     * @param ev
     */
    openAddDummyDialog(ev: any): void {
      this.zmWorkflowDialogService.openAddDummyDialog(ev);
    }

    /**
     * Function to get workflows of user
     * Call to zmWorkflowService to get workflows
     * @param customerId
     */
    loadWorkflows(): void {
      this.$rootScope.loadingProgress = true;
      this.zmWorkflowService.getWorkflows(this.customerId)
        .then((response) => {
          this.workflows = response;
          this.parent.getAssignedTasksToReview();
          this.parent.getAssignedAgentTasks();
          this.$rootScope.loadingProgress = false;
        }).catch(() => {
        this.$rootScope.loadingProgress = false;
      });
    }

    deleteWorkflow(id: any): void {
      this.zmDialogService.showConfirm('Delete workflow', 'Do you really want to delete this workflow?', 'Yes', 'No')
        .then((answer) => {
          if (answer) {
            this.$rootScope.loadingProgress = true;
            this.zmWorkflowService.deleteWorkflow(id, this.customerId)
              .then(() => {
                this.loadWorkflows();
              })
              .catch(() => {})
              .finally(() => {
                this.$rootScope.loadingProgress = false;
              });
          }
        });
    }

    /**
     * Open Details of a entry
     * @param entry
     */
    openDetailsTab(entry: any): void {
      this.parent.selectTab(1, entry);
    }

    /**
     * Function to check the card overdue
     * @param cardDate
     * @return {boolean}
     */
    isOverdue(cardDate: any): boolean {
      return moment() > moment(cardDate, 'x');
    }

  }

  angular.module('workflow.components.workflowoverview', [])
    .controller('zmWorkflowOverviewController', WorkflowOverview)
    .component('zmWorkflowOverview', {
      templateUrl: 'app/main/workflow/components/workflowoverview/workflowoverview.html',
      controller: 'zmWorkflowOverviewController as vm',
      require: { parent: '^^zmWorkflow' }
    });
})();
