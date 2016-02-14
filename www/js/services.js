angular.module('starter.services', [])


.factory('Camera', ['$q', function($q) {

    return {
        getPicture: function(options) {
            var q = $q.defer();
            var x = navigator.camera;
            if (x === undefined) {
                q.reject("Camera not found");
                return q.promise;
            }
            navigator.camera.getPicture(function(result) {
                // Do any magic you need
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.factory('Parser', function() {
    return {
        snakeCase: function(description) {
            var d = description.toLowerCase().trim();
            return d.replace(' ', '_');
        },
        spaceBase: function(snakeCase) {
            var pieces = snakeCase.split("_");
            for (var i = 0; i < pieces.length; i++) {
                var j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1);
            }
            return pieces.join(" ");
        }
    }
})

.factory('DataSvc', function($cordovaSQLite, $http, $q, uuid4) {
    return {
        fields: function() {
            return $http.get('js/fields.json');
        },
        count: function() {
            var q = $q.defer();
            var query = "SELECT COUNT(*) as n FROM data";
            $cordovaSQLite.execute(db, query, []).then(function(res) {
                q.resolve(res.rows.item(0).n);
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        },
        create: function(data) {
            var q = $q.defer();
            var now = new Date().getTime();
            var id = uuid4.generate();
            data.id = id;
            data.created = now;
            var sdata = JSON.stringify(data);
            var query = "INSERT INTO data (id, json, created, edited) VALUES (?,?,?,?)";
            $cordovaSQLite.execute(db, query, [id, sdata, now, now]).then(function(res) {
                q.resolve(res);
            }, function(err) {
                console.error(err);
                q.reject(err);
            });

            return q.promise;
        },
        update: function(data) {
            var q = $q.defer();
            var now = new Date().getTime();
            var sdata = JSON.stringify(data);
            var query = "UPDATE data SET json = ?, created = ?, edited = ? WHERE id = ?";
            $cordovaSQLite.execute(db, query, [sdata, now, now, data.id]).then(function(res) {
                q.resolve(res);
            }, function(err) {
                console.error(err);
                q.reject(err);
            });

            return q.promise;
        },
        getById: function(id) {
            var q = $q.defer();
            var query = "SELECT * FROM data where id = ?";
            $cordovaSQLite.execute(db, query, [id]).then(function(res) {
                if (res.rows.length > 0) {
                    var json = res.rows.item(0).json;
                    var dj = JSON.parse(json);
                    q.resolve(dj);
                } else {
                    q.reject("No result found");
                }
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        },
        getAll: function() {
            var q = $q.defer();
            var query = "SELECT * FROM data ORDER BY created DESC";
            $cordovaSQLite.execute(db, query, []).then(function(res) {
                if (res.rows.length > 0) {
                    var result = [];
                    for (var i = 0; i < res.rows.length; i++) {
                        var json = res.rows.item(i).json;
                        var dj = JSON.parse(json);
                        result.push(dj);
                    }
                    q.resolve(result);
                } else {
                    q.reject("No results found");
                }
            }, function(err) {
                q.reject(err);
                console.error(err);
            });
            return q.promise;
        },
        get: function(offset) {
            var LIMIT = 8;
            var q = $q.defer();
            var query = "SELECT * FROM data ORDER BY created DESC LIMIT ? OFFSET ?";
            $cordovaSQLite.execute(db, query, [LIMIT, offset]).then(function(res) {
                if (res.rows.length > 0) {
                    var result = [];
                    for (var i = 0; i < res.rows.length; i++) {
                        var json = res.rows.item(i).json;
                        var dj = JSON.parse(json);
                        result.push(dj);
                    }
                    q.resolve(result);
                } else {
                    q.reject("No results found");
                    console.log("No results found");
                }
            }, function(err) {
                q.reject(err);
                console.error(err);
            });
            return q.promise;
        },
        delete: function(id) {
            var q = $q.defer();
            var query = "DELETE FROM data where id = ?";
            $cordovaSQLite.execute(db, query, [id]).then(function(res) {
                q.resolve();
            }, function(err) {
                q.reject(err);
            });
            return q.promise;
        }
    }
});
