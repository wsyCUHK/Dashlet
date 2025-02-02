'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _DashConstants=require('./constants/DashConstants');var _DashConstants2=_interopRequireDefault(_DashConstants);var _RepresentationInfo=require('./vo/RepresentationInfo');var _RepresentationInfo2=_interopRequireDefault(_RepresentationInfo);var _MediaInfo=require('./vo/MediaInfo');var _MediaInfo2=_interopRequireDefault(_MediaInfo);var _StreamInfo=require('./vo/StreamInfo');var _StreamInfo2=_interopRequireDefault(_StreamInfo);var _ManifestInfo=require('./vo/ManifestInfo');var _ManifestInfo2=_interopRequireDefault(_ManifestInfo);var _Event=require('./vo/Event');var _Event2=_interopRequireDefault(_Event);var _FactoryMaker=require('../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _DashManifestModel=require('./models/DashManifestModel');var _DashManifestModel2=_interopRequireDefault(_DashManifestModel);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * @module DashAdapter
 *//**
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
 */function DashAdapter(){var instance=void 0,dashManifestModel=void 0,voPeriods=void 0,voAdaptations=void 0,currentMediaInfo=void 0,constants=void 0,cea608parser=void 0;var context=this.context;var PROFILE_DVB='urn:dvb:dash:profile:dvb-dash:2014';function setup(){dashManifestModel=(0,_DashManifestModel2.default)(context).getInstance();reset();}// #region PUBLIC FUNCTIONS
// --------------------------------------------------
function getVoAdaptations(){return voAdaptations;}function getVoPeriods(){return voPeriods;}function setConfig(config){if(!config)return;if(config.constants){constants=config.constants;}if(config.cea608parser){cea608parser=config.cea608parser;}if(config.errHandler){dashManifestModel.setConfig({errHandler:config.errHandler});}if(config.BASE64){dashManifestModel.setConfig({BASE64:config.BASE64});}}/**
     * Creates an instance of RepresentationInfo based on a representation value object
     * @param {object} voRepresentation
     * @returns {RepresentationInfo|null} representationInfo
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function convertRepresentationToRepresentationInfo(voRepresentation){if(voRepresentation){var representationInfo=new _RepresentationInfo2.default();var realAdaptation=voRepresentation.adaptation.period.mpd.manifest.Period_asArray[voRepresentation.adaptation.period.index].AdaptationSet_asArray[voRepresentation.adaptation.index];var realRepresentation=dashManifestModel.getRepresentationFor(voRepresentation.index,realAdaptation);representationInfo.id=voRepresentation.id;representationInfo.quality=voRepresentation.index;representationInfo.bandwidth=dashManifestModel.getBandwidth(realRepresentation);representationInfo.DVRWindow=voRepresentation.segmentAvailabilityRange;representationInfo.fragmentDuration=voRepresentation.segmentDuration||(voRepresentation.segments&&voRepresentation.segments.length>0?voRepresentation.segments[0].duration:NaN);representationInfo.MSETimeOffset=voRepresentation.MSETimeOffset;representationInfo.mediaInfo=convertAdaptationToMediaInfo(voRepresentation.adaptation);return representationInfo;}else{return null;}}/**
     * Returns a MediaInfo object for a given media type.
     * @param {object} streamInfo
     * @param {MediaType }type
     * @returns {null|MediaInfo} mediaInfo
     * @memberOf module:DashAdapter
     * @instance
     */function getMediaInfoForType(streamInfo,type){if(voPeriods.length===0||!streamInfo){return null;}var selectedVoPeriod=getPeriodForStreamInfo(streamInfo,voPeriods);if(!selectedVoPeriod)return null;var periodId=selectedVoPeriod.id;voAdaptations[periodId]=voAdaptations[periodId]||dashManifestModel.getAdaptationsForPeriod(selectedVoPeriod);var realAdaptation=getAdaptationForType(streamInfo.index,type,streamInfo);if(!realAdaptation)return null;var idx=dashManifestModel.getIndexForAdaptation(realAdaptation,voPeriods[0].mpd.manifest,streamInfo.index);return convertAdaptationToMediaInfo(voAdaptations[periodId][idx]);}/**
     * Checks if the role of the specified AdaptationSet is set to main
     * @param {object} adaptation
     * @returns {boolean}
     * @memberOf module:DashAdapter
     * @instance
     */function getIsMain(adaptation){return dashManifestModel.getRolesForAdaptation(adaptation).filter(function(role){return role.value===_DashConstants2.default.MAIN;})[0];}/**
     * Returns the AdaptationSet for a given period and a given mediaType.
     * @param {number} periodIndex
     * @param {MediaType} type
     * @param {object} streamInfo
     * @returns {null|object} adaptation
     * @memberOf module:DashAdapter
     * @instance
     */function getAdaptationForType(periodIndex,type,streamInfo){var adaptations=dashManifestModel.getAdaptationsForType(voPeriods[0].mpd.manifest,periodIndex,type);if(!adaptations||adaptations.length===0)return null;if(adaptations.length>1&&streamInfo){var allMediaInfoForType=getAllMediaInfoForType(streamInfo,type);if(currentMediaInfo[streamInfo.id]&&currentMediaInfo[streamInfo.id][type]){for(var i=0,ln=adaptations.length;i<ln;i++){if(currentMediaInfo[streamInfo.id][type].isMediaInfoEqual(allMediaInfoForType[i])){return adaptations[i];}}}for(var _i=0,_ln=adaptations.length;_i<_ln;_i++){if(getIsMain(adaptations[_i])){return adaptations[_i];}}}return adaptations[0];}/**
     * Returns the mediaInfo for a given mediaType
     * @param {object} streamInfo
     * @param {MediaType} type
     * @param {object} externalManifest Set to null or undefined if no external manifest is to be used
     * @returns {Array} mediaArr
     * @memberOf module:DashAdapter
     * @instance
     */function getAllMediaInfoForType(streamInfo,type,externalManifest){var voLocalPeriods=voPeriods;var manifest=externalManifest;var mediaArr=[];var data=void 0,media=void 0,idx=void 0,i=void 0,j=void 0,ln=void 0,periodId=void 0;if(manifest){checkConfig();voLocalPeriods=getRegularPeriods(manifest);}else{if(voPeriods.length>0){manifest=voPeriods[0].mpd.manifest;}else{return mediaArr;}}var selectedVoPeriod=getPeriodForStreamInfo(streamInfo,voLocalPeriods);if(selectedVoPeriod){periodId=selectedVoPeriod.id;}var adaptationsForType=dashManifestModel.getAdaptationsForType(manifest,streamInfo?streamInfo.index:null,type!==constants.EMBEDDED_TEXT?type:constants.VIDEO);if(!adaptationsForType||adaptationsForType.length===0)return mediaArr;voAdaptations[periodId]=voAdaptations[periodId]||dashManifestModel.getAdaptationsForPeriod(selectedVoPeriod);for(i=0,ln=adaptationsForType.length;i<ln;i++){data=adaptationsForType[i];idx=dashManifestModel.getIndexForAdaptation(data,manifest,streamInfo.index);media=convertAdaptationToMediaInfo(voAdaptations[periodId][idx]);if(type===constants.EMBEDDED_TEXT){var accessibilityLength=media.accessibility.length;for(j=0;j<accessibilityLength;j++){if(!media){continue;}var accessibility=media.accessibility[j];if(accessibility.indexOf('cea-608:')===0){var value=accessibility.substring(8);var parts=value.split(';');if(parts[0].substring(0,2)==='CC'){for(j=0;j<parts.length;j++){if(!media){media=convertAdaptationToMediaInfo.call(this,voAdaptations[periodId][idx]);}convertVideoInfoToEmbeddedTextInfo(media,parts[j].substring(0,3),parts[j].substring(4));mediaArr.push(media);media=null;}}else{for(j=0;j<parts.length;j++){// Only languages for CC1, CC2, ...
if(!media){media=convertAdaptationToMediaInfo.call(this,voAdaptations[periodId][idx]);}convertVideoInfoToEmbeddedTextInfo(media,'CC'+(j+1),parts[j]);mediaArr.push(media);media=null;}}}else if(accessibility.indexOf('cea-608')===0){// Nothing known. We interpret it as CC1=eng
convertVideoInfoToEmbeddedTextInfo(media,constants.CC1,'eng');mediaArr.push(media);media=null;}}}else if(type===constants.IMAGE){convertVideoInfoToThumbnailInfo(media);mediaArr.push(media);media=null;}else if(media){mediaArr.push(media);}}return mediaArr;}/**
     * @param {object} newManifest
     * @returns {*}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function updatePeriods(newManifest){if(!newManifest)return null;checkConfig();voPeriods=getRegularPeriods(newManifest);voAdaptations={};}/**
     * @param {object} externalManifest
     * @param {number} maxStreamsInfo
     * @returns {Array} streams
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getStreamsInfo(externalManifest,maxStreamsInfo){var streams=[];var voLocalPeriods=voPeriods;//if manifest is defined, getStreamsInfo is for an outside manifest, not the current one
if(externalManifest){checkConfig();voLocalPeriods=getRegularPeriods(externalManifest);}if(voLocalPeriods.length>0){if(!maxStreamsInfo||maxStreamsInfo>voLocalPeriods.length){maxStreamsInfo=voLocalPeriods.length;}for(var i=0;i<maxStreamsInfo;i++){streams.push(convertPeriodToStreamInfo(voLocalPeriods[i]));}}return streams;}/**
     *
     * @param {object} streamInfo
     * @param {object} mediaInfo
     * @returns {object} realAdaptation
     * @memberOf module:DashAdapter
     * @instance
     */function getRealAdaptation(streamInfo,mediaInfo){var id=void 0,realAdaptation=void 0;var selectedVoPeriod=getPeriodForStreamInfo(streamInfo,voPeriods);id=mediaInfo?mediaInfo.id:null;if(voPeriods.length>0&&selectedVoPeriod){realAdaptation=id?dashManifestModel.getAdaptationForId(id,voPeriods[0].mpd.manifest,selectedVoPeriod.index):dashManifestModel.getAdaptationForIndex(mediaInfo?mediaInfo.index:null,voPeriods[0].mpd.manifest,selectedVoPeriod.index);}return realAdaptation;}/**
     * Returns all voRepresentations for a given mediaInfo
     * @param {object} mediaInfo
     * @returns {Array} voReps
     * @memberOf module:DashAdapter
     * @instance
     */function getVoRepresentations(mediaInfo){var voReps=void 0;var voAdaptation=getAdaptationForMediaInfo(mediaInfo);voReps=dashManifestModel.getRepresentationsForAdaptation(voAdaptation);return voReps;}/**
     *
     * @param {object} eventBox
     * @param {Array} eventStreams
     * @param {number} startTime
     * @returns {null|Event}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getEvent(eventBox,eventStreams,startTime){if(!eventBox||!eventStreams){return null;}var event=new _Event2.default();var schemeIdUri=eventBox.scheme_id_uri;var value=eventBox.value;var timescale=eventBox.timescale;var presentationTimeDelta=void 0;var calculatedPresentationTime=void 0;if(eventBox.version===0){presentationTimeDelta=eventBox.presentation_time_delta;calculatedPresentationTime=startTime*timescale+presentationTimeDelta;}else{presentationTimeDelta=0;calculatedPresentationTime=eventBox.presentation_time_delta;}var duration=eventBox.event_duration;var id=eventBox.id;var messageData=eventBox.message_data;if(!eventStreams[schemeIdUri+'/'+value])return null;event.eventStream=eventStreams[schemeIdUri+'/'+value];event.eventStream.value=value;event.eventStream.timescale=timescale;event.duration=duration;event.id=id;event.calculatedPresentationTime=calculatedPresentationTime;event.messageData=messageData;event.presentationTimeDelta=presentationTimeDelta;return event;}/**
     *
     * @param {object} info
     * @param {object} voRepresentation
     * @returns {Array}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getEventsFor(info,voRepresentation){var events=[];if(voPeriods.length>0){var manifest=voPeriods[0].mpd.manifest;if(info instanceof _StreamInfo2.default){events=dashManifestModel.getEventsForPeriod(getPeriodForStreamInfo(info,voPeriods));}else if(info instanceof _MediaInfo2.default){events=dashManifestModel.getEventStreamForAdaptationSet(manifest,getAdaptationForMediaInfo(info));}else if(info instanceof _RepresentationInfo2.default){events=dashManifestModel.getEventStreamForRepresentation(manifest,voRepresentation);}}return events;}/**
     *
     * @param {number} streamId
     * @param {MediaType} type
     * @param {object} mediaInfo
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function setCurrentMediaInfo(streamId,type,mediaInfo){currentMediaInfo[streamId]=currentMediaInfo[streamId]||{};currentMediaInfo[streamId][type]=currentMediaInfo[streamId][type]||{};currentMediaInfo[streamId][type]=mediaInfo;}/**
     *
     * @param {String} type
     * @returns {boolean}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getIsTextTrack(type){return dashManifestModel.getIsTextTrack(type);}/**
     * Returns the UTC Timing Sources specified in the manifest
     * @returns {Array} utcTimingSources
     * @memberOf module:DashAdapter
     * @instance
     */function getUTCTimingSources(){var manifest=getManifest();return dashManifestModel.getUTCTimingSources(manifest);}/**
     * Returns the suggestedPresentationDelay as specified in the manifest
     * @returns {String} suggestedPresentationDelay
     * @memberOf module:DashAdapter
     * @instance
     */function getSuggestedPresentationDelay(){var mpd=voPeriods.length>0?voPeriods[0].mpd:null;return dashManifestModel.getSuggestedPresentationDelay(mpd);}/**
     * Returns the availabilityStartTime as specified in the manifest
     * @param {object} externalManifest Omit this value if no external manifest should be used
     * @returns {string} availabilityStartTime
     * @memberOf module:DashAdapter
     * @instance
     */function getAvailabilityStartTime(externalManifest){var mpd=getMpd(externalManifest);return dashManifestModel.getAvailabilityStartTime(mpd);}/**
     * Returns a boolean indicating if the manifest is dynamic or not
     * @param {object} externalManifest Omit this value if no external manifest should be used
     * @returns {boolean}
     * @memberOf module:DashAdapter
     * @instance
     */function getIsDynamic(externalManifest){var manifest=getManifest(externalManifest);return dashManifestModel.getIsDynamic(manifest);}/**
     * Returns the duration of the MPD
     * @param {object} externalManifest Omit this value if no external manifest should be used
     * @returns {number} duration
     * @memberOf module:DashAdapter
     * @instance
     */function getDuration(externalManifest){var manifest=getManifest(externalManifest);return dashManifestModel.getDuration(manifest);}/**
     * Returns all periods of the MPD
     * @param {object} externalManifest Omit this value if no external manifest should be used
     * @returns {Array} periods
     * @memberOf module:DashAdapter
     * @instance
     */function getRegularPeriods(externalManifest){var mpd=getMpd(externalManifest);return dashManifestModel.getRegularPeriods(mpd);}/**
     * Returns an MPD object
     * @param {object} externalManifest Omit this value if no external manifest should be used
     * @returns {object} MPD
     * @memberOf module:DashAdapter
     * @instance
     */function getMpd(externalManifest){var manifest=getManifest(externalManifest);return dashManifestModel.getMpd(manifest);}/**
     * Returns the location element of the MPD
     * @param {object} manifest
     * @returns {String} location
     * @memberOf module:DashAdapter
     * @instance
     */function getLocation(manifest){return dashManifestModel.getLocation(manifest);}/**
     * Returns the manifest update period used for dynamic manifests
     * @param {object} manifest
     * @param {number} latencyOfLastUpdate
     * @returns {NaN|number} manifestUpdatePeriod
     * @memberOf module:DashAdapter
     * @instance
     */function getManifestUpdatePeriod(manifest){var latencyOfLastUpdate=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;return dashManifestModel.getManifestUpdatePeriod(manifest,latencyOfLastUpdate);}/**
     * Checks if the manifest has a DVB profile
     * @param {object} manifest
     * @returns {boolean}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getIsDVB(manifest){return dashManifestModel.hasProfile(manifest,PROFILE_DVB);}/**
     *
     * @param {object} node
     * @returns {Array}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getBaseURLsFromElement(node){return dashManifestModel.getBaseURLsFromElement(node);}/**
     *
     * @returns {*}
     * @memberOf module:DashAdapter
     * @instance
     * @ignore
     */function getRepresentationSortFunction(){return dashManifestModel.getRepresentationSortFunction();}/**
     * Returns the codec for a given adaptation set and a given representation id.
     * @param {object} adaptation
     * @param {number} representationId
     * @param {boolean} addResolutionInfo Defines whether to include resolution information in the output
     * @returns {String} codec
     * @memberOf module:DashAdapter
     * @instance
     */function getCodec(adaptation,representationId,addResolutionInfo){return dashManifestModel.getCodec(adaptation,representationId,addResolutionInfo);}/**
     * Returns the bandwidth for a given representation id
     * @param {number} representationId
     * @param {number} periodIdx
     * @returns {number} bandwidth
     * @memberOf module:DashAdapter
     * @instance
     */function getBandwidthForRepresentation(representationId,periodIdx){var representation=void 0;var period=getPeriod(periodIdx);representation=findRepresentation(period,representationId);return representation?representation.bandwidth:null;}/**
     * Returns the index for a given representation id
     * @param {string} representationId
     * @param {number} periodIdx
     * @returns {number} index
     * @memberOf module:DashAdapter
     * @instance
     */function getIndexForRepresentation(representationId,periodIdx){var period=getPeriod(periodIdx);return findRepresentationIndex(period,representationId);}/**
     * This method returns the current max index based on what is defined in the MPD.
     *
     * @param {string} bufferType - String 'audio' or 'video',
     * @param {number} periodIdx - Make sure this is the period index not id
     * @return {number}
     * @memberof module:DashAdapter
     * @instance
     */function getMaxIndexForBufferType(bufferType,periodIdx){var period=getPeriod(periodIdx);return findMaxBufferIndex(period,bufferType);}/**
     * Returns the voPeriod object for a given id
     * @param {String} id
     * @returns {object|null}
     */function getPeriodById(id){if(!id||voPeriods.length===0){return null;}var periods=voPeriods.filter(function(p){return p.id===id;});if(periods&&periods.length>0){return periods[0];}return null;}function reset(){voPeriods=[];voAdaptations={};currentMediaInfo={};}// #endregion PUBLIC FUNCTIONS
// #region PRIVATE FUNCTIONS
// --------------------------------------------------
function getManifest(externalManifest){return externalManifest?externalManifest:voPeriods.length>0?voPeriods[0].mpd.manifest:null;}function getAdaptationForMediaInfo(mediaInfo){if(!mediaInfo||!mediaInfo.streamInfo||mediaInfo.streamInfo.id===undefined||!voAdaptations[mediaInfo.streamInfo.id])return null;return voAdaptations[mediaInfo.streamInfo.id][mediaInfo.index];}function getPeriodForStreamInfo(streamInfo,voPeriodsArray){var ln=voPeriodsArray.length;for(var i=0;i<ln;i++){var voPeriod=voPeriodsArray[i];if(streamInfo&&streamInfo.id===voPeriod.id)return voPeriod;}return null;}function convertAdaptationToMediaInfo(adaptation){if(!adaptation){return null;}var mediaInfo=new _MediaInfo2.default();var realAdaptation=adaptation.period.mpd.manifest.Period_asArray[adaptation.period.index].AdaptationSet_asArray[adaptation.index];var viewpoint=void 0;mediaInfo.id=adaptation.id;mediaInfo.index=adaptation.index;mediaInfo.type=adaptation.type;mediaInfo.streamInfo=convertPeriodToStreamInfo(adaptation.period);mediaInfo.representationCount=dashManifestModel.getRepresentationCount(realAdaptation);mediaInfo.labels=dashManifestModel.getLabelsForAdaptation(realAdaptation);mediaInfo.lang=dashManifestModel.getLanguageForAdaptation(realAdaptation);viewpoint=dashManifestModel.getViewpointForAdaptation(realAdaptation);mediaInfo.viewpoint=viewpoint?viewpoint.value:undefined;mediaInfo.accessibility=dashManifestModel.getAccessibilityForAdaptation(realAdaptation).map(function(accessibility){var accessibilityValue=accessibility.value;var accessibilityData=accessibilityValue;if(accessibility.schemeIdUri&&accessibility.schemeIdUri.search('cea-608')>=0&&typeof cea608parser!=='undefined'){if(accessibilityValue){accessibilityData='cea-608:'+accessibilityValue;}else{accessibilityData='cea-608';}mediaInfo.embeddedCaptions=true;}return accessibilityData;});mediaInfo.audioChannelConfiguration=dashManifestModel.getAudioChannelConfigurationForAdaptation(realAdaptation).map(function(audioChannelConfiguration){return audioChannelConfiguration.value;});if(mediaInfo.audioChannelConfiguration.length===0&&Array.isArray(realAdaptation.Representation_asArray)&&realAdaptation.Representation_asArray.length>0){mediaInfo.audioChannelConfiguration=dashManifestModel.getAudioChannelConfigurationForRepresentation(realAdaptation.Representation_asArray[0]).map(function(audioChannelConfiguration){return audioChannelConfiguration.value;});}mediaInfo.roles=dashManifestModel.getRolesForAdaptation(realAdaptation).map(function(role){return role.value;});mediaInfo.codec=dashManifestModel.getCodec(realAdaptation);mediaInfo.mimeType=dashManifestModel.getMimeType(realAdaptation);mediaInfo.contentProtection=dashManifestModel.getContentProtectionData(realAdaptation);mediaInfo.bitrateList=dashManifestModel.getBitrateListForAdaptation(realAdaptation);if(mediaInfo.contentProtection){mediaInfo.contentProtection.forEach(function(item){item.KID=dashManifestModel.getKID(item);});}mediaInfo.isText=dashManifestModel.getIsTextTrack(mediaInfo.mimeType);mediaInfo.supplementalProperties=dashManifestModel.getSupplementalPropperties(realAdaptation);return mediaInfo;}function convertVideoInfoToEmbeddedTextInfo(mediaInfo,channel,lang){mediaInfo.id=channel;// CC1, CC2, CC3, or CC4
mediaInfo.index=100+parseInt(channel.substring(2,3));mediaInfo.type=constants.EMBEDDED_TEXT;mediaInfo.codec='cea-608-in-SEI';mediaInfo.isText=true;mediaInfo.isEmbedded=true;mediaInfo.lang=lang;mediaInfo.roles=['caption'];}function convertVideoInfoToThumbnailInfo(mediaInfo){mediaInfo.type=constants.IMAGE;}function convertPeriodToStreamInfo(period){var streamInfo=new _StreamInfo2.default();var THRESHOLD=1;streamInfo.id=period.id;streamInfo.index=period.index;streamInfo.start=period.start;streamInfo.duration=period.duration;streamInfo.manifestInfo=convertMpdToManifestInfo(period.mpd);streamInfo.isLast=period.mpd.manifest.Period_asArray.length===1||Math.abs(streamInfo.start+streamInfo.duration-streamInfo.manifestInfo.duration)<THRESHOLD;return streamInfo;}function convertMpdToManifestInfo(mpd){var manifestInfo=new _ManifestInfo2.default();manifestInfo.DVRWindowSize=mpd.timeShiftBufferDepth;manifestInfo.loadedTime=mpd.manifest.loadedTime;manifestInfo.availableFrom=mpd.availabilityStartTime;manifestInfo.minBufferTime=mpd.manifest.minBufferTime;manifestInfo.maxFragmentDuration=mpd.maxSegmentDuration;manifestInfo.duration=dashManifestModel.getDuration(mpd.manifest);manifestInfo.isDynamic=dashManifestModel.getIsDynamic(mpd.manifest);manifestInfo.serviceDescriptions=dashManifestModel.getServiceDescriptions(mpd.manifest);manifestInfo.protocol=mpd.manifest.protocol;return manifestInfo;}function checkConfig(){if(!constants){throw new Error('setConfig function has to be called previously');}}function getPeriod(periodIdx){return voPeriods.length>0?voPeriods[0].mpd.manifest.Period_asArray[periodIdx]:null;}function findRepresentationIndex(period,representationId){var index=findRepresentation(period,representationId,true);return index!==null?index:-1;}function findRepresentation(period,representationId,returnIndex){var adaptationSet=void 0,adaptationSetArray=void 0,representation=void 0,representationArray=void 0,adaptationSetArrayIndex=void 0,representationArrayIndex=void 0;if(period){adaptationSetArray=period.AdaptationSet_asArray;for(adaptationSetArrayIndex=0;adaptationSetArrayIndex<adaptationSetArray.length;adaptationSetArrayIndex=adaptationSetArrayIndex+1){adaptationSet=adaptationSetArray[adaptationSetArrayIndex];representationArray=adaptationSet.Representation_asArray;for(representationArrayIndex=0;representationArrayIndex<representationArray.length;representationArrayIndex=representationArrayIndex+1){representation=representationArray[representationArrayIndex];if(representationId===representation.id){if(returnIndex){return representationArrayIndex;}else{return representation;}}}}}return null;}function findMaxBufferIndex(period,bufferType){var adaptationSet=void 0,adaptationSetArray=void 0,representationArray=void 0,adaptationSetArrayIndex=void 0;if(!period||!bufferType)return-1;adaptationSetArray=period.AdaptationSet_asArray;for(adaptationSetArrayIndex=0;adaptationSetArrayIndex<adaptationSetArray.length;adaptationSetArrayIndex=adaptationSetArrayIndex+1){adaptationSet=adaptationSetArray[adaptationSetArrayIndex];representationArray=adaptationSet.Representation_asArray;if(dashManifestModel.getIsTypeOf(adaptationSet,bufferType)){return representationArray.length;}}return-1;}// #endregion PRIVATE FUNCTIONS
instance={getBandwidthForRepresentation:getBandwidthForRepresentation,getIndexForRepresentation:getIndexForRepresentation,getMaxIndexForBufferType:getMaxIndexForBufferType,convertDataToRepresentationInfo:convertRepresentationToRepresentationInfo,getDataForMedia:getAdaptationForMediaInfo,getStreamsInfo:getStreamsInfo,getMediaInfoForType:getMediaInfoForType,getAllMediaInfoForType:getAllMediaInfoForType,getAdaptationForType:getAdaptationForType,getRealAdaptation:getRealAdaptation,getVoRepresentations:getVoRepresentations,getEventsFor:getEventsFor,getEvent:getEvent,getMpd:getMpd,setConfig:setConfig,updatePeriods:updatePeriods,getIsTextTrack:getIsTextTrack,getUTCTimingSources:getUTCTimingSources,getSuggestedPresentationDelay:getSuggestedPresentationDelay,getAvailabilityStartTime:getAvailabilityStartTime,getIsDynamic:getIsDynamic,getDuration:getDuration,getRegularPeriods:getRegularPeriods,getLocation:getLocation,getManifestUpdatePeriod:getManifestUpdatePeriod,getIsDVB:getIsDVB,getBaseURLsFromElement:getBaseURLsFromElement,getRepresentationSortFunction:getRepresentationSortFunction,getCodec:getCodec,getVoAdaptations:getVoAdaptations,getVoPeriods:getVoPeriods,getPeriodById:getPeriodById,setCurrentMediaInfo:setCurrentMediaInfo,reset:reset};setup();return instance;}DashAdapter.__dashjs_factory_name='DashAdapter';exports.default=_FactoryMaker2.default.getSingletonFactory(DashAdapter);
//# sourceMappingURL=DashAdapter.js.map
