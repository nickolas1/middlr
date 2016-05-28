const map = angular.module('map', []);

map.controller('MapCtrl', MapController);

MapController.$inject = ['$scope', 'friends', 'apiKey', '$http', '$q', 'NgMap'];
function MapController($scope, friends, apiKey, $http, $q, NgMap) {
    const ctrl = this;

    ctrl.apiUrl = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places';

    const getMarkers = function(friend) {
        let location = friend.geometry.location;
        let position = location.lat + ',' + location.lng;
        return {position: position, title: friend.name};
    }
    ctrl.markers = friends.map(getMarkers);

    ctrl.friends = friends;

    ctrl.destMarker = {};

    ctrl.time = new Date();
    ctrl.time.setHours(21);
    ctrl.time.setMinutes(0);

    let distanceService;
    ctrl.destinationSet = false;
    ctrl.destinationChange = function() {
        let dest = this.getPlace();
        ctrl.destMarker.position = dest.geometry.location.lat() + ',' + dest.geometry.location.lng();
        ctrl.destMarker.title = dest.name;
        ctrl.destinationSet = true;

        if (distanceService === undefined) distanceService = new google.maps.DistanceMatrixService();
        getTravelTimes(ctrl.destMarker.position);
    }

    let getTravelTimes = function(destination) {
        let paramsCar = {
            origins: ctrl.markers.map(marker => marker.position),
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        };
        distanceService.getDistanceMatrix(paramsCar, parseDistancesCar);
        let paramsBike = _.cloneDeep(paramsCar)
        paramsBike.travelMode = google.maps.TravelMode.BICYCLING;
        distanceService.getDistanceMatrix(paramsBike, parseDistancesBike);
    }


    let parseDistances = function(response, status, mode) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
            console.log(response, mode)
            let origins = response.originAddresses;
            let destinations = response.destinationAddresses;
            for (let i = 0; i < origins.length; i++) {
                let result = response.rows[i].elements[0];
                console.log(result.duration.text)
                ctrl.friends[i].distance = result.distance.text;
                _.set(ctrl.friends[i], ['duration', mode], result.duration.text);
            }
            $scope.$apply()
        }
        console.log(ctrl.friends)
    }
    let parseDistancesCar = function(resp, status) {
        parseDistances(resp, status, 'car');
    }
    let parseDistancesBike = function(resp, status) {
        parseDistances(resp, status, 'bike');
    }
}

export default map;
