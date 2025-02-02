'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _OfflineConstants=require('./constants/OfflineConstants');var _OfflineConstants2=_interopRequireDefault(_OfflineConstants);var _OfflineStream=require('./OfflineStream');var _OfflineStream2=_interopRequireDefault(_OfflineStream);var _OfflineIndexDBManifestParser=require('./utils/OfflineIndexDBManifestParser');var _OfflineIndexDBManifestParser2=_interopRequireDefault(_OfflineIndexDBManifestParser);var _OfflineErrors=require('./errors/OfflineErrors');var _OfflineErrors2=_interopRequireDefault(_OfflineErrors);var _DashParser=require('../dash/parser/DashParser');var _DashParser2=_interopRequireDefault(_DashParser);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function OfflineDownload(config){config=config||{};var context=this.context;var manifestLoader=config.manifestLoader;var mediaPlayerModel=config.mediaPlayerModel;var abrController=config.abrController;var playbackController=config.playbackController;var adapter=config.adapter;var dashMetrics=config.dashMetrics;var timelineConverter=config.timelineConverter;var offlineStoreController=config.offlineStoreController;var manifestId=config.id;var eventBus=config.eventBus;var errHandler=config.errHandler;var events=config.events;var errors=config.errors;var settings=config.settings;var debug=config.debug;var manifestUpdater=config.manifestUpdater;var baseURLController=config.baseURLController;var constants=config.constants;var dashConstants=config.dashConstants;var urlUtils=config.urlUtils;var instance=void 0,logger=void 0,_manifestURL=void 0,_offlineURL=void 0,_xmlManifest=void 0,_streams=void 0,_manifest=void 0,_isDownloadingStatus=void 0,_isComposed=void 0,_representationsToUpdate=void 0,_indexDBManifestParser=void 0,_progressionById=void 0,_progression=void 0,_status=void 0;function setup(){logger=debug.getLogger(instance);manifestUpdater.initialize();_streams=[];_isDownloadingStatus=false;_isComposed=false;_progressionById={};_progression=0;_status=undefined;}function getId(){return manifestId;}function getOfflineUrl(){return _offlineURL;}function getManifestUrl(){return _manifestURL;}function getStatus(){return _status;}function setInitialState(state){_offlineURL=state.url;_progression=state.progress;_manifestURL=state.originalUrl;_status=state.status;}/**
     * Download a stream, from url of manifest
     * @param {string} url
     * @instance
     */function downloadFromUrl(url){_manifestURL=url;_offlineURL=_OfflineConstants2.default.OFFLINE_SCHEME+'://'+manifestId;_status=_OfflineConstants2.default.OFFLINE_STATUS_CREATED;setupOfflineEvents();var offlineManifest={'fragmentStore':manifestId,'status':_status,'manifestId':manifestId,'url':_offlineURL,'originalURL':url};return createOfflineManifest(offlineManifest);}function initDownload(){manifestLoader.load(_manifestURL);_isDownloadingStatus=true;}function setupOfflineEvents(){eventBus.on(events.MANIFEST_UPDATED,onManifestUpdated,instance);eventBus.on(events.ORIGINAL_MANIFEST_LOADED,onOriginalManifestLoaded,instance);setupIndexedDBEvents();}function setupIndexedDBEvents(){eventBus.on(events.ERROR,onError,instance);}function isDownloading(){return _isDownloadingStatus;}function onManifestUpdated(e){if(_isComposed){return;}if(!e.error){try{_manifest=e.manifest;}catch(err){_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:err.message,data:{id:manifestId,status:_status}});}}}function onDownloadingStarted(e){if(e.id!==manifestId){return;}if(!e.error&&manifestId!==null){_status=_OfflineConstants2.default.OFFLINE_STATUS_STARTED;offlineStoreController.setDownloadingStatus(manifestId,_status).then(function(){eventBus.trigger(events.OFFLINE_RECORD_STARTED,{id:manifestId,message:'Downloading started for this stream !'});});}else{_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:'Cannot start download ',data:{id:manifestId,status:_status,error:e.error}});}}function OnStreamProgression(stream,downloaded,available){_progressionById[stream.getStreamInfo().id]={downloaded:downloaded,available:available};var segments=0;var allSegments=0;var waitForAllProgress=void 0;for(var property in _progressionById){if(_progressionById.hasOwnProperty(property)){if(_progressionById[property]===null){waitForAllProgress=true;}else{segments+=_progressionById[property].downloaded;allSegments+=_progressionById[property].available;}}}if(!waitForAllProgress){// all progression have been started, we can compute global progression
_progression=segments/allSegments;// store progression
offlineStoreController.getManifestById(manifestId).then(function(item){item.progress=_progression;return updateOfflineManifest(item);});}}function onDownloadingFinished(e){if(e.id!==manifestId){return;}if(!e.error&&manifestId!==null){_status=_OfflineConstants2.default.OFFLINE_STATUS_FINISHED;offlineStoreController.setDownloadingStatus(manifestId,_status).then(function(){eventBus.trigger(events.OFFLINE_RECORD_FINISHED,{id:manifestId,message:'Downloading has been successfully completed for this stream !'});resetDownload();});}else{_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:'Error finishing download ',data:{id:manifestId,status:_status,error:e.error}});}}function onManifestUpdateNeeded(e){if(e.id!==manifestId){return;}_representationsToUpdate=e.representations;if(_representationsToUpdate.length>0){_indexDBManifestParser.parse(_xmlManifest,_representationsToUpdate).then(function(parsedManifest){if(parsedManifest!==null&&manifestId!==null){offlineStoreController.getManifestById(manifestId).then(function(item){item.manifest=parsedManifest;return updateOfflineManifest(item);}).then(function(){for(var i=0,ln=_streams.length;i<ln;i++){_streams[i].startOfflineStreamProcessors();}});}else{throw'falling parsing offline manifest';}}).catch(function(err){throw err;});}}function composeStreams(){try{adapter.updatePeriods(_manifest);baseURLController.initialize(_manifest);var streamsInfo=adapter.getStreamsInfo();if(streamsInfo.length===0){_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:'Cannot download - no streams',data:{id:manifestId,status:_status}});}for(var i=0,ln=streamsInfo.length;i<ln;i++){var streamInfo=streamsInfo[i];var stream=(0,_OfflineStream2.default)(context).create({id:manifestId,callbacks:{started:onDownloadingStarted,progression:OnStreamProgression,finished:onDownloadingFinished,updateManifestNeeded:onManifestUpdateNeeded},constants:constants,dashConstants:dashConstants,eventBus:eventBus,events:events,errors:errors,settings:settings,debug:debug,errHandler:errHandler,mediaPlayerModel:mediaPlayerModel,abrController:abrController,playbackController:playbackController,dashMetrics:dashMetrics,baseURLController:baseURLController,timelineConverter:timelineConverter,adapter:adapter,offlineStoreController:offlineStoreController});_streams.push(stream);// initialise stream and get downloadable representations
stream.initialize(streamInfo);_progressionById[streamInfo.id]=null;}_isComposed=true;}catch(e){logger.info(e);_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:e.message,data:{id:manifestId,status:_status,error:e.error}});}}function getMediaInfos(){_streams.forEach(function(stream){stream.getMediaInfos();});}/**
     * Init databsse to store fragments
     * @param {number} manifestId
     * @instance
     */function createFragmentStore(manifestId){return offlineStoreController.createFragmentStore(manifestId);}/**
     * Store in database the string representation of offline manifest (with only downloaded representations)
     * @param {object} offlineManifest
     * @instance
     */function createOfflineManifest(offlineManifest){return offlineStoreController.createOfflineManifest(offlineManifest);}/**
     * Store in database the string representation of offline manifest (with only downloaded representations)
     * @param {object} offlineManifest
     * @instance
     */function updateOfflineManifest(offlineManifest){return offlineStoreController.updateOfflineManifest(offlineManifest);}/**
     * Triggered when manifest is loaded from internet.
     * @param {Object[]} e
     */function onOriginalManifestLoaded(e){// unregister form event
eventBus.off(events.ORIGINAL_MANIFEST_LOADED,onOriginalManifestLoaded,instance);_xmlManifest=e.originalManifest;if(_manifest.type===dashConstants.DYNAMIC){_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:'Cannot handle DYNAMIC manifest',data:{id:manifestId,status:_status}});logger.error('Cannot handle DYNAMIC manifest');return;}if(_manifest.Period_asArray.length>1){_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:'MultiPeriod manifest are not yet supported',data:{id:manifestId,status:_status}});logger.error('MultiPeriod manifest are not yet supported');return;}// save original manifest (for resume)
// initialise offline streams
composeStreams(_manifest);// get MediaInfos
getMediaInfos();eventBus.trigger(events.STREAMS_COMPOSED);}function initializeAllMediasInfoList(selectedRepresentations){for(var i=0;i<_streams.length;i++){_streams[i].initializeAllMediasInfoList(selectedRepresentations);}}function getSelectedRepresentations(mediaInfos){var rep={};rep[constants.VIDEO]=[];rep[constants.AUDIO]=[];rep[constants.TEXT]=[];rep[constants.FRAGMENTED_TEXT]=[];// selectedRepresentations.video.forEach(item => {
//     ret[constants.VIDEO].push(item.id);
// });
// selectedRepresentations.audio.forEach(item => {
//     ret[constants.AUDIO].push(item.id);
// });
// selectedRepresentations.text.forEach(item => {
//     ret[item.type].push(item.id);
// });
mediaInfos.forEach(function(mediaInfo){mediaInfo.bitrateList.forEach(function(bitrate){rep[mediaInfo.type].push(bitrate.id);});});return rep;}function startDownload(mediaInfos){try{var rep=getSelectedRepresentations(mediaInfos);offlineStoreController.saveSelectedRepresentations(manifestId,rep).then(function(){return createFragmentStore(manifestId);}).then(function(){return generateOfflineManifest(rep);}).then(function(){initializeAllMediasInfoList(rep);});}catch(err){_status=_OfflineConstants2.default.OFFLINE_STATUS_ERROR;errHandler.error({code:_OfflineErrors2.default.OFFLINE_ERROR,message:err.message,data:{id:manifestId,status:_status}});}}/**
     * Create the parser used to convert original manifest in offline manifest
     * Creates a JSON object that will be stored in database
     * @param {Object[]} selectedRepresentations
     * @instance
     */function generateOfflineManifest(selectedRepresentations){_indexDBManifestParser=(0,_OfflineIndexDBManifestParser2.default)(context).create({manifestId:manifestId,allMediaInfos:selectedRepresentations,debug:debug,dashConstants:dashConstants,constants:constants,urlUtils:urlUtils});return _indexDBManifestParser.parse(_xmlManifest).then(function(parsedManifest){if(parsedManifest!==null){return offlineStoreController.getManifestById(manifestId).then(function(item){item.originalURL=_manifest.url;item.originalManifest=_xmlManifest;item.manifest=parsedManifest;return updateOfflineManifest(item);});}else{return Promise.reject('falling parsing offline manifest');}}).catch(function(err){return Promise.reject(err);});}/**
     * Stops downloading of fragments
     * @instance
     */function stopDownload(){if(manifestId!==null&&isDownloading()){for(var i=0,ln=_streams.length;i<ln;i++){_streams[i].stopOfflineStreamProcessors();}// remove streams
_streams=[];_isComposed=false;_status=_OfflineConstants2.default.OFFLINE_STATUS_STOPPED;// update status
offlineStoreController.setDownloadingStatus(manifestId,_status).then(function(){eventBus.trigger(events.OFFLINE_RECORD_STOPPED,{sender:this,id:manifestId,status:_status,message:'Downloading has been stopped for this stream !'});_isDownloadingStatus=false;});}}/**
     * Delete an offline manifest (and all of its data)
     * @instance
     */function deleteDownload(){stopDownload();}/**
     * Resume download of a stream
     * @instance
     */function resumeDownload(){if(isDownloading()){return;}_isDownloadingStatus=true;var selectedRepresentations=void 0;offlineStoreController.getManifestById(manifestId).then(function(item){var parser=(0,_DashParser2.default)(context).create({debug:debug});_manifest=parser.parse(item.originalManifest);composeStreams(_manifest);selectedRepresentations=item.selected;eventBus.trigger(events.STREAMS_COMPOSED);return createFragmentStore(manifestId);}).then(function(){initializeAllMediasInfoList(selectedRepresentations);});}/**
     * Compute the progression of download
     * @instance
     */function getDownloadProgression(){return Math.round(_progression*100);}/**
     * Reset events listeners
     * @instance
     */function resetDownload(){for(var i=0,ln=_streams.length;i<ln;i++){_streams[i].reset();}_indexDBManifestParser=null;_isDownloadingStatus=false;_streams=[];eventBus.off(events.MANIFEST_UPDATED,onManifestUpdated,instance);eventBus.off(events.ORIGINAL_MANIFEST_LOADED,onOriginalManifestLoaded,instance);resetIndexedDBEvents();}function onError(e){if(e.error.code===_OfflineErrors2.default.INDEXEDDB_QUOTA_EXCEED_ERROR||e.error.code===_OfflineErrors2.default.INDEXEDDB_INVALID_STATE_ERROR){stopDownload();}}function resetIndexedDBEvents(){eventBus.on(events.ERROR,onError,instance);}/**
     * Reset
     * @instance
     */function reset(){if(isDownloading()){resetDownload();}baseURLController.reset();manifestUpdater.reset();}instance={reset:reset,getId:getId,getOfflineUrl:getOfflineUrl,getManifestUrl:getManifestUrl,getStatus:getStatus,setInitialState:setInitialState,initDownload:initDownload,downloadFromUrl:downloadFromUrl,startDownload:startDownload,stopDownload:stopDownload,resumeDownload:resumeDownload,deleteDownload:deleteDownload,getDownloadProgression:getDownloadProgression,isDownloading:isDownloading,resetDownload:resetDownload};setup();return instance;}/**
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
 */OfflineDownload.__dashjs_factory_name='OfflineDownload';exports.default=dashjs.FactoryMaker.getClassFactory(OfflineDownload);/* jshint ignore:line */
//# sourceMappingURL=OfflineDownload.js.map
