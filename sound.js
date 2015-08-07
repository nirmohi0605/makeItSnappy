var lastClap = (new Date()).getTime();

app.factory('sound', function() {

    return {
        Recording: function(cb) {
            var recorder = null;
            var recording = true;
            var audioInput = null;
            var volume = null;
            var audioContext = null;
            var callback = cb;

 

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia;

            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                        audio: true
                    },
                    function(stream) { //success

                        var AudioContext = window.AudioContext || window.webkitAudioContext;
                        audioContext = new AudioContext();
                        volume = audioContext.createGain(); // creates a gain node
                        audioInput = audioContext.createMediaStreamSource(stream); // creates an audio node from the mic stream
                        audioInput.connect(volume); // connect the stream to the gain node
                        recorder = audioContext.createScriptProcessor(2048, 1, 1);

                        var start = Date.now();

                        recorder.onaudioprocess = function(stream) {
                            if (!recording) return;
                            var left = stream.inputBuffer.getChannelData(0);
                            //var right = e.inputBuffer.getChannelData(1);
                            callback(new Float32Array(left));
                        };
                        volume.connect(recorder); // connect the recorder
                        recorder.connect(audioContext.destination);
                    },
                    function(error) { //failure
                        alert('Error capturing audio.');
                    }
                );
            } else {
                alert('getUserMedia not supported in this browser.');
            }
        },
        detectClap: function(data) {

            var t = (new Date()).getTime();
            if (t - lastClap < 200) return false; 
            var zeroCrossings = 0,
                highAmp = 0;
            for (var i = 1; i < data.length; i++) {
                if (Math.abs(data[i]) > 0.25) highAmp++; 
                if (data[i] > 0 && data[i - 1] < 0 || data[i] < 0 && data[i - 1] > 0) zeroCrossings++;
            }
            if (highAmp > 20 && zeroCrossings > 30) { 
                lastClap = t;
                return true;
            }
            return false;
        }
    }

})