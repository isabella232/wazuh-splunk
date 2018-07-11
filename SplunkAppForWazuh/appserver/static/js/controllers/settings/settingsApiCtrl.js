define([
  '../module',
], function (
  controllers
) {
    'use strict'
    controllers.controller('settingsApiCtrl', function ($credentialService, apiList) {
      const vm = this
      vm.addManagerContainer = false
      vm.isEditing = false
      vm.showForm = (apiList.length === 0) ? true : false
      vm.entry = {}
      const epoch = (new Date).getTime()
      // Validation RegEx
      const userRegEx = new RegExp(/^.{3,100}$/)
      const passRegEx = new RegExp(/^.{3,100}$/)
      const urlRegEx = new RegExp(/^https?:\/\/[a-zA-Z0-9-.]{1,300}$/)
      const urlRegExIP = new RegExp(/^https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)
      const portRegEx = new RegExp(/^[0-9]{2,5}$/)

      /**
       * Initializes the controller
       */
      vm.init = function () {
        vm.selected = []
        vm.apiList = apiList
        vm.selectedApi = []
        vm.saveOrUpdate = 'Add'
        if (vm.apiList && vm.apiList.length > 0)
          vm.visibleTable = true
        else
          vm.visibleTable = false
      }

      /**
       * Removes an API from the list
       * @param {Object} entry 
¡
       */
      vm.removeManager = async (entry) => {
        try {
          const index = vm.apiList.indexOf(entry);
          if (index > -1) {
            vm.apiList.splice(index, 1);
            await $credentialService.remove(entry._key)
          }
        } catch (err) {
          console.error(err)
        }
      }

      /**
       * Check API connectivity
       * @param {Object} entry 
       */
      vm.checkManager = async (entry) => {
        try {
          await $credentialService.checkApiConnection(entry._key)
          console.log('went OK')
        } catch (err) {
          console.error('connection failed')
        }
      }

      /**
       * Set form visible
       */
      vm.addNewApiClick = () => {
        vm.showForm = !vm.showForm
      }

      /**
       * Shows form for editting an API entry
       * @param {Object} entry 
       */
      vm.toggleEditor = (entry) => {
        try {
          vm.showForm = true
          vm.edit = !vm.edit
          vm.url = entry.url
          vm.port = entry.portapi
          vm.user = entry.userapi
          vm.entry = entry

        } catch (err) {
          console.error('error when update ', err)
        }
      }

      /**
       * Edits an entry
       * @param {Object} entry 
       */
      vm.updateEntry = async () => {
        try {
          vm.entry.url = vm.url
          vm.entry.portapi = vm.port
          vm.entry.passapi = vm.pass
          vm.entry.userapi = vm.user
          const key = vm.entry._key
          delete vm.entry['$$hashKey']
          delete vm.entry._key
          delete vm.entry._user
          delete vm.entry.filter
          console.log('the vm.entry ',vm.entry)
          await $credentialService.update(key, vm.entry)
        } catch (err) {
          console.error('err ',err)
        }
      }
      /**
       * Check if an URL is valid or not
       * @param {String} url 
       */
      const validUrl = url => {
        return urlRegEx.test(url) || urlRegExIP.test(url)
      }

      /**
       * Check if a port is valid or not
       * @param {String} port 
       */
      const validPort = port => {
        return portRegEx.test(port)
      }

      /**
       * Check if an user is valid or not
       * @param {String} user 
       */
      const validUsername = user => {
        return userRegEx.test(user)
      }

      /**
       * Check if a password is valid or not
       * @param {String} pass 
       */
      const validPassword = pass => {
        return passRegEx.test(pass)
      }

      /**
       * Empties the form fields
       */
      const clearForm = () => {
        vm.url = ''
        vm.port = ''
        vm.user = ''
        vm.pass = ''
      }

      /**
       * Select an API as the default one
       * @param {Object} entry 
       */
      vm.selectManager = async (entry) => {
        try {
          console.log('selectManager')
          await $credentialService.checkApiConnection(entry._key)
          await $credentialService.chose(entry._key)
          for(let item of vm.apiList) {
            if (item._key === entry._key) {
              item.selected = true
            }
          }
          entry.selected = true
          vm.visibleTable = true
        } catch (err) {
          console.error('[selectManager]: ', err)
        }
      }

      /**
       * Adds a new API
       */
      vm.submitApiForm = async () => {
        // When the Submit button is clicked, get all the form fields by accessing input values
        const form_url = vm.url
        const form_apiport = vm.port
        const form_apiuser = vm.user
        const form_apipass = vm.pass

        // If values are valid, register them
        if (validPassword(form_apipass) && validPort(form_apiport) && validUrl(form_url) && validUsername(form_apiuser)) {
          // Create an object to store the field names and values
          const record = {
            "url": form_url,
            "portapi": form_apiport,
            "userapi": form_apiuser,
            "passapi": form_apipass,
            "cluster": false,
            "managerName": false
          }
          // Use the request method to send and insert a new record
          const result = await $credentialService.insert(record)
          try {
            const resultConnection = await $credentialService.checkApiConnection(result.data._key)
            clearForm()
            const apiList = await $credentialService.getApiList()
            console.log('pushing new api')
            record._key = result.data._key
            vm.apiList.push(record)
            if (apiList && apiList.length === 1) {
              await vm.selectManager(result.data)
            }
            vm.visibleTable = true
          } catch (err) {
            await $credentialService.remove(result.data._key)
          }
        } else {
          // invalidFormatInputToast.show()
          console.error('invalid format')
        }
      }
      vm.init()
    })
  })

