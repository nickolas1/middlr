const map = angular.module('map', []);

map.controller('MapCtrl', MapController);

MapController.$inject = ['$scope', 'friends', 'apiKey', '$http', '$q'];
function MapController($scope, friends, apiKey, $http, $q) {
    const ctrl = this;

    ctrl.apiUrl = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;

    const getMarkers = function(friend) {
        let location = friend.geometry.location;
        let position = location.lat + ',' + location.lng;
        return {position: position, title: friend.name};
    }
    ctrl.markers = friends.map(getMarkers);
    console.log(ctrl.markers)

}

export default map;
