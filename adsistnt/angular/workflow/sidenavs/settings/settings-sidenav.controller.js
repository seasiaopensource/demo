(function ()
{
    'use strict';

    angular
        .module('app.workflows')
        .controller('SettingsSidenavController', SettingsSidenavController);

    /** @ngInject */
    function SettingsSidenavController($mdColorPalette)
    {
        var vm = this;

        // Data
      vm.board = {
        'id': 'ov-global',
        'name': 'Workflows',
        'uri': 'global-board',
        'settings': {
          'color': 'blue-grey',
          'subscribed': false,
          'cardCoverImages': true
        },
        'lists': [
          {
            'id': '56027cf5a2ca3839a5d36103',
            'name': 'Add New Product',
            'idCards': [
              '5603a2a3cab0c8300f6096b3',
              '5603a2a3cab0c8300f609600',
              '5603a2a3cab0c8300f609601',
              '5603a2a3cab0c8300f609602'
            ]
          },
          {
            'id': '56127cf2a2ca3539g7d36103',
            'name': 'Add new Project',
            'idCards': [
              '5637273da9b93bb84743a0f9'
            ]
          },
          {
            'id': '56128cf2a2ca3539g7d36103',
            'name': 'Add new Share',
            'idCards': [
              '5637273da9b93bb84743a123'
            ]
          }

        ],
        'cards': [
          {
            'id': '5603a2a3cab0c8300f6096b3',
            'name': 'Choose Product Profile',
            'description': '',
            'idAttachmentCover': '',
            'idMembers': [],
            'idReviewer': [],
            'idLabels': [],
            'attachments': [],
            'subscribed': false,
            'checklists': [],
            'checkItems': 0,
            'checkItemsChecked': 0,
            'comments': [],
            'activities': [],
            'due': null
          },
          {
            'id': '5603a2a3cab0c8300f609600',
            'name': 'Choose Data Model',
            'description': '',
            'idAttachmentCover': '',
            'idMembers': [],
            'idReviewer': [],
            'idLabels': [],
            'attachments': [],
            'subscribed': false,
            'checklists': [],
            'checkItems': 0,
            'checkItemsChecked': 0,
            'comments': [],
            'activities': [],
            'due': null
          },
          {
            'id': '5603a2a3cab0c8300f609601',
            'name': 'Create new Product',
            'description': '',
            'idAttachmentCover': '',
            'idMembers': [],
            'idReviewer': [],
            'idLabels': [],
            'attachments': [],
            'subscribed': false,
            'checklists': [],
            'checkItems': 0,
            'checkItemsChecked': 0,
            'comments': [],
            'activities': [],
            'due': null
          },
          {
            'id': '5603a2a3cab0c8300f609602',
            'name': 'Upload Assets',
            'description': '',
            'idAttachmentCover': '',
            'idMembers': [],
            'idReviewer': [],
            'idLabels': [],
            'attachments': [],
            'subscribed': false,
            'checklists': [],
            'checkItems': 0,
            'checkItemsChecked': 0,
            'comments': [],
            'activities': [],
            'due': null
          },
          {
            'id': '5637273da9b93bb84743a0f9',
            'name': 'Share',
            'description': '',
            'idAttachmentCover': '',
            'idMembers': [],
            'idReviewer': [],
            'idLabels': [],
            'attachments': [],
            'subscribed': true,
            'checklists': [],
            'checkItems': 0,
            'checkItemsChecked': 0,
            'comments': [],
            'activities': [],
            'due': null
          }
        ],
        'members': [
          {
            'id': '56027c1930450d8bf7b10758',
            'name': 'Alice Freeman',
            'avatar': 'assets/images/avatars/alice.jpg'
          },
          {
            'id': '26027s1930450d8bf7b10828',
            'name': 'Danielle Obrien',
            'avatar': 'assets/images/avatars/danielle.jpg'
          },
          {
            'id': '76027g1930450d8bf7b10958',
            'name': 'James Lewis',
            'avatar': 'assets/images/avatars/james.jpg'
          },
          {
            'id': '36027j1930450d8bf7b10158',
            'name': 'Vincent Munoz',
            'avatar': 'assets/images/avatars/vincent.jpg'
          }
        ],
        'reviewer': [
          {
            'id': '56027c1930450d8bf7b10758',
            'name': 'Alice Freeman',
            'avatar': 'assets/images/avatars/alice.jpg'
          },
          {
            'id': '26027s1930450d8bf7b10828',
            'name': 'Danielle Obrien',
            'avatar': 'assets/images/avatars/danielle.jpg'
          },
          {
            'id': '76027g1930450d8bf7b10958',
            'name': 'James Lewis',
            'avatar': 'assets/images/avatars/james.jpg'
          },
          {
            'id': '36027j1930450d8bf7b10158',
            'name': 'Vincent Munoz',
            'avatar': 'assets/images/avatars/vincent.jpg'
          }
        ],
        'labels': [
          {
            'id': '56027e4119ad3a5dc28b36cd',
            'name': 'Design',
            'color': 'red'
          },
          {
            'id': '5640635e19ad3a5dc21416b2',
            'name': 'App',
            'color': 'blue'
          },
          {
            'id': '6540635g19ad3s5dc31412b2',
            'name': 'Feature',
            'color': 'green'
          }
        ]
      };
        vm.palettes = $mdColorPalette;
        vm.selectedMenu = 'Settings';

        // Methods

        ////////

    }
})();
