'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _FactoryMaker=require('../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _Constants=require('../constants/Constants');var _Constants2=_interopRequireDefault(_Constants);var _Thumbnail=require('../vo/Thumbnail');var _Thumbnail2=_interopRequireDefault(_Thumbnail);var _ThumbnailTracks=require('./ThumbnailTracks');var _ThumbnailTracks2=_interopRequireDefault(_ThumbnailTracks);var _BitrateInfo=require('../vo/BitrateInfo');var _BitrateInfo2=_interopRequireDefault(_BitrateInfo);var _SegmentsUtils=require('../../dash/utils/SegmentsUtils');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
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
 */function ThumbnailController(config){var context=this.context;var instance=void 0,thumbnailTracks=void 0;function setup(){reset();thumbnailTracks=(0,_ThumbnailTracks2.default)(context).create({streamInfo:config.streamInfo,adapter:config.adapter,baseURLController:config.baseURLController,timelineConverter:config.timelineConverter,debug:config.debug,eventBus:config.eventBus,events:config.events,dashConstants:config.dashConstants});}function provideThumbnail(time,callback){if(typeof callback!=='function'){return;}var track=thumbnailTracks.getCurrentTrack();var offset=void 0,request=void 0;if(!track||track.segmentDuration<=0||time===undefined||time===null){callback(null);return;}// Calculate index of the sprite given a time
if(isNaN(track.segmentDuration)){request=thumbnailTracks.getThumbnailRequestForTime(time);if(request){track.segmentDuration=request.duration;}}offset=time%track.segmentDuration;var thumbIndex=Math.floor(offset*track.tilesHor*track.tilesVert/track.segmentDuration);// Create and return the thumbnail
var thumbnail=new _Thumbnail2.default();thumbnail.width=Math.floor(track.widthPerTile);thumbnail.height=Math.floor(track.heightPerTile);thumbnail.x=Math.floor(thumbIndex%track.tilesHor)*track.widthPerTile;thumbnail.y=Math.floor(thumbIndex/track.tilesHor)*track.heightPerTile;if('readThumbnail'in track){return track.readThumbnail(time,function(url){thumbnail.url=url;callback(thumbnail);});}else{if(!request){var seq=Math.floor(time/track.segmentDuration);thumbnail.url=buildUrlFromTemplate(track,seq);}else{thumbnail.url=request.url;track.segmentDuration=NaN;}callback(thumbnail);}}function buildUrlFromTemplate(track,seq){var seqIdx=seq+track.startNumber;var url=(0,_SegmentsUtils.replaceTokenForTemplate)(track.templateUrl,'Number',seqIdx);url=(0,_SegmentsUtils.replaceTokenForTemplate)(url,'Time',(seqIdx-1)*track.segmentDuration);url=(0,_SegmentsUtils.replaceTokenForTemplate)(url,'Bandwidth',track.bandwidth);return(0,_SegmentsUtils.unescapeDollarsInTemplate)(url);}function setTrackByIndex(index){thumbnailTracks.setTrackByIndex(index);}function getCurrentTrackIndex(){return thumbnailTracks.getCurrentTrackIndex();}function getBitrateList(){var tracks=thumbnailTracks.getTracks();var i=0;return tracks.map(function(t){var bitrateInfo=new _BitrateInfo2.default();bitrateInfo.mediaType=_Constants2.default.IMAGE;bitrateInfo.qualityIndex=i++;bitrateInfo.bitrate=t.bitrate;bitrateInfo.width=t.width;bitrateInfo.height=t.height;return bitrateInfo;});}function reset(){if(thumbnailTracks){thumbnailTracks.reset();}}instance={provide:provideThumbnail,setTrackByIndex:setTrackByIndex,getCurrentTrackIndex:getCurrentTrackIndex,getBitrateList:getBitrateList,reset:reset};setup();return instance;}ThumbnailController.__dashjs_factory_name='ThumbnailController';exports.default=_FactoryMaker2.default.getClassFactory(ThumbnailController);
//# sourceMappingURL=ThumbnailController.js.map
