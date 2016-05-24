// import app-level services and main views 
import tabs                 from './tabs/main';
import tabTemplate          from './tabs/template.html!text';
import queryFiltersTemplate from './tabs/query-filters-template.html!text';
import map                  from './map/main';
import mapTemplate          from './map/template.html!text';
import results              from './results/main';
import resultsTemplate      from './results/template.html!text';
import upload               from './upload/main';
import uploadTemplate       from './upload/template.html!text';

import boundsHelper         from './common/mapBoundsHelper/main';
import filterList           from './filters/filter-list';
import editableTable        from './editable-table/editable-table';
import resultTrackerApi     from './common/api/main';
import apiHelper            from './common/api/helper';


// create the result tracker app module
const resultTracker = angular.module('resultTracker', [
    tabs.name,
    map.name,
    results.name,
    upload.name,
    filterList.name,
    editableTable.name,
    resultTrackerApi.name,
    apiHelper.name,
    boundsHelper.name,
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.dsr',
    'ui.bootstrap',
    'ui-leaflet',
    'smart-table',
    'xeditable',
    'modelFactory'
]);

resultTracker.config(ConfigBlock);
resultTracker.run(RunBlock);

// configure app states and API routing
ConfigBlock.$inject = ['$stateProvider', '$urlRouterProvider', '$stickyStateProvider', '$modelFactoryProvider', '$httpProvider'];
function ConfigBlock($stateProvider, $urlRouterProvider, $stickyStateProvider, $modelFactoryProvider, $httpProvider) {
    
    $modelFactoryProvider.defaultOptions.prefix = '/ws';
    
    // file download response interceptor
    $httpProvider.interceptors.push( ['$q', function($q) {
        return {
            'response': function(response) {
                let header = response.headers();
                if(!_.isUndefined(header['content-disposition'])) {
                    let contentDisposition = header['content-disposition'];
                    let filename = contentDisposition.split('=')[1];
                    filename = filename.replace(/"/g,'');
                    let csvBlob = new Blob([response.data], { type: header['content-type'] });
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(csvBlob, filename);
                    } else {
                        let blobUrl = (window.URL || window.webkitUrl).createObjectURL(csvBlob);
                        let anchor = document.createElement('a');
                        anchor.download = filename;
                        anchor.href = blobUrl;
                        document.body.appendChild(anchor);
                        anchor.click();
                        document.body.removeChild(anchor);
                        return $q.reject(response);
                    }
                } else {
                    return response;
                }
            }
        } 
    }]);
    
    $urlRouterProvider.when('/', '/map');
    $urlRouterProvider.otherwise('/map');
    
    const getProjectList = ['ProjectModel', function(ProjectModel) {
        return ProjectModel.query();
    }];    
    
    const getFilterChoiceList = ['MetaModel', function(MetaModel) {
        return MetaModel.getFields();
    }];
    
    const getQueryResults = ['$stateParams', 'UrlSerializer', 'ProjectModel', function($stateParams, UrlSerializer, ProjectModel) {
        let {isBounds, params} = UrlSerializer.getApiParamsFromStateParams($stateParams.filters);
        return isBounds ? ProjectModel.bounds(params) : ProjectModel.search(params);
    }];
    
    const getStoredStateParams = ['UrlSerializer', function(UrlSerializer) {
        return UrlSerializer.getStateParams();
    }];

    // set up app states
    const pageStates = [
        {
            name: 'home',
            url: '/',
            params: {},
            resolve: { // variables set here will be available to the state when it loads
                projectList: getProjectList,
                filterChoiceList: getFilterChoiceList
            },
            views: {
                '': {
                    template: tabTemplate,
                    controller: 'TabCtrl as ctrl'
                },
                'query-filters@home': {
                    template: queryFiltersTemplate,
                    controller: 'FiltersCtrl as ctrl'
                }
            },
        },
        {
            name: 'home.map',
            url: 'map?filters',
            params: {
                filters: getStoredStateParams 
            },
            views: {
                'map@home': {
                    template: mapTemplate,
                    controller: 'MapCtrl as ctrl',
                }
            },
            dsr: true, 
            sticky: true
        },
        {
            name: 'home.results',
            url: 'results?filters',
            params: {
                filters: getStoredStateParams 
            },
            views: {
                'results@home': {
                    template: resultsTemplate,
                    controller: 'ResultsCtrl as ctrl',
                }
            },
            resolve: {
                queryResults: getQueryResults
            },
            dsr: true, 
            sticky: true
        },
        {
            name: 'home.upload',
            url: 'upload',
            views: {
                'upload@home': {
                    template: uploadTemplate,
                    controller: 'UploadCtrl as ctrl',
                }
            },
            dsr: true, 
            sticky: true
        }
    ];
    // register the app states
    pageStates.forEach(pageState => { $stateProvider.state(pageState.name, pageState); });
}

RunBlock.$inject = ['$state', '$stateParams'];
function RunBlock($state, $stateParams) {
}

export default resultTracker;