angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $filter, $ionicPlatform, $cordovaFile, DataSvc, Parser) {

    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        CSV += ReportTitle + '\r\n\n';
        if (ShowLabel) {
            var row = "";
            for (var index in arrData[0]) {
                row += Parser.spaceBase(index) + ',';
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
            return;
        }
        return CSV;
    }

    function exportData(items) {
        var exportItemArr = new Array();
        for (var i in items) {
            exportItemArr.push(items[i]);
        }

        var title = $filter('date')(new Date(), 'yyyyMMdd_HHmmss');
        var filename = title + ".csv";
        var filePath = cordova.file.dataDirectory;
        console.log(filePath + filename);
        $cordovaFile.createFile(filePath, filename, true).then(function() {
            return $cordovaFile.writeFile(filePath, filename, JSONToCSVConvertor(exportItemArr, title, true), true);
        }).then(function(result) {
            alert("export berhasil: " + filePath + filename);
        }, function(err) {
            alert(JSON.stringify(err));
        });
    }


    $scope.exportItems = function() {
        DataSvc.getAll().then(function(res) {
            exportData(res);
        });
    }

    $ionicPlatform.ready(function() {
        DataSvc.count().then(function(n) {
            $scope.n = n;
        });
    });


})

.controller('DataCtrl', function($scope, $state, $ionicPlatform, $ionicListDelegate, DataSvc) {
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
        $ionicPlatform.ready(function() {
            DataSvc.get(offset).then(function(res) {
                if (o.data.length === 0) o.data = res;
                else o.data.concat(res);
                o.still = res.length === 8;
                console.log(JSON.stringify(res))
                offset++;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(err) {
                console.log(err)
            });
        })
    }

    o.delete = function(id, index) {
        DataSvc.delete(id).then(function() {
            o.data.splice(index, 1);
            $ionicListDelegate.closeOptionButtons();
        });
    };

    o.loadMore();
})

.controller('AboutCtrl', function($scope) {
    var o = $scope;
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

.controller('FormCtrl', function($scope, $state, $stateParams, $ionicPlatform, Camera, DataSvc, Parser, uuid4) {
    var o = $scope,
        id = $stateParams.id;

    o.form = {};
    o.isEdit = uuid4.validate(id);
    o.masterFields;
    o.fields = [];

    var initFields = function() {
        for (var i in o.masterFields) {
            var x = o.masterFields[i];
            var temp = [];
            for (var j in x.fields) {
                var y = x.fields[j];
                y.name = Parser.snakeCase(y.label);
                if (y.type === 'text') {
                    temp.push(y);
                } else if (y.type === 'radio') {
                    var kcounter = 0;
                    for (var k in y.options) {
                        var z = {
                            name: y.name,
                            label: '',
                            type: 'radio',
                            value: y.options[k]
                        };
                        if (kcounter === 0) {
                            z.label = y.label;
                            kcounter++;
                        }
                        temp.push(z);
                    }
                    temp.push({
                        name: y.name,
                        label: '',
                        type: 'text',
                        placeholder: 'lainnya'
                    });
                }
            }
            var xx = angular.copy(x);
            xx.fields = temp;
            o.fields.push(xx);
        }
    }


    $ionicPlatform.ready(function() {
        DataSvc.fields().then(function(res) {
            o.masterFields = res.data;
            initFields();
            if (o.isEdit) {
                DataSvc.getById(id).then(function(resx) {
                    o.form = resx;
                });
            }
        }, function (res){
        	console.log(JSON.stringify(res));
        })
    });

    o.getPhoto = function() {
        Camera.getPicture().then(function(imageURI) {
            o.form.photo = imageURI;
        }, fail);
    }

    o.save = function() {
        var data = angular.copy(o.form);
        console.log(JSON.stringify(data));
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
