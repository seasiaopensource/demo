/**
 * Created by ranavivek2567 on 5/18/2017.
 */
(function () {
  'use strict';

  /**
   * Class WorkflowAgent
   */
  class WorkflowAgent {
    private agentTasks: any;
    private customerId: string;
    private userId: string;
    private agentEditableTasks: string;
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
      this.zmProfileUserService.readListOfUser()
        .then((response) => {
          this.members = response;
        }).catch((response) => {
        this.$log.debug(response);
      });
    }

    getAssignedTasks() {
      this.getAllAssignedAgentTasks(this.userId);
      this.getAllEditableAssignedAgentTasks(this.userId);
    }

    /**
     * Get all AssignedTasksOverviewModel for agent
     * Call to zmWorkflowService to get workflows
     * @param userId
     */
    getAllAssignedAgentTasks(userId: any): void {
      this.zmWorkflowService.getAssignedAgentTasks(userId)
        .then((response) => {
          let workflows = response;
          workflows.forEach(workflow => { workflow.tasks = workflow.tasks.filter(task => !task.reviewReady && task.status !== 'DONE'); });
          this.agentTasks = workflows.filter(workflow => workflow.tasks.length > 0);
        })
        .catch((e) => {
          toastr.error('Error loading workflows');
          Raven.captureException(e);
        });
    }

    /**
     * Get all Edittable task for agent
     * Call to zmWorkflowService to get workflows
     * @param userId
     */
    getAllEditableAssignedAgentTasks(userId: any): void {
      this.zmWorkflowService.getEditableAssignedAgentTasks(userId)
        .then((response) => {
          this.agentEditableTasks = response;
        })
        .catch(() => {
        });
    }

    /**
     * Function to open card dialog
     * @param ev
     * @param task
     */
    openCardDialog(ev: any, task: any, workflow: any): void {
      let ret = false;
      for (let editableTask of this.agentEditableTasks ) {
        if (editableTask === task.id) {
          ret = true;
        }
      }
      if (ret) {
        this.zmWorkflowDialogService.openAgenttaskDialog(ev, angular.copy(task), angular.copy(workflow))
          .finally(() => {
            this.getAssignedTasks();
            this.parent.getAssignedAgentTasks();
            this.parent.getAssignedTasksToReview();
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
     * Check if task is editable
     * @param task
     * @returns {boolean}
     */
    checkStatus(task): boolean {
      //return false;
      let ret = false;
      for (let editableTask of this.agentEditableTasks ) {
        if (editableTask === task.id) {
          return true;
        }
      }
      return ret;
    }

    /**
     * Set task color according to the label
     * @param label
     * @returns {any}
     */
    labelColor(label: any): string {
      let color = label.color;
      return 'md-' + color.toLowerCase() + '-bg';
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
    getCustomerName(customerId: string): any {
      if (this.members.length > 0) {
        for (let user of this.members) {
          if (user.id === customerId) {
            return user.firstName;
          }
        }
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

  angular.module('workflow.components.workflowagent', [])
    .controller('zmWorkflowAgentController', WorkflowAgent)
    .component('zmWorkflowAgent', {
      templateUrl: 'app/main/workflow/components/workflowagent/workflowagent.html',
      require: {
        parent: '^^zmWorkflow'
      },
      controller: 'zmWorkflowAgentController as vm'
    });
})();

