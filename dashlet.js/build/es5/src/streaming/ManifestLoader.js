'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _Constants=require('./constants/Constants');var _Constants2=_interopRequireDefault(_Constants);var _DashConstants=require('../dash/constants/DashConstants');var _DashConstants2=_interopRequireDefault(_DashConstants);var _XlinkController=require('./controllers/XlinkController');var _XlinkController2=_interopRequireDefault(_XlinkController);var _URLLoader=require('./net/URLLoader');var _URLLoader2=_interopRequireDefault(_URLLoader);var _URLUtils=require('./utils/URLUtils');var _URLUtils2=_interopRequireDefault(_URLUtils);var _TextRequest=require('./vo/TextRequest');var _TextRequest2=_interopRequireDefault(_TextRequest);var _DashJSError=require('./vo/DashJSError');var _DashJSError2=_interopRequireDefault(_DashJSError);var _HTTPRequest=require('./vo/metrics/HTTPRequest');var _EventBus=require('../core/EventBus');var _EventBus2=_interopRequireDefault(_EventBus);var _Events=require('../core/events/Events');var _Events2=_interopRequireDefault(_Events);var _Errors=require('../core/errors/Errors');var _Errors2=_interopRequireDefault(_Errors);var _FactoryMaker=require('../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _DashParser=require('../dash/parser/DashParser');var _DashParser2=_interopRequireDefault(_DashParser);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function ManifestLoader(config){config=config||{};var context=this.context;var debug=config.debug;var eventBus=(0,_EventBus2.default)(context).getInstance();var urlUtils=(0,_URLUtils2.default)(context).getInstance();var instance=void 0,logger=void 0,urlLoader=void 0,xlinkController=void 0,parser=void 0;var mssHandler=config.mssHandler;var errHandler=config.errHandler;function setup(){logger=debug.getLogger(instance);eventBus.on(_Events2.default.XLINK_READY,onXlinkReady,instance);urlLoader=(0,_URLLoader2.default)(context).create({errHandler:config.errHandler,dashMetrics:config.dashMetrics,mediaPlayerModel:config.mediaPlayerModel,requestModifier:config.requestModifier,useFetch:config.settings.get().streaming.lowLatencyEnabled,urlUtils:urlUtils,constants:_Constants2.default,dashConstants:_DashConstants2.default,errors:_Errors2.default});xlinkController=(0,_XlinkController2.default)(context).create({errHandler:errHandler,dashMetrics:config.dashMetrics,mediaPlayerModel:config.mediaPlayerModel,requestModifier:config.requestModifier,settings:config.settings});parser=null;}function onXlinkReady(event){eventBus.trigger(_Events2.default.INTERNAL_MANIFEST_LOADED,{manifest:event.manifest});}function createParser(data){var parser=null;// Analyze manifest content to detect protocol and select appropriate parser
if(data.indexOf('SmoothStreamingMedia')>-1){//do some business to transform it into a Dash Manifest
if(mssHandler){parser=mssHandler.createMssParser();mssHandler.registerEvents();}return parser;}else if(data.indexOf('MPD')>-1){return(0,_DashParser2.default)(context).create({debug:debug});}else{return parser;}}function load(url){var request=new _TextRequest2.default(url,_HTTPRequest.HTTPRequest.MPD_TYPE);urlLoader.load({request:request,success:function success(data,textStatus,responseURL){// Manage situations in which success is called after calling reset
if(!xlinkController)return;var actualUrl=void 0,baseUri=void 0,manifest=void 0;// Handle redirects for the MPD - as per RFC3986 Section 5.1.3
// also handily resolves relative MPD URLs to absolute
if(responseURL&&responseURL!==url){baseUri=urlUtils.parseBaseUrl(responseURL);actualUrl=responseURL;}else{// usually this case will be caught and resolved by
// responseURL above but it is not available for IE11 and Edge/12 and Edge/13
// baseUri must be absolute for BaseURL resolution later
if(urlUtils.isRelative(url)){url=urlUtils.resolve(url,window.location.href);}baseUri=urlUtils.parseBaseUrl(url);}// Create parser according to manifest type
if(parser===null){parser=createParser(data);}if(parser===null){eventBus.trigger(_Events2.default.INTERNAL_MANIFEST_LOADED,{manifest:null,error:new _DashJSError2.default(_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_CODE,_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_MESSAGE+(''+url))});return;}// init xlinkcontroller with matchers and iron object from created parser
xlinkController.setMatchers(parser.getMatchers());xlinkController.setIron(parser.getIron());try{manifest=parser.parse(data);}catch(e){eventBus.trigger(_Events2.default.INTERNAL_MANIFEST_LOADED,{manifest:null,error:new _DashJSError2.default(_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_CODE,_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_MESSAGE+(''+url))});return;}if(manifest){manifest.url=actualUrl||url;// URL from which the MPD was originally retrieved (MPD updates will not change this value)
if(!manifest.originalUrl){manifest.originalUrl=manifest.url;}// In the following, we only use the first Location entry even if many are available
// Compare with ManifestUpdater/DashManifestModel
if(manifest.hasOwnProperty(_Constants2.default.LOCATION)){baseUri=urlUtils.parseBaseUrl(manifest.Location_asArray[0]);logger.debug('BaseURI set by Location to: '+baseUri);}manifest.baseUri=baseUri;manifest.loadedTime=new Date();xlinkController.resolveManifestOnLoad(manifest);eventBus.trigger(_Events2.default.ORIGINAL_MANIFEST_LOADED,{originalManifest:data});}else{eventBus.trigger(_Events2.default.INTERNAL_MANIFEST_LOADED,{manifest:null,error:new _DashJSError2.default(_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_CODE,_Errors2.default.MANIFEST_LOADER_PARSING_FAILURE_ERROR_MESSAGE+(''+url))});}},error:function error(request,statusText,errorText){eventBus.trigger(_Events2.default.INTERNAL_MANIFEST_LOADED,{manifest:null,error:new _DashJSError2.default(_Errors2.default.MANIFEST_LOADER_LOADING_FAILURE_ERROR_CODE,_Errors2.default.MANIFEST_LOADER_LOADING_FAILURE_ERROR_MESSAGE+(url+', '+errorText))});}});}function reset(){eventBus.off(_Events2.default.XLINK_READY,onXlinkReady,instance);if(xlinkController){xlinkController.reset();xlinkController=null;}if(urlLoader){urlLoader.abort();urlLoader=null;}if(mssHandler){mssHandler.reset();}}instance={load:load,reset:reset};setup();return instance;}/**
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
 */ManifestLoader.__dashjs_factory_name='ManifestLoader';var factory=_FactoryMaker2.default.getClassFactory(ManifestLoader);exports.default=factory;
//# sourceMappingURL=ManifestLoader.js.map
