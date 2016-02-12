angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $filter, $cordovaFile, DataSvc) {

    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        CSV += ReportTitle + '\r\n\n';
        if (ShowLabel) {
            var row = "";
            for (var index in arrData[0]) {
                row += index + ',';
            }
            row = row.slice(0, -1);
            CSV += row + '\r\n';
        }

        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }
            row.slice(0, row.length - 1);
            CSV += row + '\r\n';
        }

        if (CSV == '') {
            alert("Gagal");
        console.log('xxxxx: ' + CSV)
            return;
        }
        return CSV;
    }

    function exportData(items){
    	var exportItemArr = new Array();
    	for (var i in items) {
    	    var exportItem = {};
    	    exportItem["id"] = items[i]["id"];
    	    exportItem["name"] = items[i]["name"];
    	    exportItem["sex"] = items[i]["sex"];
    	    exportItem["birthdate"] = items[i]["birthdate"];
    	    exportItem["photo"] = items[i]["photo"];
    	    exportItemArr.push(exportItem);
    	}

    	var title = $filter('date')(new Date(), 'yyyyMMdd_HHmmss');
    	var filename = title + ".csv";
    	var filePath = cordova.file.dataDirectory;//cordova.file.externalRootDirectory; //this Path created in ionicPlatform.ready
    	console.log(filePath + filename);
    	$cordovaFile.createFile(filePath, filename, true).then(function() {
    	    return $cordovaFile.writeFile(filePath, filename, JSONToCSVConvertor(exportItemArr, title, true), true);
    	}).then(function(result) {
    	    alert("export berhasil: " + $rootScope.filePath + filename);
    	    console.log("export berhasil: " + $rootScope.filePath + filename);
    	}, function(err) {
    	    alert(JSON.stringify(err));
    	});
    }


    $scope.exportItems = function() {
        DataSvc.getAll().then(function (res){
        	exportData(res);
        })
    }


})

.controller('DataCtrl', function($scope, $state, $ionicListDelegate, DataSvc) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //

    var offset = 0,
        o = $scope;

    o.data = [];
    o.still = true;

    o.goform = function(id) {
        $state.go('tab.form', {
            id: id
        });
    }

    o.loadMore = function() {
        DataSvc.get(offset).then(function(res) {
            if (o.data.length === 0) o.data = res;
            else o.data.concat(res);
            o.still = res.length === 8;
            offset++;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(err) {
            console.log(err)
        });
    }

    o.delete = function(id, index) {
        DataSvc.delete(id).then(function() {
            o.data.splice(index, 1);
            $ionicListDelegate.closeOptionButtons();
        });
    };

    o.sexName = function(n) {
        return n === 1 ? "Laki-Laki" : "Perempuan";
    }

    o.age = function(birthdate) {
        var ageDifMs = Date.now() - birthdate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    o.loadMore();

    // $scope.$on('$ionicView.enter', function(e) {
    //     offset = 0;
    //     o.data = [];
    //     o.loadMore();
    // });

})

.controller('DatumCtrl', function($scope, $stateParams, DataSvc) {
    $scope.chat = DataSvc.get($stateParams.id);
})

.controller('TabCtrl', function($scope, $state) {
    var o = $scope;

    o.godash = function() {
        $state.go('tab.dash');
    }

    o.godata = function() {
        $state.go('tab.data');
    }

    o.goform = function() {
        $state.go('tab.form', {
            id: 0
        });
    }
})

.controller('FormCtrl', function($scope, $state, $stateParams, Camera, DataSvc, uuid4) {
    var o = $scope,
        id = $stateParams.id;

    o.form = {};
    o.isEdit = uuid4.validate(id);
    console.log("form id: " + id)

    if (o.isEdit) {
        DataSvc.getById(id).then(function(res) {
            o.form = res;
        });
    }

    o.getPhoto = function() {
        Camera.getPicture().then(function(imageURI) {
            o.form.photo = imageURI;
        }, fail);
    }

    o.save = function() {
        var data = angular.copy(o.form);
        if (o.isEdit)
            DataSvc.update(data).then(success, fail);
        else
            DataSvc.create(data).then(success, fail);
    };

    var success = function() {
        o.form = {};
        $state.go('tab.data');
    };

    var fail = function(err) {
        console.log(err);
    }
});
