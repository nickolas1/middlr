// import app-level services and main views
// import tabs                 from './tabs/main';
// import tabTemplate          from './tabs/template.html!text';

// create the result tracker app module
const middlr = angular.module('middlr', [
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.dsr',
    'ui.bootstrap',
    'smart-table',
    'xeditable',
    'modelFactory'
]);

resultTracker.config(ConfigBlock);
resultTracker.run(RunBlock);

// configure app states and API routing
ConfigBlock.$inject = ['$stateProvider', '$urlRouterProvider'];
function ConfigBlock($stateProvider, $urlRouterProvider) {
    
    // const getProjectList = ['ProjectModel', function(ProjectModel) {
    //     return ProjectModel.query();
    // }];
    
    const getFilterChoiceList = ['MetaModel', function(MetaModel) {
        return MetaModel.getFields();
    }];

    // set up app states
    const pageStates = [
        {
            name: 'home',
            url: '/',
            params: {},
            resolve: { // variables set here will be available to the state when it loads
                baseFriends: getBaseFriends
            }
        }
    ];
    // register the app states
    pageStates.forEach(pageState => { $stateProvider.state(pageState.name, pageState); });
}

RunBlock.$inject = ['$state', '$stateParams'];
function RunBlock($state, $stateParams) {
}

export default resultTracker;
