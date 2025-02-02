'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _FactoryMaker=require('../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _Debug=require('../../core/Debug');var _Debug2=_interopRequireDefault(_Debug);var _EventBus=require('../../core/EventBus');var _EventBus2=_interopRequireDefault(_EventBus);var _Events=require('../../core/events/Events');var _Events2=_interopRequireDefault(_Events);var _imsc=require('imsc');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function TTMLParser(){var context=this.context;var eventBus=(0,_EventBus2.default)(context).getInstance();/*
     * This TTML parser follows "EBU-TT-D SUBTITLING DISTRIBUTION FORMAT - tech3380" spec - https://tech.ebu.ch/docs/tech/tech3380.pdf.
     * */var instance=void 0,logger=void 0;var cueCounter=0;// Used to give every cue a unique ID.
function setup(){logger=(0,_Debug2.default)(context).getInstance().getLogger(instance);}function getCueID(){var id='cue_TTML_'+cueCounter;cueCounter++;return id;}/**
     * Parse the raw data and process it to return the HTML element representing the cue.
     * Return the region to be processed and controlled (hide/show) by the caption controller.
     * @param {string} data - raw data received from the TextSourceBuffer
     * @param {number} offsetTime - offset time to apply to cue time
     * @param {integer} startTimeSegment - startTime for the current segment
     * @param {integer} endTimeSegment - endTime for the current segment
     * @param {Array} images - images array referenced by subs MP4 box
     */function parse(data,offsetTime,startTimeSegment,endTimeSegment,images){var errorMsg='';var captionArray=[];var startTime=void 0,endTime=void 0,i=void 0;var content={};var embeddedImages={};var currentImageId='';var accumulated_image_data='';var metadataHandler={onOpenTag:function onOpenTag(ns,name,attrs){if(name==='image'&&(ns==='http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt'||ns==='http://www.smpte-ra.org/schemas/2052-1/2013/smpte-tt')){if(!attrs[' imageType']||attrs[' imageType'].value!=='PNG'){logger.warn('smpte-tt imageType != PNG. Discarded');return;}currentImageId=attrs['http://www.w3.org/XML/1998/namespace id'].value;}},onCloseTag:function onCloseTag(){if(currentImageId){embeddedImages[currentImageId]=accumulated_image_data.trim();}accumulated_image_data='';currentImageId='';},onText:function onText(contents){if(currentImageId){accumulated_image_data=accumulated_image_data+contents;}}};if(!data){errorMsg='no ttml data to parse';throw new Error(errorMsg);}content.data=data;eventBus.trigger(_Events2.default.TTML_TO_PARSE,content);var imsc1doc=(0,_imsc.fromXML)(content.data,function(msg){errorMsg=msg;},metadataHandler);eventBus.trigger(_Events2.default.TTML_PARSED,{ttmlString:content.data,ttmlDoc:imsc1doc});var mediaTimeEvents=imsc1doc.getMediaTimeEvents();for(i=0;i<mediaTimeEvents.length;i++){var isd=(0,_imsc.generateISD)(imsc1doc,mediaTimeEvents[i],function(error){errorMsg=error;});if(isd.contents.some(function(topLevelContents){return topLevelContents.contents.length;})){//be sure that mediaTimeEvents values are in the mp4 segment time ranges.
startTime=mediaTimeEvents[i]+offsetTime<startTimeSegment?startTimeSegment:mediaTimeEvents[i]+offsetTime;endTime=mediaTimeEvents[i+1]+offsetTime>endTimeSegment?endTimeSegment:mediaTimeEvents[i+1]+offsetTime;if(startTime<endTime){captionArray.push({start:startTime,end:endTime,type:'html',cueID:getCueID(),isd:isd,images:images,embeddedImages:embeddedImages});}}}if(errorMsg!==''){logger.error(errorMsg);throw new Error(errorMsg);}return captionArray;}instance={parse:parse};setup();return instance;}/**
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
 */TTMLParser.__dashjs_factory_name='TTMLParser';exports.default=_FactoryMaker2.default.getSingletonFactory(TTMLParser);
//# sourceMappingURL=TTMLParser.js.map
