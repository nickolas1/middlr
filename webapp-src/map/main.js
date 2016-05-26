const map = angular.module('map', []);

map.controller('MapCtrl', MapController);

MapController.$inject = ['$scope', 'friends', 'apiKey'];
function MapController($scope, friends, apiKey) {
    const ctrl = this;
    
    ctrl.apiUrl = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;
    
    console.log(friends)
}

export default map;
