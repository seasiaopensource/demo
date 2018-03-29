/**
 * Created by ranavivek2567 on 5/15/2017.
 */
(function () {
  'use strict';

  class WorkflowDetails {
    private _selectedworkflowentry: any;
    private selectedWorkflow: any;
    private members: any[];
    private parent: any;

    private cid: string;

    /**
     * Class constructor
     * @param zmWorkflowService
     * @param zmWorkflowDialogService
     * @param $log
     * @param zmUserService
     * @param zmProfileUserService
     */
    constructor(private zmWorkflowService, private zmWorkflowDialogService, private $log, private zmUserCacheService, private zmProfileUserService, private zmDialogService, private $rootScope) {
      this.members = [];
      let user = this.zmUserCacheService.readUser();
      this.cid = user.customerId;
      this.userListing();
      this.getWorkflow();
    }

    /**
     * Getter for selectedworkflowentry
     * @returns {string}
     */
    get selectedworkflowentry(): any {
      return this._selectedworkflowentry;
    }

    /**
     * Setter for selectedtab
     * @param selectedworkflowentry
     */
    set selectedworkflowentry(selectedworkflowentry: any) {
      this._selectedworkflowentry = selectedworkflowentry;
    }

    getWorkflow() {
      this.zmWorkflowService.getWorkflow(this._selectedworkflowentry.workflowId, this.cid)
        .then((response) => {
          this.selectedWorkflow = response;
        }).catch((response) => {
        this.$log.debug(response);
      });
    }

    /**
     * Set task color according to the status of the task
     * @param task
     * @returns {any}
     */
    taskColor(task: any): string {
      if (task.status === 'DONE') {
        return '#a9db2c';
      } else if (task.status === 'OPEN') {
        return '#ff9f9f';
      } else if (task.status === 'WIP') {
        return '#dbd52c';
      }
    }

    /**
     * Function to open card dialog
     * @param ev
     * @param task
     */
    openCardDialog(ev: any, task: any): void {
      if (task.status !== 'DONE') {
        this.zmWorkflowDialogService.openCardDialog(ev, angular.copy(task), angular.copy(this.selectedWorkflow))
          .finally(() => {
            this.getWorkflow();
            this.parent.getAssignedAgentTasks();
            this.parent.getAssignedTasksToReview();
          });
      }
    }

    /**
     * Get done tasks
     * @param task
     * @returns {number}
     */
    getCheckItems(task): number {
      let count = 0;
      for (let item of task.checkboxItems) {
        if (item.done) {
          count++;
        }
      }
      return count;
    }

    /**
     * Get total tasks
     * @param task
     * @returns {number}
     */
    getTotalCheckItems(task): number {
      let count = 0;
      for (let item of task.checkboxItems) {
        count++;
      }
      return count;
    }

    /**
     * Check task list status
     * @param task
     * @returns {boolean}
     */
    checkChecklistStatus(task): boolean {
      let totalCount = 0;
      let count = 0;
      for (let item of task.checkboxItems) {
        totalCount++;
        if (item.done) {
          count++;
        }
      }
      if (totalCount === count) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Get customer name
     * @param customerId
     */
    getCustomerName(customerId): any {
      for (let user of this.members) {
        if (user.id === customerId) {
          return user.firstName;
        }
      }
    }

    /**
     * Function to get and pass user listing
     * call to zmProfileUserService to get user listing
     */
    userListing(): void {
      try {
        this.zmProfileUserService.readListOfUser()
          .then((response) => {
            this.members = response;
          }).catch((response) => {
          this.$log.debug(response);
        });
      } catch (e) {
        Raven.captureException(e);
      }
    }

    /**
     * Check if reviewer exist
     * @param task
     * @returns {boolean}
     */
    checkReviewer(task) {
      if (typeof task.reviewerIds === 'undefined') {
        return false;
      } else {
        if (Object.keys(task.reviewerIds).length === 0) {
          return false;
        } else {
          return true;
        }
      }
    }

    /**
     * Check if comments exist
     * @param task
     * @returns {boolean}
     */
    checkComment(task) {
      if (typeof task.comments === 'undefined') {
        return false;
      } else {
        if (Object.keys(task.comments).length === 0) {
          return false;
        } else {
          return true;
        }
      }
    }

    /**
     * Function to check the card overdue
     * @param cardDate
     */
    isOverdue(cardDate: any) {
      let taskDate = new Date(cardDate);
      let todaysDate = new Date();
      if (taskDate < todaysDate) {
        return true;
      } else {
        return false;
      }
    }

    deleteWorkflow(id: any): void {
      this.zmDialogService.showConfirm('Delete workflow', 'Do you really want to delete this workflow?', 'Yes', 'No')
        .then((answer) => {
          if (answer) {
            this.$rootScope.loadingProgress = true;
            this.zmWorkflowService.deleteWorkflow(id, this.cid)
              .then(() => {
                this.parent.getAssignedAgentTasks();
                this.parent.getAssignedTasksToReview();
                this.parent.selectTab(0);
              })
              .catch(() => {})
              .finally(() => {
                this.$rootScope.loadingProgress = false;
              });
          }
        });
    }

  }

  angular.module('workflow.components.workflowdetails', [])
    .controller('zmWorkflowDetailsController', WorkflowDetails)
    .component('zmWorkflowDetails', {
      templateUrl: 'app/main/workflow/components/workflowdetails/workflowdetails.html',
      require: {
        parent: '^^zmWorkflow'
      },
      bindings: {
        selectedworkflowentry: '=',
        cid: '<'
      },
      controller: 'zmWorkflowDetailsController as vm'
    });
})();

