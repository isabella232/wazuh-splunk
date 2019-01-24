/*
 * Wazuh app - Group handler service
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

define(['../module'], function(module) {
    'use strict'
  
    class CDBEditor {
      constructor($requestService) {
        this.sendConfig = $requestService.sendConfiguration
        this.getConfig = $requestService.getConfiguration
      }
  
      async sendConfiguration(file, content) {
        try {
          const result = this.sendConfig(`/manager/files/${file}`, content)
          return result
        } catch (error) {
          return Promise.reject(error)
        }
      }

      async getConfiguration(file) {
        try {
          const url = `/manager/files?path=/etc/lists/${file}`
          const result = this.getConfig(url)
          return result
        } catch (error) {
          return Promise.reject(error)
        }
      }
    }
    module.service('$cdbEditor', CDBEditor)
  })