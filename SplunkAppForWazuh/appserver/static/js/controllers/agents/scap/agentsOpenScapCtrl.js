/*
* Wazuh app - Agents controller
* Copyright (C) 2018 Wazuh, Inc.
*
* This program is free software you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation either version 2 of the License, or
* (at your option) any later version.
*
* Find more information about this on the LICENSE file.
*/

define([
  '../../module',
  '../../../services/visualizations/chart/pie-chart',
  '../../../services/visualizations/chart/area-chart',
  '../../../services/visualizations/chart/bar-chart',
  '../../../services/visualizations/table/table',
  '../../../services/visualizations/inputs/time-picker',
  '../../../services/visualizations/inputs/dropdown-input',
  '../../../services/visualizations/search/search-handler',
], function (
  app,
  PieChart,
  AreaChart,
  BarChart,
  Table,
  TimePicker,
  Dropdown,
  SearchHandler,
  ) {
    
    'use strict'
    
    class AgentsOpenScap {
      
      /**
      * Class constructor
      * @param {Object} $urlTokenModel 
      * @param {Object} $scope 
      * @param {Object} $currentDataService 
      * @param {Object} $state 
      * @param {Object} agent
      */
      
      constructor($urlTokenModel, $scope, $currentDataService, $state, agent){
        
        this.urlTokenModel = $urlTokenModel 
        this.scope = $scope 
        this.currentDataService = $currentDataService 
        this.state = $state 
        this.agent = agent
        
        if (!this.currentDataService.getCurrentAgent()) { this.state.go('overview') }
        
        this.filters = this.currentDataService.getSerializedFilters()
        this.timePicker = new TimePicker('#timePicker',this.urlTokenModel.handleValueChange)
        
        this.scope.agent = agent.data.data
        
        this.dropdown = new Dropdown(
          'dropDownInput',
          `${this.filters} sourcetype=wazuh  rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=* | stats count by oscap.scan.profile.title | sort oscap.scan.profile.title ASC|fields - count`,
          'oscap.scan.profile.title',
          '$form.profile$',
          'dropDownInput'
          )
          console.log('dropdown ', this.dropdown)
          this.dropdownInstance = this.dropdown.getElement()
          console.log('dropdownInstance ', this.dropdownInstance)
          this.submittedTokenModel = this.urlTokenModel.getSubmittedTokenModel()
          console.log('submittedTokenModel ', this.submittedTokenModel)
          this.dropdownInstance.on("change", function(newValue){
            console.log('onChange dropdownInstance', this.dropdownInstance)
            console.log('onChange newValue', newValue)
            if (newValue && this.dropdownInstance){
              console.log('CHANGED')
              console.log('CHANGED dropdownInstance', this.dropdownInstance)
              this.urlTokenModel.handleValueChange(this.dropdownInstance)
            }
          })  
          
          this.vizz = [
            /**
            * Metrics
            */
            new SearchHandler(`lastScapScore`,
            `${this.filters} sourcetype=wazuh oscap.scan.score=* | stats latest(oscap.scan.score)`,
            `latestScapScore`,
            '$result.latest(oscap.scan.score)$',
            'scapLastScore',
            this.submittedTokenModel,
            this.scope),
            new SearchHandler(`maxScapScore`,
            `${this.filters} sourcetype=wazuh oscap.scan.score=* | stats max(oscap.scan.score)`,
            `maxScapScore`,
            '$result.max(oscap.scan.score)$',
            'scapHighestScore',
            this.submittedTokenModel,
            this.scope),
            new SearchHandler(`scapLowest`,
            `${this.filters} sourcetype=wazuh oscap.scan.score=* | stats min(oscap.scan.score)`,
            `minScapScore`,
            '$result.min(oscap.scan.score)$',
            'scapLowestScore',
            this.submittedTokenModel,
            this.scope),
            
            /**
            * Visualizations
            */
            new PieChart('agentsVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top agent.name`,
            'agentsVizz'),
            new PieChart('profilesVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.profile.title`,
            'profilesVizz'),
            new BarChart('contentVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.content`,
            'contentVizz'),
            new PieChart('severityVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.severity`,
            'severityVizz'),
            new AreaChart('top5AgentsSHVizz',
            `${this.filters} sourcetype=wazuh rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" oscap.check.severity=\"high\" | chart count by agent.name`,
            'top5AgentsSHVizz'),
            new PieChart('top10AleertsVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title`,
            'top10AleertsVizz'),
            new PieChart('top10HRAlertsVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\"  oscap.check.severity=\"high\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title`,
            'top10HRAlertsVizz'),
            new Table('alertsSummaryVizz',
            `${this.filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" | stats count by agent.name, oscap.check.title, oscap.scan.profile.title, oscap.scan.id, oscap.scan.content | sort count DESC | rename agent.name as \"Agent name\", oscap.check.title as Title, oscap.scan.profile.title as Profile, oscap.scan.id as \"Scan ID\", oscap.scan.content as Content`,
            'alertsSummaryVizz')
          ]
          
          /**
          * When controller is destroyed
          */
          this.scope.$on('$destroy', () => {
            this.timePicker.destroy()
            this.dropdown.destroy()
            this.vizz.map( (vizz) => vizz.destroy())
          })
          
        }
        
      }
      
      app.controller('agentsOpenScapCtrl', AgentsOpenScap) 
    })  