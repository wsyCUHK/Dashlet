'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _EventsBase2=require('./EventsBase');var _EventsBase3=_interopRequireDefault(_EventsBase2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}/**
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
 *//**
 * These are internal events that should not be needed at the player level.
 * If you find and event in here that you would like access to from MediaPlayer level
 * please add an issue at https://github.com/Dash-Industry-Forum/dash.js/issues/new
 * @class
 * @ignore
 */var CoreEvents=function(_EventsBase){_inherits(CoreEvents,_EventsBase);function CoreEvents(){_classCallCheck(this,CoreEvents);var _this=_possibleConstructorReturn(this,(CoreEvents.__proto__||Object.getPrototypeOf(CoreEvents)).call(this));_this.BUFFERING_COMPLETED='bufferingCompleted';_this.BUFFER_CLEARED='bufferCleared';_this.BUFFER_LEVEL_UPDATED='bufferLevelUpdated';_this.BYTES_APPENDED='bytesAppended';_this.BYTES_APPENDED_END_FRAGMENT='bytesAppendedEndFragment';_this.CHECK_FOR_EXISTENCE_COMPLETED='checkForExistenceCompleted';_this.CURRENT_TRACK_CHANGED='currentTrackChanged';_this.DATA_UPDATE_COMPLETED='dataUpdateCompleted';_this.DATA_UPDATE_STARTED='dataUpdateStarted';_this.INBAND_EVENTS='inbandEvents';_this.INITIALIZATION_LOADED='initializationLoaded';_this.INIT_FRAGMENT_LOADED='initFragmentLoaded';_this.INIT_FRAGMENT_NEEDED='initFragmentNeeded';_this.INTERNAL_MANIFEST_LOADED='internalManifestLoaded';_this.ORIGINAL_MANIFEST_LOADED='originalManifestLoaded';_this.LIVE_EDGE_SEARCH_COMPLETED='liveEdgeSearchCompleted';_this.LOADING_COMPLETED='loadingCompleted';_this.LOADING_PROGRESS='loadingProgress';_this.LOADING_DATA_PROGRESS='loadingDataProgress';_this.LOADING_ABANDONED='loadingAborted';_this.MANIFEST_UPDATED='manifestUpdated';_this.MEDIA_FRAGMENT_LOADED='mediaFragmentLoaded';_this.MEDIA_FRAGMENT_NEEDED='mediaFragmentNeeded';_this.QUOTA_EXCEEDED='quotaExceeded';_this.REPRESENTATION_UPDATE_STARTED='representationUpdateStarted';_this.REPRESENTATION_UPDATE_COMPLETED='representationUpdateCompleted';_this.SEGMENTS_LOADED='segmentsLoaded';_this.SERVICE_LOCATION_BLACKLIST_ADD='serviceLocationBlacklistAdd';_this.SERVICE_LOCATION_BLACKLIST_CHANGED='serviceLocationBlacklistChanged';_this.SOURCEBUFFER_REMOVE_COMPLETED='sourceBufferRemoveCompleted';_this.STREAMS_COMPOSED='streamsComposed';_this.STREAM_BUFFERING_COMPLETED='streamBufferingCompleted';_this.STREAM_COMPLETED='streamCompleted';_this.TEXT_TRACKS_QUEUE_INITIALIZED='textTracksQueueInitialized';_this.TIME_SYNCHRONIZATION_COMPLETED='timeSynchronizationComplete';_this.URL_RESOLUTION_FAILED='urlResolutionFailed';_this.VIDEO_CHUNK_RECEIVED='videoChunkReceived';_this.WALLCLOCK_TIME_UPDATED='wallclockTimeUpdated';_this.XLINK_ELEMENT_LOADED='xlinkElementLoaded';_this.XLINK_READY='xlinkReady';_this.SEGMENTBASE_INIT_REQUEST_NEEDED='segmentBaseInitRequestNeeded';_this.SEGMENTBASE_SEGMENTSLIST_REQUEST_NEEDED='segmentBaseSegmentsListRequestNeeded';_this.SEEK_TARGET='seekTarget';_this.DYNAMIC_STREAM_COMPLETED='dynamicStreamCompleted';return _this;}return CoreEvents;}(_EventsBase3.default);exports.default=CoreEvents;
//# sourceMappingURL=CoreEvents.js.map
