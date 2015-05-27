var mic, osc, fft, song, capture = false,
  capture_t = 0;
var last_three=[0,0,0];
var round_last = "";
var captured=piano;
fft_f = 8192;
low_f = 214.84375;
length_f = 248;
function checkthis(a){
  if (last_three[3]!=a)
  {
    last_three[1]=last_three[2];
    last_three[2]=last_three[3];
    last_three[3]=a;
    return (last_three[2]>last_three[1])&&(last_three[2]>last_three[3]);
  }
}
function mulitply1(a, standard) {
  if (standard) {
    var total1 = 0,
      base1 = 0,
      base2 = 0;
    for (var i = 0; i < standard.length; i++)
      total1 += 1.0 * a[i] * standard[i];
    for (var i = 0; i < standard.length; i++)
      base1 += standard[i] * standard[i];
    for (var i = 0; i < a.length; i++)
      base2 += a[i] * a[i];
    return  {like:(total1 * total1) / (base1 * base2),amp:total1 / base1};
  } else {
    return {like:-1,amp:-1};
  }

}


function preload() {
  // Load a sound file
  song = new p5.SoundFile("");
}

function startstop() {
  if (!song.isLoaded()) {
    button.html("mic");
    fft.setInput(mic);
  } else {
    if (song.isPlaying()) {
      button.html("mic");
      fft.setInput(mic);
      mic.connect(fft);
      song.stop();
    } else {
      button.html("file");
      song.play();
      fft.setInput(song);
      mic.disconnect();
    }
  }
}

function handleFiles(files) {
  song.setPath(files.data);
  button.html("file/mic");
}

function setup() {
  createElement('h2', 'Homework for Signal & Systems - FFT spectrum analyzer');
  createElement('h', 'Input:');
  button = createButton('mic');
  button.mousePressed(startstop);

  createElement('h', 'File:');
  createFileInput(handleFiles);
  prompt = createElement('h', 'Profile (DEFAULT:piano): ');
  button_capture = createButton("Capture")
  createElement('br');
  createElement('h', 'Identified notes: ');
  recog = createElement('h', '--');
  createElement('br');
  createElement('i', 'High-amp notes: ');
  notes = createElement('i', ' (amp-method, may be incorrect) ');
  createElement('br');



  createElement('br');
  createElement('br');
  createCanvas(1200, 500);
  createElement('br');
  createElement('br');
  result = createElement('h', '--');

    button_capture.mousePressed(function(){
      capture = !capture;
      if (capture){
        captured=[];
      }
      else {
        result.html(JSON.stringify(captured));
      }
    })

  noFill();

  /*
  mic = new p5.Oscillator(880*4);
  mic.start();
  mic.amp(1);

  	mic1= new p5.Oscillator(440*4);
  	mic1.start();
  	mic1.amp(1);
  	mic1.connect(mic);
  	*/
  mic = new p5.AudioIn();
  mic.start();
  mic.disconnect();

  fft = new p5.FFT(0, fft_f);
  fft.setInput(mic);

  osc = new p5.SinOsc();
  osc.start();

}

function draw() {
  background(200);

  var spectrum = fft.analyze();
  var spectrum_log = [];

  for (var i = low_f * fft_f / 22000, a = 0; i < spectrum.length; i *= Math.pow(2, 1 / length_f), a++) {
    spectrum_log[a] = 0;
    for (b = Math.floor(i / Math.pow(2, 1 / length_f)); b <= Math.floor(i); b++)
      if (spectrum[b] > spectrum_log[a])
        spectrum_log[a] = spectrum[b] * spectrum[b] ;
  }

  beginShape();
  for (var a = 0; a < spectrum_log.length; a++) {
    vertex(a, map(spectrum_log[a], 0, 256*256, height, 0));
  }
  endShape();

  //draw note
  var offset_f = Math.floor(Math.log(55 / low_f) / Math.log(Math.pow(2, 1 / length_f)));
  beginShape();
  var str = ["6", "6#", "7", "1", "1#", "2", "2#", "3", "4", "4#", "5", "5#"];
  var round_this = "";
  var got_freq = new Set();
  for (var a = 0, n = 0; a < spectrum_log.length; n++, a = Math.floor(offset_f + length_f * n / 12)) {
    switch (n % 12) {
      case 3:
        {
          stroke("black");
          text("1", a + 3, 10);
          stroke("blue");
          line(a, 0, a, map(spectrum_log[a], 0, 256*256, height, 0));
          break;
        }
      case 0:
        {
          stroke("black");
          text("A", a + 3, 10);
          stroke("red");
          line(a, 0, a, map(spectrum_log[a], 0, 256*256, height, 0));
          break;
        }
    }
    stroke("black");
    text(str[n % 12], a + 3, 30);
    stroke("white");
    line(a, 0, a, 100);
  }

  endShape();
  // amp trigger
  beginShape();
  for (var a = 0, n = 0; a < spectrum_log.length; n++, a = Math.floor(offset_f + length_f * n / 12)) {
    for (var bb = a - Math.floor(length_f / 12) - 1; bb < a + Math.floor(length_f / 12) + 1; bb++) {
      if ((spectrum_log[a] > (256 *256*3 / 4))) {
        if (spectrum_log[bb - length_f] > 256 *256* 3 / 4)
          break;
        if (spectrum_log[bb - length_f * 2] > 256 *256* 3 / 4)
          break;
        got_freq.add(n);
      }
    }
    if (spectrum_log[a] > 256 *256* 3 / 4) {
      stroke("red");
      line(a, 0, a, map(spectrum_log[a], 0, 256*256, height, 0));
    }
  }
  if (got_freq.size==0)
  {
      osc.amp(0);
  }
  else{
    //osc.amp(1);
    var lowest = 2147483648;
    got_freq.forEach(function(n) {
      round_this += Math.floor(n / 12) + " [" + str[n % 12] + "] ";
      if (lowest>n){
        lowest=n;
      }
      osc.freq(Math.round(440*Math.pow(2,(lowest-30)/12)));
    });
  }
  if ((round_last != round_this) )
    notes.html(round_this);
  round_last = round_this;
  endShape();

  // capture

  if (capture) {
    if (checkthis(max(spectrum_log)))
      {
        captured[capture_t++]=spectrum_log;
        console.log(capture_t);
      }
  }else {

   if (checkthis(max(spectrum_log)))
      {
    var best=-1;
    var best_id=0;
    var best_amp=0;
    for (var i=0; i<captured.length;i++){
      var now =mulitply1(spectrum_log, captured[i]);
      if (now.like>best)
      {
        best = now.like;
        best_id=i;
        best_amp=now.amp;
      }
    }

    var n=best_id+32;

    recog.html(best_id+32+" "+Math.floor((n-1) / 12-1) + " [" + str[(n+2) % 12] + "]   ["+Math.round(best * 100).toString() + "%, "+Math.round(best_amp*100)+"]"  );
    if ((best_amp*100<30)||(best*100<60))
      recog.html("");
  }
  }


}
