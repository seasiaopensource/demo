/**
 * Created by ranavivek2567 on 5/15/2017.
 */
(function () {
  'use strict';

  /**
   * Class WorkflowWorkflows
   * @property board
   * @property currentView
   * @property card
   * @property cardFilters
   * @property cardOptions
   * @property newListName
   * @property sortableListOptions
   * @property sortableCardOptions
   */
  class WorkflowTemplates {
    private board: any;
    private currentView: string;
    private card: any;
    private cardFilters: any;
    private cardOptions: any;
    private newListName: any;
    private sortableListOptions: any;
    private sortableCardOptions: any;
    private customerId;
    private userId;
    private parent: any;

    /**
     * define constructor for the class
     * @param $rootScope
     * @param zmWorkflowDialogService
     * @param msUtils
     * @param zmWorkflowService
     * @param zmUserService
     */
    constructor(private $rootScope, private zmUserService, private zmWorkflowDialogService, private msUtils, private zmWorkflowService) {
      this.readUser();
      this.currentView = 'board';
      this.cardFilters = {
        name   : '',
          labels : [],
          members: [],
          clear  : 'clear',
          isOn   : 'isOn'
      };
      this.card = {};
      this.cardOptions = {};
      this.newListName = '';
      this.sortableListOptions = {
        axis: 'x',
        delay: 75,
        distance: 7,
        items: '> .list-wrapper',
        handle: '.list-header',
        placeholder: 'list-wrapper list-sortable-placeholder',
        tolerance: 'pointer',
        start: function (event, ui) {
          let width = ui.item[0].children[0].clientWidth;
          let height = ui.item[0].children[0].clientHeight;
          ui.placeholder.css({
            'min-width': width + 'px',
            'width': width + 'px',
            'height': height + 'px'
          });
        }
      };
      this.sortableCardOptions = {
        appendTo: 'body',
        connectWith: '.list-cards',
        delay: 75,
        distance: 7,
        forceHelperSize: true,
        forcePlaceholderSize: true,
        handle: msUtils.isMobile() ? '.list-card-sort-handle' : false,
        helper: function (event, el) {
          return el.clone().addClass('list-card-sort-helper');
        },
        placeholder: 'list-card card-sortable-placeholder',
        tolerance: 'pointer',
        scroll: true,
        sort: function (event, ui) {
          let listContentEl = ui.placeholder.closest('.list-content');
          let boardContentEl = ui.placeholder.closest('#template');

          if (listContentEl) {
            let listContentElHeight = listContentEl[0].clientHeight,
              listContentElScrollHeight = listContentEl[0].scrollHeight;

            if (listContentElHeight !== listContentElScrollHeight) {
              let itemTop = ui.position.top,
                itemBottom = itemTop + ui.item.height(),
                listTop = listContentEl.offset().top,
                listBottom = listTop + listContentElHeight;

              if (itemTop < listTop + 25) {
                listContentEl.scrollTop(listContentEl.scrollTop() - 25);
              }

              if (itemBottom > listBottom - 25) {
                listContentEl.scrollTop(listContentEl.scrollTop() + 25);
              }
            }
          }
          if (boardContentEl) {
            let boardContentElWidth = boardContentEl[0].clientWidth;
            let boardContentElScrollWidth = boardContentEl[0].scrollWidth;
            if (boardContentElWidth !== boardContentElScrollWidth) {
              let itemLeft = ui.position.left,
                itemRight = itemLeft + ui.item.width(),
                boardLeft = boardContentEl.offset().left,
                boardRight = boardLeft + boardContentElWidth;
              if (itemLeft < boardLeft + 25) {
                boardContentEl.scrollLeft(boardContentEl.scrollLeft() - 25);
              }
              if (itemRight > boardRight) {
                boardContentEl.scrollLeft(boardContentEl.scrollLeft() + 25);
              }
            }
          }
        }
      };
    }

    /**
     * Function to get users list
     * IPromise for promise
     * @returns promise
     */
    readUser() {
      this.zmUserService.readUser()
        .then((user) => {
          this.customerId = user.customerId;
          this.userId = user.id;
          this.getWorkflowTemplates(this.customerId);
        });
    }

    /**
     * Get all AssignedTasksOverviewModel for reviewer
     * Call to zmWorkflowService to get workflows
     * @param customerId
     */
    getWorkflowTemplates(customerId: string): void {
      this.zmWorkflowService.getWorkflowTemplates(customerId).then((response) => {
        this.board = response;
      });
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
     * Function to open card dialog
     * @param ev
     * @param list
     */
    startWorkflow(event: any, workflowTemplate: any): void {
      this.zmWorkflowDialogService.openWorkflowtaskDialog(event, angular.copy(workflowTemplate))
        .finally(() => {
          this.parent.getAssignedAgentTasks();
          this.parent.getAssignedTasksToReview();
        });
    }

    /**
     * Function to open dummy dialog
     * @param ev
     */
    openEditTemplatesDialog(ev: any): void {
      this.zmWorkflowDialogService.openEditTemplatesDialog(ev).finally(() => { this.readUser(); });
    }

    editTemplate(ev: any, workflowTemplateId: any): void {
      this.zmWorkflowDialogService.openEditTemplatesDialog(ev, workflowTemplateId).finally(() => {this.readUser(); });
    }

    /**
     * Set task color according to the status of the task
     * @param task
     * @returns {any}
     */
    taskColor(task: any): string {
      if (task.status === 'DONE') {
        return 'a9db2c';
      } else if (task.status === 'OPEN') {
        return '#ff9f9f';
      } else if (task.status === 'WIP') {
        return '#dbd52c';
      } else {
        return 'a9db2c';
      }
    }

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
     * Delete workflow
     * Call to zmWorkflowService to get workflows
     * @param task
     */
    deleteWorkflowTemplate(task: any): void {
      this.$rootScope.loadingProgress = true;
      this.zmWorkflowService.deleteWorkflowTemplate(task, this.customerId).then(() => {
        this.$rootScope.loadingProgress = false;
        this.getWorkflowTemplates(this.customerId);
      });
    }

  }

  angular.module('workflow.components.workflowtemplates', [])
    .controller('zmWorkflowTemplatesController', WorkflowTemplates)
    .component('zmWorkflowTemplates', {
      templateUrl: 'app/main/workflow/components/workflowtemplates/workflowtemplates.html',
      require: {
        parent: '^^zmWorkflow'
      },
      controller: 'zmWorkflowTemplatesController as vm'
    });
})();
