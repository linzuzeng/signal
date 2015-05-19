var mic, fft;

function setup() {
 createCanvas(1000,600);
 noFill();
/* mic = new p5.Oscillator(220);
 mic.start();
 mic.amp(0.1);
  
   mic2= new p5.Oscillator(1000);
   mic2.start();
   mic2.amp(0.1);
   */
   mic2 = new p5.AudioIn();
   mic2.start();
  // mic2.connect(mic);
   fft = new p5.FFT(0,1024*8);
   fft.setInput(mic2);
 }

 function draw() {
   background(200);

   var spectrum = fft.analyze();

   beginShape();

   for (i = 80,a=0; (i)<(spectrum.length)/16; i*=1.0016) {
    a++;
    vertex(a, map(spectrum[Math.floor(i)], 0, 256, height, 0) );
  }
  endShape();
}