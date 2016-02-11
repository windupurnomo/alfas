angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Camera) {

})

.controller('DataCtrl', function($scope, DataSvc) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.data = DataSvc.all();
    var counter = 0;
    $scope.remove = function(chat) {
        DataSvc.remove(chat);
    };

    $scope.loadMore = function() {
        $scope.data = $scope.data.concat(DataSvc.all());
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };
})

.controller('DatumCtrl', function($scope, $stateParams, DataSvc) {
    $scope.chat = DataSvc.get($stateParams.id);
})

.controller('FormCtrl', function($scope, Camera) {
    $scope.getPhoto = function() {
        Camera.getPicture().then(function(imageURI) {
            console.log(imageURI);
            $scope.lastPhoto = imageURI;
        }, function(err) {
            console.log(err);
        });
    }
});
