'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _IndexDBStore=require('../storage/IndexDBStore');var _IndexDBStore2=_interopRequireDefault(_IndexDBStore);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function IndexDBOfflineLoader(config){config=config||{};var context=this.context;var urlUtils=config.urlUtils;var constants=config.constants;var dashConstants=config.dashConstants;var instance=void 0,indexDBStore=void 0;function setup(){indexDBStore=(0,_IndexDBStore2.default)(context).getInstance();}function getManifestId(url){var myURL=urlUtils.removeHostname(url);var parts=myURL.split('/');return parts[0];}/**
     * Load manifest or fragment from indexeddb database
     * @param {object} config configuration of request
     */function load(config){if(config.request){var manifestId=getManifestId(config.request.url);if(manifestId%1===0){if(config.request.mediaType===constants.AUDIO||config.request.mediaType===constants.VIDEO||config.request.mediaType===constants.TEXT||config.request.mediaType===constants.MUXED||config.request.mediaType===constants.IMAGE||config.request.mediaType===constants.FRAGMENTED_TEXT||config.request.mediaType===constants.EMBEDDED_TEXT){var suffix=config.request.type==='InitializationSegment'?'init':config.request.index;var key=config.request.representationId+'_'+suffix;indexDBStore.getFragmentByKey(manifestId,key).then(function(fragment){config.success(fragment,null,config.request.url,constants.ARRAY_BUFFER);}).catch(function(err){config.error(err);});}else if(config.request.type===dashConstants.MPD){indexDBStore.getManifestById(manifestId).then(function(item){indexDBStore.createFragmentStore(item.fragmentStore);config.success(item.manifest,null,config.request.url,constants.XML);}).catch(function(err){config.error(config.request,404,err);});}}else{config.error(config.request,null,'MediaType can not be found');}}}function abort(){// nothing to do
}setup();instance={load:load,abort:abort};return instance;}/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */IndexDBOfflineLoader.__dashjs_factory_name='IndexDBOfflineLoader';var factory=dashjs.FactoryMaker.getClassFactory(IndexDBOfflineLoader);/* jshint ignore:line */exports.default=factory;
//# sourceMappingURL=IndexDBOfflineLoader.js.map
