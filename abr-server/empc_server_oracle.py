#!/usr/bin/env python
import copy

from http.server import BaseHTTPRequestHandler, HTTPServer
# import SocketServer
import base64
import urllib
import sys
import os
import json
import argparse
import time

import numpy as np

from abrAlgorithmCollection_dashlet import dash_sv, oracle_sv
os.environ['CUDA_VISIBLE_DEVICES']=''

import time

LOG_FILE = './results/log'
NET_TRACE = ''

CHUNK_LENGTH = 5.0

buffer_test = [
]


def get_probability(duration, swipetime):

    probability = [0.0 for i in range(int(duration - 0.000000001) + 1)]

    swipe_idx = int(swipetime - 0.000000001)

    probability[swipe_idx] = 1.0

    return probability


bitrate_folder = "/home/acer/Documents/ttstream/contentServer/dash/data/"

def parse_vid(url):
    return url.split("/")[5]

def get_probability_weights(events):
    # print(events)

    total_lengths = [int((event["duration"] - 0.00000000001) / 5.0) + 1 for event in events]

    probability_weights = []
    for i in range(len(total_lengths)):
        duration = events[i]['duration']
        oracle_swipetime = events[i]['oracle_swipetime']
        probability_weights.append(get_probability(duration, oracle_swipetime))

    return probability_weights


"""
Theoretically the bitrate profile for each chunk should be obtained from the 
manifest file, we directly get in from the file for this batch of implementation 
for simplicity since it is not in the core design of short video streaming algorithm 
"""
def get_bitrate(events):
    bitrate_list = []

    for eidx, event in enumerate(events):
        bitrate_list.append([])
        for i in range(len(event['chunksize_list'])):
            bitrate_list[eidx].append([])
            for j in range(len(event['chunksize_list'][i])):
                bitrate_list[eidx][i].append(event['chunksize_list'][i][j] * 8 / 1000.0) # in kb

    return bitrate_list

class DataLogger:
    def __init__(self, path):
        self.path = path

        self.download_events = {}
        self.swipe_events = {}


    def open(self):
        self.fd = open(self.path, "w")


    def close(self):
        self.fd.close()


    def append_swipe(self, event):
        # print(event)

        vid = parse_vid(event['url'])

        self.fd.write("[swipe]" + '\t' +
                      vid + '\t' +
                      str(event['swipeTime']) + '\t' +
                      str(event['viewTime']) + '\n')
        self.fd.flush()


    def append_download(self, event):
        vid = parse_vid(event['url'])
        if vid not in self.download_events.keys():
            self.download_events[vid] = []
        else:
            if event['lastRequest'] == len(self.download_events[vid]):

                self.fd.write("[download]" + '\t' +
                              vid + '\t' +
                              str(event['lastRequest']) + '\t' +
                              str(event['lastquality']) + '\t' +
                              str(event['lastChunkStartTime']) + '\t' +
                              str(event['lastChunkFinishTime']) + '\t' +
                              str(event['duration']) + '\t' +
                              str(event['lastChunkSize']) + '\n')

                self.fd.flush()

                self.download_events[vid].append([event['lastquality'],
                                                  event['lastChunkStartTime'],
                                                  event['lastChunkFinishTime'],
                                                  event['duration']])

            elif event['lastRequest'] + 1 > len(self.download_events[vid]):
                print("error happens in append_download")
            # do nothing when the data is already logged

def make_request_handler(input_dict, logger):

    class Request_Handler(BaseHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.input_dict = input_dict
            BaseHTTPRequestHandler.__init__(self, *args, **kwargs)

        def do_POST(self):

            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))

            if post_data["isinfo"] == -1:

                send_data= b"-2"
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.send_header('Content-Length', len(send_data))
                self.send_header('Access-Control-Allow-Origin', "*")
                self.end_headers()
                self.wfile.write(send_data)

                try:
                    sys.exit(0)
                except SystemExit:
                    os._exit(0)

            # print(post_data)
            if post_data["isinfo"] == 1:
                # print("info")
                input_dict["info_phase"] = True

                idx = post_data['playerId'] - post_data['currentPlayerIdx']

                if idx < 0:
                    idx += 5

                input_dict["events_record"][idx] = copy.deepcopy(post_data)

                logger.append_download(post_data)
                # throughput_estimator.append_throughput(post_data)

                # print(input_dict["events_record"])

                send_data= b"-2"
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.send_header('Content-Length', len(send_data))
                self.send_header('Access-Control-Allow-Origin', "*")
                self.end_headers()
                self.wfile.write(send_data)

                # return
            else:

                # print(post_data)
                if post_data['Type'] == 'swipe':
                    logger.append_swipe(post_data)

                    self.send_response(200)
                    self.send_header('Content-Type', 'text/plain')
                    self.send_header('Content-Length', 0)
                    self.send_header('Access-Control-Allow-Origin', "*")
                    self.end_headers()

                else:
                    if input_dict["info_phase"] == True:

                        if self.input_dict["ITER_CNT"] < len(buffer_test):
                            input_dict["buffer_plan"] = buffer_test[self.input_dict["ITER_CNT"]]
                            print(buffer_test[self.input_dict["ITER_CNT"]])
                            self.input_dict["ITER_CNT"] += 1
                        else:

                            probability_weights = get_probability_weights(input_dict["events_record"])
                            bitrate = get_bitrate(input_dict["events_record"])

                            throughput = input_dict["events_record"][0]["oracle_throughput"]

                            stime = time.time()

                            input_dict["buffer_plan"] = oracle_sv(input_dict["events_record"], probability_weights, bitrate, throughput)

                            print(input_dict["buffer_plan"])
                            etime = time.time()
                            print("Compute Time: %f" %(etime - stime))
                            self.input_dict["ITER_CNT"] += 1

                    input_dict["info_phase"] = False

                    idx = post_data['playerId'] - post_data['currentPlayerIdx']

                    if idx < 0:
                        idx += 5

                    return_code = input_dict["buffer_plan"][idx]

                    send_data = str.encode(str(return_code))

                    if return_code != -2:
                        lastRequestv = post_data['lastRequest']
                        currentPlayerIdxv = post_data['currentPlayerIdx']
                        playerIdv = post_data['playerId']
                        lastquality = post_data['lastquality']
                        print("""lastRequest: %d, currentPlayerIdx: %d, playerId: %d, lastquality"""%(lastRequestv, currentPlayerIdxv, playerIdv))
                        print(lastquality)
                        print(parse_vid(post_data['url']))

                    self.send_response(200)
                    self.send_header('Content-Type', 'text/plain')
                    self.send_header('Content-Length', len(send_data))
                    self.send_header('Access-Control-Allow-Origin', "*")
                    self.end_headers()
                    self.wfile.write(send_data)


        def do_GET(self):
            print('GOT REQ')
            self.send_response(200)
            #self.send_header('Cache-Control', 'Cache-Control: no-cache, no-store, must-revalidate max-age=0')
            self.send_header('Cache-Control', 'max-age=3000')
            self.send_header('Content-Length', 20)
            self.end_headers()
            self.wfile.write("console.log('here');")

        def log_message(self, format, *args):
            return

    return Request_Handler


def run(server_class=HTTPServer, port=8333,  log_file_path=LOG_FILE, nettrace=""):

    logger = DataLogger(log_file_path)
    logger.open()

    input_dict = {}
    input_dict["info_phase"] = True
    input_dict["ITER_CNT"] = 0
    input_dict["buffer_plan"] = [-2 for i in range(5)]
    input_dict["events_record"] = [{} for i in range(5)]

    # interface to abr server
    handler_class = make_request_handler(input_dict=input_dict, logger=logger)

    server_address = ('localhost', port)
    httpd = server_class(server_address, handler_class)
    print ('Listening on port ' + str(port))
    httpd.serve_forever()


def main(args):
    run(log_file_path=args.logfile)

if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument('--logfile', default='./out.log', help='The path to save processed data')
        args = parser.parse_args()

        main(args)
    except KeyboardInterrupt:
        print ("Keyboard interrupted.")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
