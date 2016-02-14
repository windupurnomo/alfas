angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $filter, $ionicPlatform, $cordovaFile, DataSvc, Parser) {

    var allData = [];
    $scope.groupedData = [];

    $scope.exportItems = function() {
        exportData(allData);
    }

    $ionicPlatform.ready(function() {
        DataSvc.getAll().then(function(res) {
            allData = res;
            grouped();
        }, function (err){
        	console.log(err)
        });

        DataSvc.count().then(function(n) {
            $scope.n = n;
        });
    });

    var grouped = function() {
        var dates = [];
        var temp = undefined;
        var omzet = 0;
        for (var i in allData) {
            var x = allData[i];
            var dt = new Date(x.created);
            var ds = $filter('date')(dt, 'yyyyMMdd');
            if (dates.indexOf(ds) === -1) {
                dates.push(ds);
                if (temp) {
                	$scope.groupedData.push(temp);
                }
                temp = {};
                temp.date = dt;
                temp.data = [];
                temp.omzet = 0;
                temp.data.push(x);
                temp.omzet += x.jumlah_pembelian*1;
            } else {
                temp.data.push(x);
                temp.omzet += x.jumlah_pembelian*1;
            }
        }
        if (temp) {
        	$scope.groupedData.push(temp);
        }

    }

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
        $cordovaFile.createFile(filePath, filename, true).then(function() {
            return $cordovaFile.writeFile(filePath, filename, JSONToCSVConvertor(exportItemArr, title, true), true);
        }).then(function(result) {
            alert("export berhasil: " + filePath + filename);
        }, function(err) {
            alert(JSON.stringify(err));
        });
    }

})

.controller('DataCtrl', function($scope, $state, $ionicPlatform, $ionicListDelegate, DataSvc) {

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

.controller('TabCtrl', function($scope, $state) {
    var o = $scope;

    o.goform = function() {
        $state.go('tab.form', {
            id: 0
        });
    }
})

.controller('FormCtrl', function($scope, $state, $stateParams, $ionicPlatform, Camera, DataSvc, Parser, uuid4) {
    var o = $scope,
        id = $stateParams.id,
        fieldsOnly = [];

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
                var reqSign = y.required ? '*' : '';
                y.name = Parser.snakeCase(y.label);
                y.label = y.label + reqSign;
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
            fieldsOnly = fieldsOnly.concat(angular.copy(x.fields));
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
        }, function(res) {
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
        if (!validate()) return;
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
        alert("Data gagal disimpan, " + err);
    };

    var validate = function() {
        var requiredFields = [];
        for (var i in fieldsOnly) {
            var x = fieldsOnly[i];
            var isExist = false;
            for (var j in o.form) {
                var y = o.form[j];
                if (x.name === j && x.required && y === "") {
                    requiredFields.push(Parser.spaceBase(j));
                } else if (x.name === j && y.length > 0) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist && x.required) {
                requiredFields.push(Parser.spaceBase(x.name));
                if (requiredFields.length > 3) break;
            };
        };
        if (requiredFields.length > 0) {
            var errs = requiredFields.join(", ");
            alert("Fields berikut harus diisi: " + errs);
            return false;
        }
        return true;
    }
});
