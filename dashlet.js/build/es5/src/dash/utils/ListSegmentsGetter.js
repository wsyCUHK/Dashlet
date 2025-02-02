'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _FactoryMaker=require('../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _Constants=require('../../streaming/constants/Constants');var _Constants2=_interopRequireDefault(_Constants);var _SegmentsUtils=require('./SegmentsUtils');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function ListSegmentsGetter(config,isDynamic){config=config||{};var timelineConverter=config.timelineConverter;var instance=void 0;function checkConfig(){if(!timelineConverter||!timelineConverter.hasOwnProperty('calcPeriodRelativeTimeFromMpdRelativeTime')){throw new Error(_Constants2.default.MISSING_CONFIG_ERROR);}}function getSegmentByIndex(representation,index){checkConfig();if(!representation){return null;}var list=representation.adaptation.period.mpd.manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index].Representation_asArray[representation.index].SegmentList;var len=list.SegmentURL_asArray.length;var startNumber=representation&&!isNaN(representation.startNumber)?representation.startNumber:1;var offsetToSubtract=Math.max(startNumber-1,0);var start=representation.startNumber;var segment=null;if(index-offsetToSubtract<len){var s=list.SegmentURL_asArray[index-offsetToSubtract];segment=(0,_SegmentsUtils.getIndexBasedSegment)(timelineConverter,isDynamic,representation,index);if(segment){segment.replacementTime=(start+index-1)*representation.segmentDuration;segment.media=s.media?s.media:'';segment.mediaRange=s.mediaRange;segment.index=index;segment.indexRange=s.indexRange;}}representation.availableSegmentsNumber=len;return segment;}function getSegmentByTime(representation,requestedTime){checkConfig();if(!representation){return null;}var duration=representation.segmentDuration;if(isNaN(duration)){return null;}var periodTime=timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(representation,requestedTime);var index=Math.floor(periodTime/duration);return getSegmentByIndex(representation,index);}instance={getSegmentByIndex:getSegmentByIndex,getSegmentByTime:getSegmentByTime};return instance;}/**
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
 */ListSegmentsGetter.__dashjs_factory_name='ListSegmentsGetter';var factory=_FactoryMaker2.default.getClassFactory(ListSegmentsGetter);exports.default=factory;
//# sourceMappingURL=ListSegmentsGetter.js.map
