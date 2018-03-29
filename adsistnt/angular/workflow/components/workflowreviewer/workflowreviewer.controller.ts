/**
 * Created by ranavivek2567 on 5/18/2017.
 */
(function () {
  'use strict';

  /**
   * Class WorkflowReviewer
   */
  class WorkflowReviewer {
    private tasksToReview: any[];
    private customerId: string;
    private userId: string;
    private members: any[];
    private parent: any;

    /**
     * Class constructor
     * @param zmWorkflowService
     * @param zmWorkflowDialogService
     * @param $log
     * @param zmUserService
     * @param zmProfileUserService
     */
    constructor(private zmWorkflowService, private zmWorkflowDialogService, private $log, private zmUserCacheService, private zmProfileUserService) {
      this.members = [];
      let user = this.zmUserCacheService.readUser();
      this.customerId = user.customerId;
      this.userId = user.id;
      this.getAssignedTasks();
    }

    /**
     * On constructor load
     */
    $onInit() {
      this.userListing();
    }

    getAssignedTasks() {
      this.getAllAssignedReviewerTasks(this.userId);
    }

    /**
     * Get all AssignedTasksOverviewModel for reviewer
     * Call to zmWorkflowService to get workflows
     * @param userId
     */
    getAllAssignedReviewerTasks(userId: any): void {
      this.zmWorkflowService.getAssignedTasksToReview(userId)
        .then((response) => {
          let workflows = angular.copy(response);
          console.log('workflows', workflows);
          workflows.forEach(workflow => { workflow.tasks = workflow.tasks.filter(task => task.status !== 'DONE'); });
          console.log('workflows', workflows);
          this.tasksToReview = angular.copy(workflows.filter(workflow => workflow.tasks.length > 0));
          console.log('workflows', this.tasksToReview);
        })
        .catch((e) => {
          Raven.captureException(e);
        });
    }

    /**
     * Function to open card dialog
     * @param ev
     * @param task
     */
    openCardDialog(ev: any, task: any, workflow: any): void {
      if (task.reviewReady) {
        this.zmWorkflowDialogService.openReviewtaskDialog(ev, angular.copy(task), angular.copy(workflow))
          .finally(() => {
            this.parent.getAssignedAgentTasks();
            this.parent.getAssignedTasksToReview();
            this.getAssignedTasks();
          });
      }
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
  }

  angular.module('workflow.components.workflowreviewer', [])
    .controller('zmWorkflowReviewerController', WorkflowReviewer)
    .component('zmWorkflowReviewer', {
      templateUrl: 'app/main/workflow/components/workflowreviewer/workflowreviewer.html',
      require: {
        parent: '^^zmWorkflow'
      },
      controller: 'zmWorkflowReviewerController as vm'
    });
})();

