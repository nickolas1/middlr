// import app-level services and main views
import map                  from './map/main';
import mapTemplate          from './map/template.html!text';

import baseFriends     from './baseFriends.json!';
import apiKey          from './apiKey.json!';

// create the result tracker app module
const middlr = angular.module('middlr', [
    map.name,
    'ngMap',
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.dsr',
    'ui.bootstrap',
    'smart-table',
    'xeditable',
    'modelFactory'
]);

middlr.config(ConfigBlock);
middlr.run(RunBlock);

// configure app states and API routing
ConfigBlock.$inject = ['$stateProvider', '$urlRouterProvider'];
function ConfigBlock($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');
    
    // const getProjectList = ['ProjectModel', function(ProjectModel) {
    //     return ProjectModel.query();
    // }];
    const getBaseFriends = [function() {
        return baseFriends.friends;
    }];
    const getApiKey = [function() {
        return apiKey.apiKey;
    }];

    // set up app states
    const pageStates = [
        {
            name: 'home',
            url: '/',
            params: {},
            resolve: { // variables set here will be available to the state when it loads
                friends: getBaseFriends,
                apiKey: getApiKey
            },
            views: {
                '': {
                    template: mapTemplate,
                    controller: 'MapCtrl as ctrl'
                }
            }
        }
    ];
    // register the app states
    pageStates.forEach(pageState => { $stateProvider.state(pageState.name, pageState); });
}

RunBlock.$inject = ['$state', '$stateParams'];
function RunBlock($state, $stateParams) {
}

export default middlr;
