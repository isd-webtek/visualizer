navigator.getUserMedia = 
  navigator.getUserMedia ||
  // navigator.mediaDevices.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
    source,
    stream,
    //https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    analyser = audioCtx.createAnalyser(),
    gainNode = audioCtx.createGain(),
    container = document.querySelector(".visualizer-container"),
    canvas = document.querySelector(".visualizer"),
    canvasCtx = canvas.getContext("2d"),
    drawVisual,
    WIDTH,
    HEIGHT;

analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

canvas.setAttribute("width", container.clientWidth);
canvas.setAttribute("height", container.clientHeight);

if (navigator.getUserMedia) {
  // console.log('getUserMedia supported.');
  navigator.getUserMedia(
    {
      audio: true
    },
    function(stream) {
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      // gainNode.connect(audioCtx.destination);
      visualize();
    },
    function(err) {
      // console.log('The following gUM error occured: ' + err);
    }
  );
} else {
  // console.log('getUserMedia not supported on your browser!');
}

function visualize() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  //https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
  //32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768
  analyser.fftSize = 4096;
  var bufferLengthAlt = analyser.frequencyBinCount;
  var dataArrayAlt = new Uint8Array(bufferLengthAlt);

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
container.classList.toggle("preload");
  var drawAlt = function() {
    drawVisual = requestAnimationFrame(drawAlt);
    analyser.getByteFrequencyData(dataArrayAlt);

    canvasCtx.fillStyle = "rgb(0,0,0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = WIDTH / bufferLengthAlt * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLengthAlt; i++) {
      barHeight = dataArrayAlt[i] * 1.2;

      canvasCtx.fillStyle = "rgb(50,50," + (barHeight + 100) + ")";
      canvasCtx.fillRect(x, HEIGHT / 2 - barHeight, barWidth, barHeight);

      canvasCtx.fillStyle = "rgb(50,50," + (barHeight + 0) + ")";
      canvasCtx.fillRect(x, HEIGHT / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

    draw();
  };

  drawAlt();
}

//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
var bufferLength = analyser.fftSize;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);
function draw() {
  analyser.getByteTimeDomainData(dataArray);
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "rgb(50, 150, 255)";

  canvasCtx.beginPath();

  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

// window.addEventListener("resize", resize);

// var resizing = false;

// function resize() {
//   if (!resizing) {
//     resizing = true;

//     if (window.requestAnimationFrame) {
//       window.requestAnimationFrame(resizeCanvas);
//     } else {
//       setTimeout(resizeCanvas, 66);
//     }
//   }
// }

// function resizeCanvas(){
//   container = document.querySelector(".visualizer-container");
//   canvas.setAttribute("width", container.clientWidth);
//   canvas.setAttribute("height", container.clientHeight);
//   resizing = false;
// }