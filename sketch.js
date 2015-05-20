var mic, fft;

function setup() {
	createCanvas(1000,600);
	noFill();
	/*mic = new p5.Oscillator(1046.50);
	mic.start();
	mic.amp(1);

		mic1= new p5.Oscillator(2093.00);
		mic1.start();
		mic1.amp(1);
		mic1.connect(mic);
		*/
		mic2 = new p5.AudioIn();
		mic2.start();
		//mic2.connect(mic);
		fft = new p5.FFT(0,1024*8);
		fft.setInput(mic2);
	}

	function draw() {
		background(200);

		var spectrum = fft.analyze();

		beginShape();

		for (i = 80,a=0; (i)<(spectrum.length); i*=1.0028) {
			a++;
			vertex(a, map(spectrum[Math.floor(i)], 0, 256, height, 0) );
		}
		endShape();
		beginShape()
		for (i = 80,a=0; (i)<(spectrum.length); i*=1.0028) {
			a++
			switch (a%(62*4)) {
				case (8+62):{
					stroke("black");
					text("1",a+3,10);
					stroke("red");
					line(a,0,a,map(spectrum[Math.floor(i)], 0, 256, height, 0)  );
					break;
				}

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
				}
				case(8):{
					stroke("black");
					text("6",a+3,10);
					stroke("yellow");
					line(a,0,a,map(spectrum[Math.floor(i)], 0, 256, height, 0)  );
					break;
				}
			}

			if (a%(62/4)==(8)){
				stroke("black");
				text("?",a+3,30);
				stroke("white");
				line(a,0,a,50  );
			}
		}
		endShape();
	}