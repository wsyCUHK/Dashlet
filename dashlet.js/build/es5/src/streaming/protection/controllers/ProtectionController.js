'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/**
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
 */var _CommonEncryption=require('../CommonEncryption');var _CommonEncryption2=_interopRequireDefault(_CommonEncryption);var _MediaCapability=require('../vo/MediaCapability');var _MediaCapability2=_interopRequireDefault(_MediaCapability);var _KeySystemConfiguration=require('../vo/KeySystemConfiguration');var _KeySystemConfiguration2=_interopRequireDefault(_KeySystemConfiguration);var _ProtectionErrors=require('../errors/ProtectionErrors');var _ProtectionErrors2=_interopRequireDefault(_ProtectionErrors);var _DashJSError=require('../../vo/DashJSError');var _DashJSError2=_interopRequireDefault(_DashJSError);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var NEEDKEY_BEFORE_INITIALIZE_RETRIES=5;var NEEDKEY_BEFORE_INITIALIZE_TIMEOUT=500;var LICENSE_SERVER_REQUEST_RETRIES=3;var LICENSE_SERVER_REQUEST_RETRY_INTERVAL=1000;var LICENSE_SERVER_REQUEST_DEFAULT_TIMEOUT=8000;/**
 * @module ProtectionController
 * @description Provides access to media protection information and functionality.  Each
 * ProtectionController manages a single {@link MediaPlayer.models.ProtectionModel}
 * which encapsulates a set of protection information (EME APIs, selected key system,
 * key sessions).  The APIs of ProtectionController mostly align with the latest EME
 * APIs.  Key system selection is mostly automated when combined with app-overrideable
 * functionality provided in {@link ProtectionKeyController}.
 * @todo ProtectionController does almost all of its tasks automatically after init() is
 * called.  Applications might want more control over this process and want to go through
 * each step manually (key system selection, session creation, session maintenance).
 * @param {Object} config
 */function ProtectionController(config){config=config||{};var protectionKeyController=config.protectionKeyController;var protectionModel=config.protectionModel;var eventBus=config.eventBus;var events=config.events;var debug=config.debug;var BASE64=config.BASE64;var constants=config.constants;var needkeyRetries=[];var instance=void 0,logger=void 0,pendingNeedKeyData=void 0,mediaInfoArr=void 0,protDataSet=void 0,sessionType=void 0,robustnessLevel=void 0,keySystem=void 0;function setup(){logger=debug.getLogger(instance);pendingNeedKeyData=[];mediaInfoArr=[];sessionType='temporary';robustnessLevel='';}function checkConfig(){if(!eventBus||!eventBus.hasOwnProperty('on')||!protectionKeyController||!protectionKeyController.hasOwnProperty('getSupportedKeySystemsFromContentProtection')){throw new Error('Missing config parameter(s)');}}/**
     * Initialize this protection system with a given audio
     * or video stream information.
     *
     * @param {StreamInfo} [mediaInfo] Media information
     * @memberof module:ProtectionController
     * @instance
     * @todo This API will change when we have better support for allowing applications
     * to select different adaptation sets for playback.  Right now it is clunky for
     * applications to create {@link StreamInfo} with the right information,
     * @ignore
     */function initializeForMedia(mediaInfo){// Not checking here if a session for similar KS/KID combination is already created
// because still don't know which keysystem will be selected.
// Once Keysystem is selected and before creating the session, we will do that check
// so we create the strictly necessary DRM sessions
if(!mediaInfo){throw new Error('mediaInfo can not be null or undefined');}checkConfig();eventBus.on(events.INTERNAL_KEY_MESSAGE,onKeyMessage,this);eventBus.on(events.INTERNAL_KEY_STATUS_CHANGED,onKeyStatusChanged,this);mediaInfoArr.push(mediaInfo);// ContentProtection elements are specified at the AdaptationSet level, so the CP for audio
// and video will be the same.  Just use one valid MediaInfo object
var supportedKS=protectionKeyController.getSupportedKeySystemsFromContentProtection(mediaInfo.contentProtection);if(supportedKS&&supportedKS.length>0){selectKeySystem(supportedKS,true);}}/**
     * Returns a set of supported key systems and CENC initialization data
     * from the given array of ContentProtection elements.  Only
     * key systems that are supported by this player will be returned.
     * Key systems are returned in priority order (highest first).
     *
     * @param {Array.<Object>} cps - array of content protection elements parsed
     * from the manifest
     * @returns {Array.<Object>} array of objects indicating which supported key
     * systems were found.  Empty array is returned if no
     * supported key systems were found
     * @memberof module:ProtectionKeyController
     * @instance
     * @ignore
     */function getSupportedKeySystemsFromContentProtection(cps){checkConfig();return protectionKeyController.getSupportedKeySystemsFromContentProtection(cps);}/**
     * Create a new key session associated with the given initialization data from
     * the MPD or from the PSSH box in the media
     *
     * @param {ArrayBuffer} initData the initialization data
     * @param {Uint8Array} cdmData the custom data to provide to licenser
     * @memberof module:ProtectionController
     * @instance
     * @fires ProtectionController#KeySessionCreated
     * @todo In older versions of the EME spec, there was a one-to-one relationship between
     * initialization data and key sessions.  That is no longer true in the latest APIs.  This
     * API will need to modified (and a new "generateRequest(keySession, initData)" API created)
     * to come up to speed with the latest EME standard
     * @ignore
     */function createKeySession(initData,cdmData){var initDataForKS=_CommonEncryption2.default.getPSSHForKeySystem(keySystem,initData);var protData=getProtData(keySystem);if(initDataForKS){// Check for duplicate initData
var currentInitData=protectionModel.getAllInitData();for(var i=0;i<currentInitData.length;i++){if(protectionKeyController.initDataEquals(initDataForKS,currentInitData[i])){logger.warn('DRM: Ignoring initData because we have already seen it!');return;}}try{protectionModel.createKeySession(initDataForKS,protData,getSessionType(keySystem),cdmData);}catch(error){eventBus.trigger(events.KEY_SESSION_CREATED,{data:null,error:new _DashJSError2.default(_ProtectionErrors2.default.KEY_SESSION_CREATED_ERROR_CODE,_ProtectionErrors2.default.KEY_SESSION_CREATED_ERROR_MESSAGE+error.message)});}}else if(initData){protectionModel.createKeySession(initData,protData,getSessionType(keySystem),cdmData);}else{eventBus.trigger(events.KEY_SESSION_CREATED,{data:null,error:new _DashJSError2.default(_ProtectionErrors2.default.KEY_SESSION_CREATED_ERROR_CODE,_ProtectionErrors2.default.KEY_SESSION_CREATED_ERROR_MESSAGE+'Selected key system is '+(keySystem?keySystem.systemString:null)+'.  needkey/encrypted event contains no initData corresponding to that key system!')});}}/**
     * Loads a key session with the given session ID from persistent storage.  This
     * essentially creates a new key session
     *
     * @param {string} sessionID
     * @param {string} initData
     * @memberof module:ProtectionController
     * @instance
     * @fires ProtectionController#KeySessionCreated
     * @ignore
     */function loadKeySession(sessionID,initData){checkConfig();protectionModel.loadKeySession(sessionID,initData,getSessionType(keySystem));}/**
     * Removes the given key session from persistent storage and closes the session
     * as if {@link ProtectionController#closeKeySession}
     * was called
     *
     * @param {SessionToken} sessionToken the session
     * token
     * @memberof module:ProtectionController
     * @instance
     * @fires ProtectionController#KeySessionRemoved
     * @fires ProtectionController#KeySessionClosed
     * @ignore
     */function removeKeySession(sessionToken){checkConfig();protectionModel.removeKeySession(sessionToken);}/**
     * Closes the key session and releases all associated decryption keys.  These
     * keys will no longer be available for decrypting media
     *
     * @param {SessionToken} sessionToken the session
     * token
     * @memberof module:ProtectionController
     * @instance
     * @fires ProtectionController#KeySessionClosed
     * @ignore
     */function closeKeySession(sessionToken){checkConfig();protectionModel.closeKeySession(sessionToken);}/**
     * Sets a server certificate for use by the CDM when signing key messages
     * intended for a particular license server.  This will fire
     * an error event if a key system has not yet been selected.
     *
     * @param {ArrayBuffer} serverCertificate a CDM-specific license server
     * certificate
     * @memberof module:ProtectionController
     * @instance
     * @fires ProtectionController#ServerCertificateUpdated
     */function setServerCertificate(serverCertificate){checkConfig();protectionModel.setServerCertificate(serverCertificate);}/**
     * Associate this protection system with the given HTMLMediaElement.  This
     * causes the system to register for needkey/encrypted events from the given
     * element and provides a destination for setting of MediaKeys
     *
     * @param {HTMLMediaElement} element the media element to which the protection
     * system should be associated
     * @memberof module:ProtectionController
     * @instance
     */function setMediaElement(element){checkConfig();if(element){protectionModel.setMediaElement(element);eventBus.on(events.NEED_KEY,onNeedKey,this);}else if(element===null){protectionModel.setMediaElement(element);eventBus.off(events.NEED_KEY,onNeedKey,this);}}/**
     * Sets the session type to use when creating key sessions.  Either "temporary" or
     * "persistent-license".  Default is "temporary".
     *
     * @param {string} value the session type
     * @memberof module:ProtectionController
     * @instance
     */function setSessionType(value){sessionType=value;}/**
     * Sets the robustness level for video and audio capabilities. Optional to remove Chrome warnings.
     * Possible values are SW_SECURE_CRYPTO, SW_SECURE_DECODE, HW_SECURE_CRYPTO, HW_SECURE_CRYPTO, HW_SECURE_DECODE, HW_SECURE_ALL.
     *
     * @param {string} level the robustness level
     * @memberof module:ProtectionController
     * @instance
     */function setRobustnessLevel(level){robustnessLevel=level;}/**
     * Attach KeySystem-specific data to use for license acquisition with EME
     *
     * @param {Object} data an object containing property names corresponding to
     * key system name strings (e.g. "org.w3.clearkey") and associated values
     * being instances of {@link ProtectionData}
     * @memberof module:ProtectionController
     * @instance
     * @ignore
     */function setProtectionData(data){protDataSet=data;protectionKeyController.setProtectionData(data);}/**
     * Stop method is called when current playback is stopped/resetted.
     *
     * @memberof module:ProtectionController
     * @instance
     */function stop(){if(protectionModel){protectionModel.stop();}}/**
     * Destroys all protection data associated with this protection set.  This includes
     * deleting all key sessions. In the case of persistent key sessions, the sessions
     * will simply be unloaded and not deleted.  Additionally, if this protection set is
     * associated with a HTMLMediaElement, it will be detached from that element.
     *
     * @memberof module:ProtectionController
     * @instance
     * @ignore
     */function reset(){checkConfig();eventBus.off(events.INTERNAL_KEY_MESSAGE,onKeyMessage,this);eventBus.off(events.INTERNAL_KEY_STATUS_CHANGED,onKeyStatusChanged,this);setMediaElement(null);keySystem=undefined;//TODO-Refactor look at why undefined is needed for this. refactor
if(protectionModel){protectionModel.reset();protectionModel=null;}needkeyRetries.forEach(function(retryTimeout){return clearTimeout(retryTimeout);});needkeyRetries=[];mediaInfoArr=[];}///////////////
// Private
///////////////
function getProtData(keySystem){var protData=null;if(keySystem){var keySystemString=keySystem.systemString;if(protDataSet){protData=keySystemString in protDataSet?protDataSet[keySystemString]:null;}}return protData;}function getKeySystemConfiguration(keySystem){var protData=getProtData(keySystem);var audioCapabilities=[];var videoCapabilities=[];var audioRobustness=protData&&protData.audioRobustness&&protData.audioRobustness.length>0?protData.audioRobustness:robustnessLevel;var videoRobustness=protData&&protData.videoRobustness&&protData.videoRobustness.length>0?protData.videoRobustness:robustnessLevel;var ksSessionType=getSessionType(keySystem);var distinctiveIdentifier=protData&&protData.distinctiveIdentifier?protData.distinctiveIdentifier:'optional';var persistentState=protData&&protData.persistentState?protData.persistentState:ksSessionType==='temporary'?'optional':'required';mediaInfoArr.forEach(function(media){if(media.type===constants.AUDIO){audioCapabilities.push(new _MediaCapability2.default(media.codec,audioRobustness));}else if(media.type===constants.VIDEO){videoCapabilities.push(new _MediaCapability2.default(media.codec,videoRobustness));}});return new _KeySystemConfiguration2.default(audioCapabilities,videoCapabilities,distinctiveIdentifier,persistentState,[ksSessionType]);}function getSessionType(keySystem){var protData=getProtData(keySystem);var ksSessionType=protData&&protData.sessionType?protData.sessionType:sessionType;return ksSessionType;}function selectKeySystem(supportedKS,fromManifest){var self=this;var requestedKeySystems=[];// Reorder key systems according to priority order provided in protectionData
supportedKS=supportedKS.sort(function(ksA,ksB){var indexA=protDataSet&&protDataSet[ksA.ks.systemString]&&protDataSet[ksA.ks.systemString].priority>=0?protDataSet[ksA.ks.systemString].priority:supportedKS.length;var indexB=protDataSet&&protDataSet[ksB.ks.systemString]&&protDataSet[ksB.ks.systemString].priority>=0?protDataSet[ksB.ks.systemString].priority:supportedKS.length;return indexA-indexB;});var ksIdx=void 0;if(keySystem){// We have a key system
for(ksIdx=0;ksIdx<supportedKS.length;ksIdx++){if(keySystem===supportedKS[ksIdx].ks){var _ret=function(){requestedKeySystems.push({ks:supportedKS[ksIdx].ks,configs:[getKeySystemConfiguration(keySystem)]});// Ensure that we would be granted key system access using the key
// system and codec information
var onKeySystemAccessComplete=function onKeySystemAccessComplete(event){eventBus.off(events.KEY_SYSTEM_ACCESS_COMPLETE,onKeySystemAccessComplete,self);if(event.error){if(!fromManifest){eventBus.trigger(events.KEY_SYSTEM_SELECTED,{error:new _DashJSError2.default(_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_CODE,_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_MESSAGE+event.error)});}}else{logger.info('DRM: KeySystem Access Granted');eventBus.trigger(events.KEY_SYSTEM_SELECTED,{data:event.data});var protData=getProtData(keySystem);if(protectionKeyController.isClearKey(keySystem)){// For Clearkey: if parameters for generating init data was provided by the user, use them for generating
// initData and overwrite possible initData indicated in encrypted event (EME)
if(protData&&protData.hasOwnProperty('clearkeys')){var initData={kids:Object.keys(protData.clearkeys)};supportedKS[ksIdx].initData=new TextEncoder().encode(JSON.stringify(initData));}}if(supportedKS[ksIdx].sessionId){// Load MediaKeySession with sessionId
loadKeySession(supportedKS[ksIdx].sessionId,supportedKS[ksIdx].initData);}else if(supportedKS[ksIdx].initData){// Create new MediaKeySession with initData
createKeySession(supportedKS[ksIdx].initData,supportedKS[ksIdx].cdmData);}}};eventBus.on(events.KEY_SYSTEM_ACCESS_COMPLETE,onKeySystemAccessComplete,self);protectionModel.requestKeySystemAccess(requestedKeySystems);return'break';}();if(_ret==='break')break;}}}else if(keySystem===undefined){// First time through, so we need to select a key system
keySystem=null;pendingNeedKeyData.push(supportedKS);// Add all key systems to our request list since we have yet to select a key system
for(var i=0;i<supportedKS.length;i++){requestedKeySystems.push({ks:supportedKS[i].ks,configs:[getKeySystemConfiguration(supportedKS[i].ks)]});}var keySystemAccess=void 0;var onKeySystemAccessComplete=function onKeySystemAccessComplete(event){eventBus.off(events.KEY_SYSTEM_ACCESS_COMPLETE,onKeySystemAccessComplete,self);if(event.error){keySystem=undefined;eventBus.off(events.INTERNAL_KEY_SYSTEM_SELECTED,onKeySystemSelected,self);if(!fromManifest){eventBus.trigger(events.KEY_SYSTEM_SELECTED,{data:null,error:new _DashJSError2.default(_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_CODE,_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_MESSAGE+event.error)});}}else{keySystemAccess=event.data;logger.info('DRM: KeySystem Access Granted ('+keySystemAccess.keySystem.systemString+')!  Selecting key system...');protectionModel.selectKeySystem(keySystemAccess);}};var onKeySystemSelected=function onKeySystemSelected(event){eventBus.off(events.INTERNAL_KEY_SYSTEM_SELECTED,onKeySystemSelected,self);eventBus.off(events.KEY_SYSTEM_ACCESS_COMPLETE,onKeySystemAccessComplete,self);if(!event.error){if(!protectionModel){return;}keySystem=protectionModel.getKeySystem();eventBus.trigger(events.KEY_SYSTEM_SELECTED,{data:keySystemAccess});// Set server certificate from protData
var protData=getProtData(keySystem);if(protData&&protData.serverCertificate&&protData.serverCertificate.length>0){protectionModel.setServerCertificate(BASE64.decodeArray(protData.serverCertificate).buffer);}for(var _i=0;_i<pendingNeedKeyData.length;_i++){for(ksIdx=0;ksIdx<pendingNeedKeyData[_i].length;ksIdx++){if(keySystem===pendingNeedKeyData[_i][ksIdx].ks){if(protectionKeyController.isClearKey(keySystem)){// For Clearkey: if parameters for generating init data was provided by the user, use them for generating
// initData and overwrite possible initData indicated in encrypted event (EME)
if(protData&&protData.hasOwnProperty('clearkeys')){var initData={kids:Object.keys(protData.clearkeys)};pendingNeedKeyData[_i][ksIdx].initData=new TextEncoder().encode(JSON.stringify(initData));}}if(pendingNeedKeyData[_i][ksIdx].sessionId){// Load MediaKeySession with sessionId
loadKeySession(pendingNeedKeyData[_i][ksIdx].sessionId,pendingNeedKeyData[_i][ksIdx].initData);}else if(pendingNeedKeyData[_i][ksIdx].initData!==null){// Create new MediaKeySession with initData
createKeySession(pendingNeedKeyData[_i][ksIdx].initData,pendingNeedKeyData[_i][ksIdx].cdmData);}break;}}}}else{keySystem=undefined;if(!fromManifest){eventBus.trigger(events.KEY_SYSTEM_SELECTED,{data:null,error:new _DashJSError2.default(_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_CODE,_ProtectionErrors2.default.KEY_SYSTEM_ACCESS_DENIED_ERROR_MESSAGE+'Error selecting key system! -- '+event.error)});}}};eventBus.on(events.INTERNAL_KEY_SYSTEM_SELECTED,onKeySystemSelected,self);eventBus.on(events.KEY_SYSTEM_ACCESS_COMPLETE,onKeySystemAccessComplete,self);protectionModel.requestKeySystemAccess(requestedKeySystems);}else{// We are in the process of selecting a key system, so just save the data
pendingNeedKeyData.push(supportedKS);}}function sendLicenseRequestCompleteEvent(data,error){eventBus.trigger(events.LICENSE_REQUEST_COMPLETE,{data:data,error:error});}function onKeyStatusChanged(e){if(e.error){eventBus.trigger(events.KEY_STATUSES_CHANGED,{data:null,error:e.error});}else{logger.debug('DRM: key status = '+e.status);}}function onKeyMessage(e){logger.debug('DRM: onKeyMessage');// Dispatch event to applications indicating we received a key message
var keyMessage=e.data;eventBus.trigger(events.KEY_MESSAGE,{data:keyMessage});var messageType=keyMessage.messageType?keyMessage.messageType:'license-request';var message=keyMessage.message;var sessionToken=keyMessage.sessionToken;var protData=getProtData(keySystem);var keySystemString=keySystem?keySystem.systemString:null;var licenseServerData=protectionKeyController.getLicenseServer(keySystem,protData,messageType);var eventData={sessionToken:sessionToken,messageType:messageType};// Ensure message from CDM is not empty
if(!message||message.byteLength===0){sendLicenseRequestCompleteEvent(eventData,new _DashJSError2.default(_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_NO_CHALLENGE_ERROR_CODE,_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_NO_CHALLENGE_ERROR_MESSAGE));return;}// Message not destined for license server
if(!licenseServerData){logger.debug('DRM: License server request not required for this message (type = '+e.data.messageType+').  Session ID = '+sessionToken.getSessionID());sendLicenseRequestCompleteEvent(eventData);return;}// Perform any special handling for ClearKey
if(protectionKeyController.isClearKey(keySystem)){var clearkeys=protectionKeyController.processClearKeyLicenseRequest(keySystem,protData,message);if(clearkeys){logger.debug('DRM: ClearKey license request handled by application!');sendLicenseRequestCompleteEvent(eventData);protectionModel.updateKeySession(sessionToken,clearkeys);return;}}// All remaining key system scenarios require a request to a remote license server
// Determine license server URL
var url=null;if(protData&&protData.serverURL){var serverURL=protData.serverURL;if(typeof serverURL==='string'&&serverURL!==''){url=serverURL;}else if((typeof serverURL==='undefined'?'undefined':_typeof(serverURL))==='object'&&serverURL.hasOwnProperty(messageType)){url=serverURL[messageType];}}else if(protData&&protData.laURL&&protData.laURL!==''){// TODO: Deprecated!
url=protData.laURL;}else{// For clearkey use the url defined in the manifest
if(protectionKeyController.isClearKey(keySystem)){url=keySystem.getLicenseServerUrlFromMediaInfo(mediaInfoArr);}else{var psshData=_CommonEncryption2.default.getPSSHData(sessionToken.initData);url=keySystem.getLicenseServerURLFromInitData(psshData);if(!url){url=e.data.laURL;}}}// Possibly update or override the URL based on the message
url=licenseServerData.getServerURLFromMessage(url,message,messageType);// Ensure valid license server URL
if(!url){sendLicenseRequestCompleteEvent(eventData,new _DashJSError2.default(_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_NO_LICENSE_SERVER_URL_ERROR_CODE,_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_NO_LICENSE_SERVER_URL_ERROR_MESSAGE));return;}// Set optional XMLHttpRequest headers from protection data and message
var reqHeaders={};var withCredentials=false;var updateHeaders=function updateHeaders(headers){if(headers){for(var key in headers){if('authorization'===key.toLowerCase()){withCredentials=true;}reqHeaders[key]=headers[key];}}};if(protData){updateHeaders(protData.httpRequestHeaders);}updateHeaders(keySystem.getRequestHeadersFromMessage(message));// Overwrite withCredentials property from protData if present
if(protData&&typeof protData.withCredentials=='boolean'){withCredentials=protData.withCredentials;}var reportError=function reportError(xhr,eventData,keySystemString,messageType){var errorMsg=xhr.response?licenseServerData.getErrorResponse(xhr.response,keySystemString,messageType):'NONE';sendLicenseRequestCompleteEvent(eventData,new _DashJSError2.default(_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_CODE,_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_MESSAGE+keySystemString+' update, XHR complete. status is "'+xhr.statusText+'" ('+xhr.status+'), readyState is '+xhr.readyState+'.  Response is '+errorMsg));};var onLoad=function onLoad(xhr){if(!protectionModel){return;}if(xhr.status===200){var licenseMessage=licenseServerData.getLicenseMessage(xhr.response,keySystemString,messageType);if(licenseMessage!==null){sendLicenseRequestCompleteEvent(eventData);protectionModel.updateKeySession(sessionToken,licenseMessage);}else{reportError(xhr,eventData,keySystemString,messageType);}}else{reportError(xhr,eventData,keySystemString,messageType);}};var onAbort=function onAbort(xhr){sendLicenseRequestCompleteEvent(eventData,new _DashJSError2.default(_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_CODE,_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_MESSAGE+keySystemString+' update, XHR aborted. status is "'+xhr.statusText+'" ('+xhr.status+'), readyState is '+xhr.readyState));};var onError=function onError(xhr){sendLicenseRequestCompleteEvent(eventData,new _DashJSError2.default(_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_CODE,_ProtectionErrors2.default.MEDIA_KEY_MESSAGE_LICENSER_ERROR_MESSAGE+keySystemString+' update, XHR error. status is "'+xhr.statusText+'" ('+xhr.status+'), readyState is '+xhr.readyState));};//const reqPayload = keySystem.getLicenseRequestFromMessage(message);
var reqPayload=keySystem.getLicenseRequestFromMessage(message);var reqMethod=licenseServerData.getHTTPMethod(messageType);var responseType=licenseServerData.getResponseType(keySystemString,messageType);var timeout=protData&&!isNaN(protData.httpTimeout)?protData.httpTimeout:LICENSE_SERVER_REQUEST_DEFAULT_TIMEOUT;doLicenseRequest(url,reqHeaders,reqMethod,responseType,withCredentials,reqPayload,LICENSE_SERVER_REQUEST_RETRIES,timeout,onLoad,onAbort,onError);}// Implement license requests with a retry mechanism to avoid temporary network issues to affect playback experience
function doLicenseRequest(url,headers,method,responseType,withCredentials,payload,retriesCount,timeout,onLoad,onAbort,onError){var xhr=new XMLHttpRequest();xhr.open(method,url,true);xhr.responseType=responseType;xhr.withCredentials=withCredentials;if(timeout>0){xhr.timeout=timeout;}for(var key in headers){xhr.setRequestHeader(key,headers[key]);}var retryRequest=function retryRequest(){// fail silently and retry
retriesCount--;setTimeout(function(){doLicenseRequest(url,headers,method,responseType,withCredentials,payload,retriesCount,timeout,onLoad,onAbort,onError);},LICENSE_SERVER_REQUEST_RETRY_INTERVAL);};xhr.onload=function(){if(this.status===200||retriesCount<=0){onLoad(this);}else{logger.warn('License request failed ('+this.status+'). Retrying it... Pending retries: '+retriesCount);retryRequest();}};xhr.ontimeout=xhr.onerror=function(){if(retriesCount<=0){onError(this);}else{logger.warn('License request network request failed . Retrying it... Pending retries: '+retriesCount);retryRequest();}};xhr.onabort=function(){onAbort(this);};xhr.send(payload);}function onNeedKey(event,retry){logger.debug('DRM: onNeedKey');// Ignore non-cenc initData
if(event.key.initDataType!=='cenc'){logger.warn('DRM:  Only \'cenc\' initData is supported!  Ignoring initData of type: '+event.key.initDataType);return;}if(mediaInfoArr.length===0){logger.warn('DRM: onNeedKey called before initializeForMedia, wait until initialized');retry=typeof retry==='undefined'?1:retry+1;if(retry<NEEDKEY_BEFORE_INITIALIZE_RETRIES){needkeyRetries.push(setTimeout(function(){onNeedKey(event,retry);},NEEDKEY_BEFORE_INITIALIZE_TIMEOUT));return;}}// Some browsers return initData as Uint8Array (IE), some as ArrayBuffer (Chrome).
// Convert to ArrayBuffer
var abInitData=event.key.initData;if(ArrayBuffer.isView(abInitData)){abInitData=abInitData.buffer;}// If key system has already been selected and initData already seen, then do nothing
if(keySystem){var initDataForKS=_CommonEncryption2.default.getPSSHForKeySystem(keySystem,abInitData);if(initDataForKS){// Check for duplicate initData
var currentInitData=protectionModel.getAllInitData();for(var i=0;i<currentInitData.length;i++){if(protectionKeyController.initDataEquals(initDataForKS,currentInitData[i])){logger.warn('DRM: Ignoring initData because we have already seen it!');return;}}}}logger.debug('DRM: initData:',String.fromCharCode.apply(null,new Uint8Array(abInitData)));var supportedKS=protectionKeyController.getSupportedKeySystems(abInitData,protDataSet);if(supportedKS.length===0){logger.debug('DRM: Received needkey event with initData, but we don\'t support any of the key systems!');return;}selectKeySystem(supportedKS,false);}function getKeySystems(){return protectionKeyController?protectionKeyController.getKeySystems():[];}function setKeySystems(keySystems){if(protectionKeyController){protectionKeyController.setKeySystems(keySystems);}}instance={initializeForMedia:initializeForMedia,createKeySession:createKeySession,loadKeySession:loadKeySession,removeKeySession:removeKeySession,closeKeySession:closeKeySession,setServerCertificate:setServerCertificate,setMediaElement:setMediaElement,setSessionType:setSessionType,setRobustnessLevel:setRobustnessLevel,setProtectionData:setProtectionData,getSupportedKeySystemsFromContentProtection:getSupportedKeySystemsFromContentProtection,getKeySystems:getKeySystems,setKeySystems:setKeySystems,stop:stop,reset:reset};setup();return instance;}ProtectionController.__dashjs_factory_name='ProtectionController';exports.default=dashjs.FactoryMaker.getClassFactory(ProtectionController);/* jshint ignore:line */
//# sourceMappingURL=ProtectionController.js.map
