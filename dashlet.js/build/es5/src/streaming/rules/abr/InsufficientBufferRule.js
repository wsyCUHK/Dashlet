'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _EventBus=require('../../../core/EventBus');var _EventBus2=_interopRequireDefault(_EventBus);var _Events=require('../../../core/events/Events');var _Events2=_interopRequireDefault(_Events);var _FactoryMaker=require('../../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _Debug=require('../../../core/Debug');var _Debug2=_interopRequireDefault(_Debug);var _SwitchRequest=require('../SwitchRequest');var _SwitchRequest2=_interopRequireDefault(_SwitchRequest);var _Constants=require('../../constants/Constants');var _Constants2=_interopRequireDefault(_Constants);var _MetricsConstants=require('../../constants/MetricsConstants');var _MetricsConstants2=_interopRequireDefault(_MetricsConstants);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function InsufficientBufferRule(config){config=config||{};var INSUFFICIENT_BUFFER_SAFETY_FACTOR=0.5;var SEGMENT_IGNORE_COUNT=2;var context=this.context;var eventBus=(0,_EventBus2.default)(context).getInstance();var dashMetrics=config.dashMetrics;var instance=void 0,logger=void 0,bufferStateDict=void 0;function setup(){logger=(0,_Debug2.default)(context).getInstance().getLogger(instance);resetInitialSettings();eventBus.on(_Events2.default.PLAYBACK_SEEKING,onPlaybackSeeking,instance);eventBus.on(_Events2.default.BYTES_APPENDED_END_FRAGMENT,onEndFragment,instance);}function checkConfig(){if(!dashMetrics||!dashMetrics.hasOwnProperty('getCurrentBufferLevel')||!dashMetrics.hasOwnProperty('getCurrentBufferState')){throw new Error(_Constants2.default.MISSING_CONFIG_ERROR);}}/*
     * InsufficientBufferRule does not kick in before the first BUFFER_LOADED event happens. This is reset at every seek.
     *
     * If a BUFFER_EMPTY event happens, then InsufficientBufferRule returns switchRequest.quality=0 until BUFFER_LOADED happens.
     *
     * Otherwise InsufficientBufferRule gives a maximum bitrate depending on throughput and bufferLevel such that
     * a whole fragment can be downloaded before the buffer runs out, subject to a conservative safety factor of 0.5.
     * If the bufferLevel is low, then InsufficientBufferRule avoids rebuffering risk.
     * If the bufferLevel is high, then InsufficientBufferRule give a high MaxIndex allowing other rules to take over.
     */function getMaxIndex(rulesContext){var switchRequest=(0,_SwitchRequest2.default)(context).create();if(!rulesContext||!rulesContext.hasOwnProperty('getMediaType')){return switchRequest;}checkConfig();var mediaType=rulesContext.getMediaType();var currentBufferState=dashMetrics.getCurrentBufferState(mediaType);var representationInfo=rulesContext.getRepresentationInfo();var fragmentDuration=representationInfo.fragmentDuration;// Don't ask for a bitrate change if there is not info about buffer state or if fragmentDuration is not defined
if(shouldIgnore(mediaType)||!fragmentDuration){return switchRequest;}if(currentBufferState&&currentBufferState.state===_MetricsConstants2.default.BUFFER_EMPTY){logger.debug('['+mediaType+'] Switch to index 0; buffer is empty.');switchRequest.quality=0;switchRequest.reason='InsufficientBufferRule: Buffer is empty';}else{var mediaInfo=rulesContext.getMediaInfo();var abrController=rulesContext.getAbrController();var throughputHistory=abrController.getThroughputHistory();var bufferLevel=dashMetrics.getCurrentBufferLevel(mediaType);var throughput=throughputHistory.getAverageThroughput(mediaType);var latency=throughputHistory.getAverageLatency(mediaType);var bitrate=throughput*(bufferLevel/fragmentDuration)*INSUFFICIENT_BUFFER_SAFETY_FACTOR;switchRequest.quality=abrController.getQualityForBitrate(mediaInfo,bitrate,latency);switchRequest.reason='InsufficientBufferRule: being conservative to avoid immediate rebuffering';}return switchRequest;}function shouldIgnore(mediaType){return bufferStateDict[mediaType].ignoreCount>0;}function resetInitialSettings(){bufferStateDict={};bufferStateDict[_Constants2.default.VIDEO]={ignoreCount:SEGMENT_IGNORE_COUNT};bufferStateDict[_Constants2.default.AUDIO]={ignoreCount:SEGMENT_IGNORE_COUNT};}function onPlaybackSeeking(){resetInitialSettings();}function onEndFragment(e){if(!isNaN(e.startTime)&&(e.mediaType===_Constants2.default.AUDIO||e.mediaType===_Constants2.default.VIDEO)){if(bufferStateDict[e.mediaType].ignoreCount>0){bufferStateDict[e.mediaType].ignoreCount--;}}}function reset(){resetInitialSettings();eventBus.off(_Events2.default.PLAYBACK_SEEKING,onPlaybackSeeking,instance);eventBus.off(_Events2.default.BYTES_APPENDED_END_FRAGMENT,onEndFragment,instance);}instance={getMaxIndex:getMaxIndex,reset:reset};setup();return instance;}/**
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
 */InsufficientBufferRule.__dashjs_factory_name='InsufficientBufferRule';exports.default=_FactoryMaker2.default.getClassFactory(InsufficientBufferRule);
//# sourceMappingURL=InsufficientBufferRule.js.map
