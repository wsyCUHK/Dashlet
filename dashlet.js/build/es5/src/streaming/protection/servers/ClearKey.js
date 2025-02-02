'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _KeyPair=require('../vo/KeyPair');var _KeyPair2=_interopRequireDefault(_KeyPair);var _ClearKeyKeySet=require('../vo/ClearKeyKeySet');var _ClearKeyKeySet2=_interopRequireDefault(_ClearKeyKeySet);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
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
 * CableLabs ClearKey license server implementation
 *
 * For testing purposes and evaluating potential uses for ClearKey, we have developed
 * a dirt-simple API for requesting ClearKey licenses from a remote server.
 *
 * @implements LicenseServer
 * @class
 */function ClearKey(){var instance=void 0;function getServerURLFromMessage(url/* message, messageType*/){return url;}function getHTTPMethod()/*messageType*/{return'POST';}function getResponseType()/*keySystemStr*/{return'json';}function getLicenseMessage(serverResponse/*, keySystemStr, messageType*/){if(!serverResponse.hasOwnProperty('keys')){return null;}var keyPairs=[];for(var i=0;i<serverResponse.keys.length;i++){var keypair=serverResponse.keys[i];var keyid=keypair.kid.replace(/=/g,'');var key=keypair.k.replace(/=/g,'');keyPairs.push(new _KeyPair2.default(keyid,key));}return new _ClearKeyKeySet2.default(keyPairs);}function getErrorResponse(serverResponse/*, keySystemStr, messageType*/){return String.fromCharCode.apply(null,new Uint8Array(serverResponse));}instance={getServerURLFromMessage:getServerURLFromMessage,getHTTPMethod:getHTTPMethod,getResponseType:getResponseType,getLicenseMessage:getLicenseMessage,getErrorResponse:getErrorResponse};return instance;}ClearKey.__dashjs_factory_name='ClearKey';exports.default=dashjs.FactoryMaker.getSingletonFactory(ClearKey);/* jshint ignore:line */
//# sourceMappingURL=ClearKey.js.map
