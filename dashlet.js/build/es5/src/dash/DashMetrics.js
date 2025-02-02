'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _Constants=require('../streaming/constants/Constants');var _Constants2=_interopRequireDefault(_Constants);var _HTTPRequest=require('../streaming/vo/metrics/HTTPRequest');var _FactoryMaker=require('../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _MetricsConstants=require('../streaming/constants/MetricsConstants');var _MetricsConstants2=_interopRequireDefault(_MetricsConstants);var _Round=require('./utils/Round10');var _Round2=_interopRequireDefault(_Round);var _MetricsModel=require('../streaming/models/MetricsModel');var _MetricsModel2=_interopRequireDefault(_MetricsModel);var _PlayList=require('../streaming/vo/metrics/PlayList');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * @module DashMetrics
 * @param {object} config
 */function DashMetrics(config){config=config||{};var context=this.context;var instance=void 0,playListTraceMetricsClosed=void 0,playListTraceMetrics=void 0,playListMetrics=void 0;var metricsModel=config.metricsModel;function setup(){metricsModel=metricsModel||(0,_MetricsModel2.default)(context).getInstance({settings:config.settings});resetInitialSettings();}function resetInitialSettings(){playListTraceMetricsClosed=true;playListTraceMetrics=null;playListMetrics=null;}/**
     * @param {MediaType} mediaType
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentRepresentationSwitch(mediaType){var metrics=metricsModel.getMetricsFor(mediaType,true);return getCurrent(metrics,_MetricsConstants2.default.TRACK_SWITCH);}/**
     * @param {MediaType} mediaType
     * @param {Date} t time of the switch event
     * @param {Date} mt media presentation time
     * @param {string} to id of representation
     * @param {string} lto if present, subrepresentation reference
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addRepresentationSwitch(mediaType,t,mt,to,lto){metricsModel.addRepresentationSwitch(mediaType,t,mt,to,lto);}/**
     * @param {MediaType} type
     * @returns {number}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentBufferState(type){var metrics=metricsModel.getMetricsFor(type,true);return getCurrent(metrics,_MetricsConstants2.default.BUFFER_STATE);}/**
     * @param {MediaType} type
     * @returns {number}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentBufferLevel(type){var metrics=metricsModel.getMetricsFor(type,true);var metric=getCurrent(metrics,_MetricsConstants2.default.BUFFER_LEVEL);if(metric){return _Round2.default.round10(metric.level/1000,-3);}return 0;}/**
     * @param {MediaType} mediaType
     * @param {number} t
     * @param {number} level
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addBufferLevel(mediaType,t,level){metricsModel.addBufferLevel(mediaType,t,level);}/**
     * @param {MediaType} mediaType
     * @param {string} state
     * @param {number} target
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addBufferState(mediaType,state,target){metricsModel.addBufferState(mediaType,state,target);}/**
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function clearAllCurrentMetrics(){metricsModel.clearAllCurrentMetrics();}/**
     * @param {MediaType} mediaType
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentHttpRequest(mediaType){var metrics=metricsModel.getMetricsFor(mediaType,true);if(!metrics){return null;}var httpList=metrics.HttpList;var currentHttpList=null;var httpListLastIndex=void 0;if(!httpList||httpList.length<=0){return null;}httpListLastIndex=httpList.length-1;while(httpListLastIndex>=0){if(httpList[httpListLastIndex].responsecode){currentHttpList=httpList[httpListLastIndex];break;}httpListLastIndex--;}return currentHttpList;}/**
     * @param {MediaType} mediaType
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getHttpRequests(mediaType){var metrics=metricsModel.getMetricsFor(mediaType,true);if(!metrics){return[];}return!!metrics.HttpList?metrics.HttpList:[];}/**
     * @param {MediaType} mediaType
     * @param {Array} loadingRequests
     * @param {Array} executedRequests
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addRequestsQueue(mediaType,loadingRequests,executedRequests){metricsModel.addRequestsQueue(mediaType,loadingRequests,executedRequests);}/**
     * @param {MetricsList} metrics
     * @param {string} metricName
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrent(metrics,metricName){if(!metrics){return null;}var list=metrics[metricName];return!list||list.length===0?null:list[list.length-1];}/**
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function getCurrentDroppedFrames(){var metrics=metricsModel.getMetricsFor(_Constants2.default.VIDEO,true);return getCurrent(metrics,_MetricsConstants2.default.DROPPED_FRAMES);}/**
     * @param {number} quality
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addDroppedFrames(quality){metricsModel.addDroppedFrames(_Constants2.default.VIDEO,quality);}/**
     * @param {MediaType} mediaType
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentSchedulingInfo(mediaType){var metrics=metricsModel.getMetricsFor(mediaType,true);return getCurrent(metrics,_MetricsConstants2.default.SCHEDULING_INFO);}/**
     * @param {object} request
     * @param {string} state
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addSchedulingInfo(request,state){metricsModel.addSchedulingInfo(request.mediaType,new Date(),request.type,request.startTime,request.availabilityStartTime,request.duration,request.quality,request.range,state);}/**
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentManifestUpdate(){var streamMetrics=metricsModel.getMetricsFor(_Constants2.default.STREAM);return getCurrent(streamMetrics,_MetricsConstants2.default.MANIFEST_UPDATE);}/**
     * @param {object} updatedFields fields to be updated
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function updateManifestUpdateInfo(updatedFields){var manifestUpdate=this.getCurrentManifestUpdate();metricsModel.updateManifestUpdateInfo(manifestUpdate,updatedFields);}/**
     * @param {object} streamInfo
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addManifestUpdateStreamInfo(streamInfo){if(streamInfo){var manifestUpdate=this.getCurrentManifestUpdate();metricsModel.addManifestUpdateStreamInfo(manifestUpdate,streamInfo.id,streamInfo.index,streamInfo.start,streamInfo.duration);}}/**
     * @param {object} request
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addManifestUpdate(request){metricsModel.addManifestUpdate(_Constants2.default.STREAM,request.type,request.requestStartDate,request.requestEndDate);}/**
     * @param {object} request
     * @param {string} responseURL
     * @param {number} responseStatus
     * @param {object} responseHeaders
     * @param {object} traces
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addHttpRequest(request,responseURL,responseStatus,responseHeaders,traces){metricsModel.addHttpRequest(request.mediaType,null,request.type,request.url,request.quality,responseURL,request.serviceLocation||null,request.range||null,request.requestStartDate,request.firstByteDate,request.requestEndDate,responseStatus,request.duration,responseHeaders,traces);}/**
     * @param {object} representation
     * @param {MediaType} mediaType
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addManifestUpdateRepresentationInfo(representation,mediaType){if(representation){var manifestUpdateInfo=this.getCurrentManifestUpdate();metricsModel.addManifestUpdateRepresentationInfo(manifestUpdateInfo,representation.id,representation.index,representation.streamIndex,mediaType,representation.presentationTimeOffset,representation.startNumber,representation.fragmentInfoType);}}/**
     * @param {MediaType} mediaType
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getCurrentDVRInfo(mediaType){var metrics=mediaType?metricsModel.getMetricsFor(mediaType,true):metricsModel.getMetricsFor(_Constants2.default.VIDEO,true)||metricsModel.getMetricsFor(_Constants2.default.AUDIO,true);return getCurrent(metrics,_MetricsConstants2.default.DVR_INFO);}/**
     * @param {MediaType} mediaType
     * @param {Date} currentTime time of the switch event
     * @param {object} mpd mpd reference
     * @param {object} range range of the dvr info
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addDVRInfo(mediaType,currentTime,mpd,range){metricsModel.addDVRInfo(mediaType,currentTime,mpd,range);}/**
     * @param {string} id
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getLatestMPDRequestHeaderValueByID(id){var headers={};var httpRequestList=void 0,httpRequest=void 0,i=void 0;httpRequestList=getHttpRequests(_Constants2.default.STREAM);for(i=httpRequestList.length-1;i>=0;i--){httpRequest=httpRequestList[i];if(httpRequest.type===_HTTPRequest.HTTPRequest.MPD_TYPE){headers=parseResponseHeaders(httpRequest._responseHeaders);break;}}return headers[id]===undefined?null:headers[id];}/**
     * @param {string} type
     * @param {string} id
     * @returns {*}
     * @memberof module:DashMetrics
     * @instance
     */function getLatestFragmentRequestHeaderValueByID(type,id){var headers={};var httpRequest=getCurrentHttpRequest(type,true);if(httpRequest){headers=parseResponseHeaders(httpRequest._responseHeaders);}return headers[id]===undefined?null:headers[id];}function parseResponseHeaders(headerStr){var headers={};if(!headerStr){return headers;}// Trim headerStr to fix a MS Edge bug with xhr.getAllResponseHeaders method
// which send a string starting with a "\n" character
var headerPairs=headerStr.trim().split('\r\n');for(var i=0,ilen=headerPairs.length;i<ilen;i++){var headerPair=headerPairs[i];var index=headerPair.indexOf(': ');if(index>0){headers[headerPair.substring(0,index)]=headerPair.substring(index+2);}}return headers;}/**
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addPlayList(){if(playListMetrics){metricsModel.addPlayList(playListMetrics);playListMetrics=null;}}function createPlaylistMetrics(mediaStartTime,startReason){playListMetrics=new _PlayList.PlayList();playListMetrics.start=new Date();playListMetrics.mstart=mediaStartTime;playListMetrics.starttype=startReason;}function createPlaylistTraceMetrics(representationId,mediaStartTime,speed){if(playListTraceMetricsClosed===true){playListTraceMetricsClosed=false;playListTraceMetrics=new _PlayList.PlayListTrace();playListTraceMetrics.representationid=representationId;playListTraceMetrics.start=new Date();playListTraceMetrics.mstart=mediaStartTime;playListTraceMetrics.playbackspeed=speed!==null?speed.toString():null;}}function updatePlayListTraceMetrics(traceToUpdate){if(playListTraceMetrics){for(var field in playListTraceMetrics){playListTraceMetrics[field]=traceToUpdate[field];}}}function pushPlayListTraceMetrics(endTime,reason){if(playListTraceMetricsClosed===false&&playListMetrics&&playListTraceMetrics&&playListTraceMetrics.start){var startTime=playListTraceMetrics.start;var duration=endTime.getTime()-startTime.getTime();playListTraceMetrics.duration=duration;playListTraceMetrics.stopreason=reason;playListMetrics.trace.push(playListTraceMetrics);playListTraceMetricsClosed=true;}}/**
     * @param {object} errors
     * @memberof module:DashMetrics
     * @instance
     * @ignore
     */function addDVBErrors(errors){metricsModel.addDVBErrors(errors);}instance={getCurrentRepresentationSwitch:getCurrentRepresentationSwitch,getCurrentBufferState:getCurrentBufferState,getCurrentBufferLevel:getCurrentBufferLevel,getCurrentHttpRequest:getCurrentHttpRequest,getHttpRequests:getHttpRequests,getCurrentDroppedFrames:getCurrentDroppedFrames,getCurrentSchedulingInfo:getCurrentSchedulingInfo,getCurrentDVRInfo:getCurrentDVRInfo,getCurrentManifestUpdate:getCurrentManifestUpdate,getLatestFragmentRequestHeaderValueByID:getLatestFragmentRequestHeaderValueByID,getLatestMPDRequestHeaderValueByID:getLatestMPDRequestHeaderValueByID,addRepresentationSwitch:addRepresentationSwitch,addDVRInfo:addDVRInfo,updateManifestUpdateInfo:updateManifestUpdateInfo,addManifestUpdateStreamInfo:addManifestUpdateStreamInfo,addManifestUpdateRepresentationInfo:addManifestUpdateRepresentationInfo,addManifestUpdate:addManifestUpdate,addHttpRequest:addHttpRequest,addSchedulingInfo:addSchedulingInfo,addRequestsQueue:addRequestsQueue,addBufferLevel:addBufferLevel,addBufferState:addBufferState,addDroppedFrames:addDroppedFrames,addPlayList:addPlayList,addDVBErrors:addDVBErrors,createPlaylistMetrics:createPlaylistMetrics,createPlaylistTraceMetrics:createPlaylistTraceMetrics,updatePlayListTraceMetrics:updatePlayListTraceMetrics,pushPlayListTraceMetrics:pushPlayListTraceMetrics,clearAllCurrentMetrics:clearAllCurrentMetrics};setup();return instance;}/**
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
 */DashMetrics.__dashjs_factory_name='DashMetrics';exports.default=_FactoryMaker2.default.getSingletonFactory(DashMetrics);
//# sourceMappingURL=DashMetrics.js.map
