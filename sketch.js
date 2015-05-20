var mic, mic2,fft,song;
function mousePressed() {

}
function preload() {
  // Load a sound file
  song = loadSound('./Raindrops.mp3');
}
function startstop(){
	  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.stop();
    fft.setInput(mic2);
  } else {
    song.play();
    fft.setInput(song);
  }
}
function setup() {
  greeting = createElement('h2', 'Homework for Signal & Systems - FFT spectrum analyzer');
 greeting = createElement('h', 'Choose input:'); 
  button = createButton('file/mic');
  createElement('br'); 
 createElement('br'); 
  button.mousePressed(startstop);

	createCanvas(1200,600);
	noFill();
	//song = loadSound('./Damscray_DancingTiger.mp3');
	/*mic = new p5.Oscillator(880);
	mic.start();
	mic.amp(1);

		mic1= new p5.Oscillator(1760);
		mic1.start();
		mic1.amp(1);
		mic1.connect(mic);
		*/
		mic2 = new p5.AudioIn();
		mic2.amp(0.5);
		mic2.start();
		song.connect(mic2);
		
		fft = new p5.FFT(0,1024*8);
		//song.play();
		fft.setInput(song);
	}

	function draw() {
		background(200);

		var spectrum = fft.analyze();
		var spectrum_log = [];

		for (var i = 40, a=0; i<spectrum.length; i*=1.0028,a++) {
			spectrum_log[a]=0;
			for (b=Math.floor(i/1.0028);  b<=Math.floor(i); b++)
			{
				if (spectrum[b]>spectrum_log[a])
					spectrum_log[a]=spectrum[b];
			}
		}
		beginShape();

		for (var a = 0; a<spectrum_log.length; a++) {
			vertex(a, map(spectrum_log[a], 0, 256, height, 0) );
		}
		endShape();
		beginShape()
		for (var a = 0; a<spectrum_log.length; a++) {
			switch (a%(62*4)) {
				case (8+62):{
					stroke("black");
					text("1",a+3,10);
					stroke("red");
					line(a,0,a,map(spectrum_log[a], 0, 256, height, 0)  );
					break;
				}
			/*
				case (8+62*2):{
					stroke("black");
					text("0",a+3,10);
					stroke("green");
					line(a,0,a,map(spectrum[Math.floor(i)], 0, 256, height, 0)  );
					break;
				}
				case (8+62*3):{
					stroke("black");
					text("0",a+3,10);
					stroke("blue");
					line(a,0,a,map(spectrum[Math.floor(i)], 0, 256, height, 0)  );
					break;
				}*/
				case(8):{
					stroke("black");
					text("A",a+3,10);
					stroke("blue");
					line(a,0,a,map(spectrum_log[a], 0, 256, height, 0)  );
					break;
				}
			}

			
		}
		str=["6","6#" ,"7" ,"1" ,"1#" ,"2" ,"2#" ,"3" ,"4" ,"4#", "5" ,"5#" ];
		for (var n=0;n<60;n++)
		{
			a=8+248*n/12;
				stroke("black");

				text(str[n%12],a+3,30);
				stroke("white");
				line(a,0,a,100  );
			
		}
		endShape();
	}