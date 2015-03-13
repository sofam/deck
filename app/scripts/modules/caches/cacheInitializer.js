'use strict';

angular.module('deckApp.caches.initializer', [
  'deckApp.subnet.read.service',
  'deckApp.loadBalancer.read.service',
  'deckApp.account',
  'deckApp.account.service',
  'deckApp.instanceType.service',
  'deckApp.securityGroup.read.service',
  'deckApp.subnet.read.service',
  'deckApp.vpc.read.service',
  'deckApp.keyPairs.read.service',
  'deckApp.loadBalancer.read.service',
  'deckApp.applications.read.service',
  'deckApp.caches.infrastructure',
])
  .factory('cacheInitializer', function ($q, applicationReader, infrastructureCaches, accountService, instanceTypeService, securityGroupReader, subnetReader, vpcReader, keyPairsReader, loadBalancerReader) {

    var initializers = {
      credentials: [accountService.getRegionsKeyedByAccount, accountService.listAccounts],
      instanceTypes: [ function() { instanceTypeService.getAllTypesByRegion('aws'); }],
      loadBalancers: [loadBalancerReader.listAWSLoadBalancers],
      securityGroups: [securityGroupReader.getAllSecurityGroups],
      subnets: [subnetReader.listSubnets],
      vpcs: [vpcReader.listVpcs],
      keyPairs: [keyPairsReader.listKeyPairs],
      applications: [applicationReader.listApplications],
    };

    function initialize() {
      var all = [];
      Object.keys(initializers).forEach(function(key) {
        all.push(initializeCache(key));
      });
      return $q.all(all);
    }

    function initializeCache(key) {
      if (initializers[key]) {
        var initializer = initializers[key];
        var all = [];
        initializer.forEach(function(method) {
          all.push(method());
        });
        return $q.all(all);
      }
    }

    function refreshCache(key) {
      infrastructureCaches.clearCache(key);
      return initializeCache(key);
    }

    function refreshCaches() {
      var all = [];
      Object.keys(initializers).forEach(function(key) {
        all.push(refreshCache(key));
      });
      return $q.all(all);
    }

    return {
      initialize: initialize,
      refreshCaches: refreshCaches,
      refreshCache: refreshCache,
    };
  });
