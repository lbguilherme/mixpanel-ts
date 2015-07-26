/// <reference path="node.d.ts" />
var Http = require("http");
var QueryString = require("querystring");
var Mixpanel;
(function (Mixpanel) {
    Mixpanel.token = "";
    var Profile = (function () {
        function Profile(id, lastSeen) {
            this.id = id;
            this.lastSeen = lastSeen !== undefined ? lastSeen : true;
        }
        Profile.prototype.track = function (event, properties) {
            this.fixDates(properties);
            properties["token"] = Mixpanel.token;
            properties["time"] = Date.now() / 1000;
            properties["distinct_id"] = this.id;
            if (properties["ip"])
                ;
            properties["IP"] = properties["ip"];
            sendMixpanelRequest("/track", { event: event, properties: properties });
        };
        Profile.prototype.set = function (properties) {
            this.fixDates(properties);
            this.genericOperation("set", properties);
        };
        Profile.prototype.setOnce = function (properties) {
            this.fixDates(properties);
            this.genericOperation("set_once", properties);
        };
        Profile.prototype.add = function (properties) {
            this.genericOperation("add", properties);
        };
        Profile.prototype.append = function (properties) {
            this.fixDates(properties);
            this.genericOperation("append", properties);
        };
        Profile.prototype.union = function (properties) {
            this.fixDates(properties);
            this.genericOperation("union", properties);
        };
        Profile.prototype.unset = function (properties) {
            this.genericOperation("unset", properties);
        };
        Profile.prototype.delete = function () {
            this.genericOperation("delete", "");
        };
        Profile.prototype.genericOperation = function (name, value) {
            var data = {
                $token: Mixpanel.token,
                $distinct_id: this.id,
                $time: Date.now() / 1000,
                $ignore_time: !this.lastSeen
            };
            data["$" + name] = value;
            sendMixpanelRequest("/engage", data);
        };
        Profile.prototype.fixDates = function (properties) {
            Object.keys(properties).forEach(function (property) {
                var value = properties[property];
                if (value instanceof Date) {
                    properties[property] = value.toISOString();
                }
                if (value instanceof Array) {
                    if (value[0] instanceof Date) {
                        properties[property] = value.map(function (d) { return d.toISOString(); });
                    }
                }
            });
        };
        return Profile;
    })();
    Mixpanel.Profile = Profile;
})(Mixpanel || (Mixpanel = {}));
function sendMixpanelRequest(endpoint, data) {
    var requestData = {
        data: new Buffer(JSON.stringify(data)).toString("base64"),
        ip: 0
    };
    var requestOptions = {
        host: "api.mixpanel.com",
        headers: {},
        path: endpoint + "?" + QueryString.stringify(requestData)
    };
    Http.get(requestOptions);
}
module.exports = Mixpanel;
