function getMp3Stream(callback) {
    var selector = new FileSelector();
    selector.accept = '*.mp3';
    selector.selectSingleFile(function (mp3File) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();
        var gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = 0; // don't play for self

        var reader = new FileReader();
        reader.onload = (function (e) {
            // Import callback function
            // provides PCM audio data decoded as an audio buffer
            context.decodeAudioData(e.target.result, createSoundSource);
        });
        reader.readAsArrayBuffer(mp3File);

        function createSoundSource(buffer) {
            var soundSource = context.createBufferSource();
            soundSource.buffer = buffer;
            soundSource.start(0, 0 / 1000);
            soundSource.connect(gainNode);
            var destination = context.createMediaStreamDestination();
            soundSource.connect(destination);

            // durtion=second*1000 (milliseconds)
            callback(destination.stream, buffer.duration * 1000);
        }
    }, function () {
        document.querySelector('#btn-get-mixed-stream').disabled = false;
        alert('Please select mp3 file.');
    });
}

function FileSelector() {
    var selector = this;

    var noFileSelectedCallback = function () { };

    selector.selectSingleFile = function (callback, failure) {
        if (failure) {
            noFileSelectedCallback = failure;
        }

        selectFile(callback);
    };
    selector.selectMultipleFiles = function (callback, failure) {
        if (failure) {
            noFileSelectedCallback = failure;
        }

        selectFile(callback, true);
    };
    selector.selectDirectory = function (callback, failure) {
        if (failure) {
            noFileSelectedCallback = failure;
        }

        selectFile(callback, true, true);
    };

    selector.accept = '*.*';

    function selectFile(callback, multiple, directory) {
        callback = callback || function () { };

        var file = document.createElement('input');
        file.type = 'file';

        if (multiple) {
            file.multiple = true;
        }

        if (directory) {
            file.webkitdirectory = true;
        }

        file.accept = selector.accept;

        file.onclick = function () {
            file.clickStarted = true;
        };

        document.body.onfocus = function () {
            setTimeout(function () {
                if (!file.clickStarted) return;
                file.clickStarted = false;

                if (!file.value) {
                    noFileSelectedCallback();
                }
            }, 500);
        };

        file.onchange = function () {
            if (multiple) {
                if (!file.files.length) {
                    console.error('No file selected.');
                    return;
                }

                var arr = [];
                Array.from(file.files).forEach(function (file) {
                    file.url = file.webkitRelativePath;
                    arr.push(file);
                });
                callback(arr);
                return;
            }

            if (!file.files[0]) {
                console.error('No file selected.');
                return;
            }

            callback(file.files[0]);

            file.parentNode.removeChild(file);
        };
        file.style.display = 'none';
        (document.body || document.documentElement).appendChild(file);
        fireClickEvent(file);
    }

    function fireClickEvent(element) {
        if (typeof element.click === 'function') {
            element.click();
            return;
        }

        if (typeof element.change === 'function') {
            element.change();
            return;
        }

        if (typeof document.createEvent('Event') !== 'undefined') {
            var event = document.createEvent('Event');

            if (typeof event.initEvent === 'function' && typeof element.dispatchEvent === 'function') {
                event.initEvent('click', true, true);
                element.dispatchEvent(event);
                return;
            }
        }

        var event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(event);
    }
}