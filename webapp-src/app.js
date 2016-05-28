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
    const getBaseFriends = ['$http', '$q', function($http, $q) {
        //return baseFriends.friends;
        const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        let friends = baseFriends.friends;
        let key = apiKey.apiKey;
        let friendsReady = friends.map(friend => $http.get(geocodeUrl, {params: {address: friend.address, key: key}}));
        let d = $q.defer();
        $q.all(friendsReady).then(function(responses) {
            let friendsGeo = responses.map(function(response, idx) {
                let result = response.data.results[0];
                result.name = friends[idx].name;
                result.transport = friends[idx].transport;
                return result;
            });
            d.resolve(friendsGeo);
        }, function() { d.reject(); });
        return d.promise;
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
