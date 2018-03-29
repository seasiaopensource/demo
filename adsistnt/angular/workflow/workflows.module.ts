(function () {
  'use strict';
  angular
    .module('app.workflows', ['workflow.components'])
    .config(config)
    .run(run);
  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.workflows', {
      abstract: true,
      url: '/workflows',
      views: {
        'content@app': {
          templateUrl: 'app/main/workflow/workflows.html'
        }
      },
      bodyClass: 'workflows'
    }).state('app.workflows.overview', {
      url: '/overview'
    }).state('app.workflows.details', {
      url: '/:id/:uri'
    });
    // Navigation
    msNavigationServiceProvider.saveItem('dashboard.workflows', {
      title: 'Workflows',
      icon: 'icon-trello',
      state: 'app.workflows.overview',
      weight: 4
    });
  }
  /**
   * Execute function on run Inline Edit Configuration
   * @param editableThemes
   */
  function run(editableThemes) {
    editableThemes.default.submitTpl = '<md-button class="md-icon-button" type="submit" aria-label="save"><md-icon md-font-icon="icon-checkbox-marked-circle" class="md-accent-fg md-hue-1"></md-icon></md-button>';
    editableThemes.default.cancelTpl = '<md-button class="md-icon-button" ng-click="$form.$cancel()" aria-label="cancel"><md-icon md-font-icon="icon-close-circle" class="icon-cancel"></md-icon></md-button>';
  }
})();
