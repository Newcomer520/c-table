'use strict';
var templates = angular.module("templates", []);
var services = angular.module('ips2.table.services', []);
var drtvUnit = angular.module('ips2.table.grouping.units', ['templates', 'ips2.table.services']);

var itDrtv = angular.module('ips2.table', ['templates', 'ips2.table.services', 'ips2.table.grouping.units']);